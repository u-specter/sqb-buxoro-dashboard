<?php
// GET /auth/me.php — returns the logged-in user, or 401 if not authenticated.

require_once __DIR__ . '/lib.php';

$user = sqb_current_user();
if (!$user) {
    sqb_json_response(['ok' => false, 'error' => 'unauthenticated'], 401);
}

sqb_json_response([
    'ok'   => true,
    'user' => [
        'username' => $user['username'],
        'role'     => $user['role'],
    ],
]);
