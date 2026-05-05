<?php
// GET or POST /auth/logout.php — destroys session and redirects to /login.html

require_once __DIR__ . '/lib.php';

sqb_logout_user();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    sqb_json_response(['ok' => true]);
}

header('Location: ' . SQB_LOGIN_PAGE);
exit;
