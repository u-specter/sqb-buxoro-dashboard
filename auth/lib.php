<?php
// ─────────────────────────────────────────────────────────────
// SQB Bank platform — auth library
// Shared helpers: env loader, secure session config,
// bcrypt user storage, rate limiting, role checks.
// ─────────────────────────────────────────────────────────────

if (defined('SQB_AUTH_LIB')) return;
define('SQB_AUTH_LIB', 1);

const SQB_USERS_FILE     = __DIR__ . '/users.json';
const SQB_ATTEMPTS_FILE  = __DIR__ . '/login_attempts.json';
const SQB_AUDIT_LOG      = __DIR__ . '/audit.log';
const SQB_LOGIN_PAGE     = '/login.html';
const SQB_HOME_PAGE      = '/index.php';
const SQB_MAX_ATTEMPTS   = 5;
const SQB_LOCKOUT_WINDOW = 900; // 15 minutes

// TEMPORARY: login requirement switched off site-wide without deleting any
// auth logic below. Flip to `false` to re-enable mandatory login.
const SQB_AUTH_DISABLED  = true;

function sqb_load_env(): array {
    static $cache = null;
    if ($cache !== null) return $cache;
    $path = __DIR__ . '/../.env';
    $cache = [];
    if (!file_exists($path)) return $cache;
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue;
        $pos = strpos($line, '=');
        if ($pos === false) continue;
        $k = trim(substr($line, 0, $pos));
        $v = trim(substr($line, $pos + 1));
        if ((substr($v, 0, 1) === '"' && substr($v, -1) === '"') ||
            (substr($v, 0, 1) === "'" && substr($v, -1) === "'")) {
            $v = substr($v, 1, -1);
        }
        $cache[$k] = $v;
    }
    return $cache;
}

function sqb_env(string $key, ?string $default = null): ?string {
    $env = sqb_load_env();
    return $env[$key] ?? getenv($key) ?: $default;
}

function sqb_is_https(): bool {
    if (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off') return true;
    if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) &&
        strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https') return true;
    return false;
}

function sqb_start_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;

    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_secure',   sqb_is_https() ? '1' : '0');
    ini_set('session.cookie_samesite', 'Strict');
    ini_set('session.gc_maxlifetime',  '86400'); // 24h

    session_name('SQBSESSID');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'domain'   => '',
        'secure'   => sqb_is_https(),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

// ─────────────────────────────────────────────────────────────
// User storage (JSON file, bcrypt-hashed passwords)
// Schema: { "users": [ { "username", "hash", "role", "created_at" } ] }
// ─────────────────────────────────────────────────────────────
function sqb_users_load(): array {
    if (!file_exists(SQB_USERS_FILE)) return ['users' => []];
    $raw = file_get_contents(SQB_USERS_FILE);
    $data = json_decode($raw, true);
    if (!is_array($data) || !isset($data['users'])) return ['users' => []];
    return $data;
}

function sqb_users_save(array $data): bool {
    $tmp = SQB_USERS_FILE . '.tmp';
    $ok = file_put_contents($tmp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    if ($ok === false) return false;
    @chmod($tmp, 0600);
    return rename($tmp, SQB_USERS_FILE);
}

function sqb_user_find(string $username): ?array {
    $username = strtolower(trim($username));
    $data = sqb_users_load();
    foreach ($data['users'] as $u) {
        if (strtolower($u['username']) === $username) return $u;
    }
    return null;
}

function sqb_user_create(string $username, string $password, string $role = 'user', array $extra = [], int $bcrypt_cost = 12): array {
    $username = strtolower(trim($username));

    // Allow email-format usernames in addition to short alphanumeric ones
    $is_email     = (bool)filter_var($username, FILTER_VALIDATE_EMAIL);
    $is_simple    = (bool)preg_match('/^[a-z0-9._-]{3,32}$/', $username);
    if (!$is_email && !$is_simple) {
        return ['ok' => false, 'error' => 'invalid_username'];
    }

    // Allow short passwords ONLY when password equals an email-format username
    // (this is the case for OSNOVA-imported users where password = email).
    $min_pw_len = ($is_email && $password === $username) ? 6 : 8;
    if (strlen($password) < $min_pw_len) {
        return ['ok' => false, 'error' => 'weak_password'];
    }

    if (!in_array($role, ['admin', 'user'], true)) {
        return ['ok' => false, 'error' => 'invalid_role'];
    }
    if (sqb_user_find($username)) {
        return ['ok' => false, 'error' => 'user_exists'];
    }

    $data = sqb_users_load();
    $cost = max(8, min(14, $bcrypt_cost));
    $record = [
        'username'   => $username,
        'hash'       => password_hash($password, PASSWORD_BCRYPT, ['cost' => $cost]),
        'role'       => $role,
        'created_at' => date('c'),
    ];

    // Allowed metadata fields. Whitelist prevents arbitrary keys.
    $allowed = ['osnova_synced', 'fio', 'region', 'department',
                'position', 'bank', 'local_code'];
    foreach ($allowed as $k) {
        if (isset($extra[$k]) && $extra[$k] !== '') {
            $record[$k] = is_string($extra[$k]) ? $extra[$k] : (bool)$extra[$k];
        }
    }

    $data['users'][] = $record;
    if (!sqb_users_save($data)) {
        return ['ok' => false, 'error' => 'storage_failure'];
    }
    return ['ok' => true, 'username' => $username, 'role' => $role];
}

function sqb_user_verify(string $username, string $password): ?array {
    $u = sqb_user_find($username);
    if (!$u) {
        password_verify($password, '$2y$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv');
        return null;
    }
    if (!password_verify($password, $u['hash'])) return null;
    return $u;
}

// ─────────────────────────────────────────────────────────────
// Rate limiting (per-IP failed logins, 15 min window)
// ─────────────────────────────────────────────────────────────
function sqb_client_ip(): string {
    $h = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
    if ($h) return trim(explode(',', $h)[0]);
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

function sqb_attempts_load(): array {
    if (!file_exists(SQB_ATTEMPTS_FILE)) return [];
    $raw = file_get_contents(SQB_ATTEMPTS_FILE);
    $d = json_decode($raw, true);
    return is_array($d) ? $d : [];
}

function sqb_attempts_save(array $d): void {
    @file_put_contents(SQB_ATTEMPTS_FILE, json_encode($d), LOCK_EX);
    @chmod(SQB_ATTEMPTS_FILE, 0600);
}

function sqb_is_locked_out(string $ip): bool {
    $now = time();
    $all = sqb_attempts_load();
    $rec = $all[$ip] ?? null;
    if (!$rec) return false;
    $rec['times'] = array_filter($rec['times'] ?? [], fn($t) => $t > $now - SQB_LOCKOUT_WINDOW);
    return count($rec['times']) >= SQB_MAX_ATTEMPTS;
}

function sqb_record_failure(string $ip): void {
    $now = time();
    $all = sqb_attempts_load();
    $rec = $all[$ip] ?? ['times' => []];
    $rec['times'] = array_filter($rec['times'], fn($t) => $t > $now - SQB_LOCKOUT_WINDOW);
    $rec['times'][] = $now;
    $all[$ip] = $rec;
    sqb_attempts_save($all);
}

function sqb_clear_failures(string $ip): void {
    $all = sqb_attempts_load();
    if (isset($all[$ip])) {
        unset($all[$ip]);
        sqb_attempts_save($all);
    }
}

// ─────────────────────────────────────────────────────────────
// Auth state
// ─────────────────────────────────────────────────────────────
function sqb_login_user(array $user): void {
    sqb_start_session();
    session_regenerate_id(true);
    $_SESSION['user'] = [
        'username' => $user['username'],
        'role'     => $user['role'],
        'login_at' => time(),
    ];
}

function sqb_logout_user(): void {
    sqb_start_session();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

function sqb_current_user(): ?array {
    sqb_start_session();
    if (isset($_SESSION['user'])) return $_SESSION['user'];
    // Auth disabled: synthesize a guest identity so gates pass without a
    // real session, while `role` still fails admin checks (see sqb_require_admin*).
    if (SQB_AUTH_DISABLED) return ['username' => 'guest', 'role' => 'guest'];
    return null;
}

function sqb_require_auth(): void {
    if (!sqb_current_user()) {
        $next = $_SERVER['REQUEST_URI'] ?? SQB_HOME_PAGE;
        header('Location: ' . SQB_LOGIN_PAGE . '?next=' . urlencode($next));
        exit;
    }
}

function sqb_require_admin(): void {
    $u = sqb_current_user();
    if (!$u || ($u['role'] ?? '') !== 'admin') {
        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'admin_required']);
        exit;
    }
}

// Page-level admin guard — redirects non-admins to home page.
// Use on UI pages (vs sqb_require_admin which returns JSON 403 for APIs).
function sqb_require_admin_page(): void {
    sqb_require_auth();
    $u = sqb_current_user();
    if (($u['role'] ?? '') !== 'admin') {
        header('Location: ' . SQB_HOME_PAGE);
        exit;
    }
}

// API key auth — for headless calls to user-management API
function sqb_api_key_valid(): bool {
    $expected = sqb_env('AUTH_API_KEY');
    if (!$expected) return false;
    $given = $_SERVER['HTTP_X_API_KEY'] ?? '';
    return $given !== '' && hash_equals($expected, $given);
}

function sqb_json_response($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function sqb_read_json_body(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

// ─────────────────────────────────────────────────────────────
// Audit log — appends one line per security event to auth/audit.log
// Format: [YYYY-MM-DD HH:MM:SS] EVENT_NAME       key=value key=value ua="…"
// File is denied via auth/.htaccess (matches *.log).
// ─────────────────────────────────────────────────────────────
function sqb_audit_log(string $event, array $fields = []): void {
    $parts   = [];
    $parts[] = '[' . date('Y-m-d H:i:s') . ']';
    $parts[] = str_pad($event, 18);

    $fields = array_merge(['ip' => sqb_client_ip()], $fields);

    foreach ($fields as $k => $v) {
        if ($v === null || $v === '') continue;
        $v = (string)$v;
        $v = str_replace(["\n", "\r", "\t"], ' ', $v);
        if (strlen($v) > 200) $v = substr($v, 0, 197) . '...';
        if (preg_match('/[\s"]/', $v)) {
            $v = '"' . str_replace('"', '\\"', $v) . '"';
        }
        $parts[] = $k . '=' . $v;
    }

    $ua = (string)($_SERVER['HTTP_USER_AGENT'] ?? '');
    $ua = substr(str_replace(["\n", "\r", "\t"], ' ', $ua), 0, 200);
    $parts[] = 'ua="' . str_replace('"', '\\"', $ua) . '"';

    $line = implode(' ', $parts) . "\n";
    @file_put_contents(SQB_AUDIT_LOG, $line, FILE_APPEND | LOCK_EX);
    @chmod(SQB_AUDIT_LOG, 0600);
}

// Read the last N lines of the audit log (newest first). Returns array of strings.
function sqb_audit_tail(int $n = 100): array {
    if (!file_exists(SQB_AUDIT_LOG)) return [];
    $size = filesize(SQB_AUDIT_LOG);
    if ($size === 0) return [];
    $fp = @fopen(SQB_AUDIT_LOG, 'r');
    if (!$fp) return [];

    $chunk    = 8192;
    $pos      = $size;
    $buffer   = '';
    $newlines = 0;
    while ($pos > 0 && $newlines <= $n) {
        $read = min($chunk, $pos);
        $pos -= $read;
        fseek($fp, $pos);
        $buffer = fread($fp, $read) . $buffer;
        $newlines = substr_count($buffer, "\n");
    }
    fclose($fp);

    $lines = preg_split('/\r?\n/', rtrim($buffer, "\r\n"));
    if (count($lines) > $n) $lines = array_slice($lines, -$n);
    return array_reverse($lines);
}
