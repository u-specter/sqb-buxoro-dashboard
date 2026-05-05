<?php
// Gated static-file server for assets/data/*.json
// Apache rewrites direct .json requests in assets/data/ to here.

require_once __DIR__ . '/lib.php';

sqb_start_session();
if (!sqb_current_user()) {
    http_response_code(401);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'unauthenticated']);
    exit;
}

$path = $_GET['path'] ?? '';

// Whitelist: only assets/data/<safe-name>.json
if (!preg_match('#^assets/data/[A-Za-z0-9_\-]+\.json$#', $path)) {
    http_response_code(400);
    exit('Invalid path');
}

$root = realpath(__DIR__ . '/..');
$full = realpath($root . '/' . $path);
$base = realpath($root . '/assets/data');

if (!$full || !$base || strpos($full, $base) !== 0 || !is_file($full)) {
    http_response_code(404);
    exit('Not found');
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: private, max-age=300');
header('X-Content-Type-Options: nosniff');
readfile($full);
