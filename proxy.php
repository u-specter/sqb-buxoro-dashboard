<?php
// ─────────────────────────────────────────────────────────────
// OpenAI proxy — calls api.openai.com using API key from .env
// Place this file at site root: https://sqb-mahalla.uz/proxy.php
// Requires an authenticated session (see /auth/lib.php).
// ─────────────────────────────────────────────────────────────

require_once __DIR__ . '/auth/lib.php';

// CORS — allow only your own domain
header('Access-Control-Allow-Origin: https://sqb-mahalla.uz');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Require authenticated session — prevents anonymous abuse of the OpenAI key
sqb_start_session();
if (!sqb_current_user()) {
    http_response_code(401);
    echo json_encode(['error' => 'unauthenticated']);
    exit;
}

// ─────────────────────────────────────────────────────────────
// Load API key from .env (file is at the same directory)
// ─────────────────────────────────────────────────────────────
function loadEnv($path) {
    if (!file_exists($path)) return [];
    $env = [];
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue;
        $pos = strpos($line, '=');
        if ($pos === false) continue;
        $key = trim(substr($line, 0, $pos));
        $val = trim(substr($line, $pos + 1));
        // strip optional surrounding quotes
        if ((substr($val, 0, 1) === '"' && substr($val, -1) === '"') ||
            (substr($val, 0, 1) === "'" && substr($val, -1) === "'")) {
            $val = substr($val, 1, -1);
        }
        $env[$key] = $val;
    }
    return $env;
}

$env = loadEnv(__DIR__ . '/.env');
$apiKey = $env['OPENAI_API_KEY'] ?? getenv('OPENAI_API_KEY');

if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['error' => 'OPENAI_API_KEY not configured on server']);
    exit;
}

// ─────────────────────────────────────────────────────────────
// Forward request body to OpenAI
// ─────────────────────────────────────────────────────────────
$body = file_get_contents('php://input');

$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $body,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
    ],
    CURLOPT_TIMEOUT        => 120,
    CURLOPT_CONNECTTIMEOUT => 15,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Upstream fetch failed', 'detail' => $curlErr]);
    exit;
}

http_response_code($httpCode ?: 502);
echo $response;
