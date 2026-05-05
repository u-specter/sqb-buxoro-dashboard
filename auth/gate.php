<?php
// Page-level auth gate.
// Include at the very top of every protected page with:
//     require __DIR__ . '/auth/gate.php';
// Redirects to /login.html if there is no valid session.

require_once __DIR__ . '/lib.php';

if (!file_exists(SQB_USERS_FILE)) {
    header('Location: /setup.php');
    exit;
}

sqb_start_session();
sqb_require_auth();

// Expose current user to the page via a small inline script
$__sqb_user = sqb_current_user();
header('Cache-Control: no-store, no-cache, must-revalidate, private');
