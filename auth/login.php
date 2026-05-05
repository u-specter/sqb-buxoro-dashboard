<?php
// POST /auth/login.php  { username, password }
// Returns: { ok: true, user } on success, { ok: false, error } otherwise.

require_once __DIR__ . '/lib.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sqb_json_response(['ok' => false, 'error' => 'method_not_allowed'], 405);
}

$ip = sqb_client_ip();

$body = sqb_read_json_body();
if (!$body) $body = $_POST;

$username = trim((string)($body['username'] ?? ''));
$password = (string)($body['password'] ?? '');

if (sqb_is_locked_out($ip)) {
    sqb_audit_log('LOGIN_BLOCKED', ['user' => $username]);
    sqb_json_response(['ok' => false, 'error' => 'rate_limited',
        'message' => 'Too many failed attempts. Try again in 15 minutes.'], 429);
}

if ($username === '' || $password === '') {
    sqb_json_response(['ok' => false, 'error' => 'missing_credentials'], 400);
}

$user = sqb_user_verify($username, $password);
if (!$user) {
    sqb_record_failure($ip);
    sqb_audit_log('LOGIN_FAIL', ['user' => $username]);
    usleep(random_int(150000, 400000)); // jitter to slow brute force
    sqb_json_response(['ok' => false, 'error' => 'invalid_credentials'], 401);
}

sqb_clear_failures($ip);
sqb_login_user($user);
sqb_audit_log('LOGIN_OK', ['user' => $user['username'], 'role' => $user['role']]);

sqb_json_response([
    'ok'   => true,
    'user' => [
        'username' => $user['username'],
        'role'     => $user['role'],
    ],
]);
