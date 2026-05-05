<?php
// User management API.
// Authentication: admin session OR X-API-Key header (AUTH_API_KEY in .env).
//
//   GET  /auth/users.php          → list users (without password hashes)
//   POST /auth/users.php          → create user { username, password, role? }
//   DELETE /auth/users.php?username=foo → delete user

require_once __DIR__ . '/lib.php';

// ── Auth: admin session OR API key ──────────────────────────
$current = sqb_current_user();
$is_admin   = $current && ($current['role'] ?? '') === 'admin';
$has_apikey = sqb_api_key_valid();

if (!$is_admin && !$has_apikey) {
    sqb_json_response(['ok' => false, 'error' => 'unauthorized'], 401);
}

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: list users ─────────────────────────────────────────
if ($method === 'GET') {
    $data = sqb_users_load();
    $list = array_map(fn($u) => [
        'username'   => $u['username'],
        'role'       => $u['role'],
        'created_at' => $u['created_at'] ?? null,
    ], $data['users']);
    sqb_json_response(['ok' => true, 'users' => $list]);
}

// ── POST: create user ───────────────────────────────────────
if ($method === 'POST') {
    $body = sqb_read_json_body();
    if (!$body) $body = $_POST;

    $username = trim((string)($body['username'] ?? ''));
    $password = (string)($body['password'] ?? '');
    $role     = (string)($body['role'] ?? 'user');

    if ($username === '' || $password === '') {
        sqb_json_response(['ok' => false, 'error' => 'missing_fields',
            'message' => 'username and password are required'], 400);
    }

    $result = sqb_user_create($username, $password, $role);
    if (!$result['ok']) {
        $messages = [
            'invalid_username' => 'Username must be 3–32 chars: a-z, 0-9, dot, dash, underscore',
            'weak_password'    => 'Password must be at least 8 characters',
            'invalid_role'     => 'Role must be "admin" or "user"',
            'user_exists'      => 'A user with that username already exists',
            'storage_failure'  => 'Failed to write user store',
        ];
        sqb_json_response([
            'ok'      => false,
            'error'   => $result['error'],
            'message' => $messages[$result['error']] ?? 'Could not create user',
        ], 400);
    }
    sqb_audit_log('USER_CREATED', [
        'user' => $result['username'],
        'role' => $result['role'],
        'by'   => $is_admin ? $current['username'] : 'api_key',
    ]);
    sqb_json_response(['ok' => true, 'user' => [
        'username' => $result['username'],
        'role'     => $result['role'],
    ]], 201);
}

// ── DELETE: remove user ─────────────────────────────────────
if ($method === 'DELETE') {
    $username = strtolower(trim((string)($_GET['username'] ?? '')));
    if ($username === '') {
        sqb_json_response(['ok' => false, 'error' => 'missing_username'], 400);
    }
    $data  = sqb_users_load();
    $found = false;
    $kept  = [];
    foreach ($data['users'] as $u) {
        if (strtolower($u['username']) === $username) { $found = true; continue; }
        $kept[] = $u;
    }
    if (!$found) {
        sqb_json_response(['ok' => false, 'error' => 'user_not_found'], 404);
    }
    if (count($kept) === 0) {
        sqb_json_response(['ok' => false, 'error' => 'cannot_delete_last_user',
            'message' => 'Refusing to delete the last user — you would lock yourself out.'], 400);
    }
    $data['users'] = $kept;
    if (!sqb_users_save($data)) {
        sqb_json_response(['ok' => false, 'error' => 'storage_failure'], 500);
    }
    sqb_audit_log('USER_DELETED', [
        'user' => $username,
        'by'   => $is_admin ? $current['username'] : 'api_key',
    ]);
    sqb_json_response(['ok' => true, 'deleted' => $username]);
}

sqb_json_response(['ok' => false, 'error' => 'method_not_allowed'], 405);
