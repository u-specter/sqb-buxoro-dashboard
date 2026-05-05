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
const SQB_LOGIN_PAGE     = '/login.html';
const SQB_HOME_PAGE      = '/index.php';
const SQB_MAX_ATTEMPTS   = 5;
const SQB_LOCKOUT_WINDOW = 900; // 15 minutes

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

function sqb_user_create(string $username, string $password, string $role = 'user'): array {
    $username = strtolower(trim($username));
    if (!preg_match('/^[a-z0-9._-]{3,32}$/', $username)) {
        return ['ok' => false, 'error' => 'invalid_username'];
    }
    if (strlen($password) < 8) {
        return ['ok' => false, 'error' => 'weak_password'];
    }
    if (!in_array($role, ['admin', 'user'], true)) {
        return ['ok' => false, 'error' => 'invalid_role'];
    }
    if (sqb_user_find($username)) {
        return ['ok' => false, 'error' => 'user_exists'];
    }
    $data = sqb_users_load();
    $data['users'][] = [
        'username'   => $username,
        'hash'       => password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]),
        'role'       => $role,
        'created_at' => date('c'),
    ];
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
    return $_SESSION['user'] ?? null;
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
