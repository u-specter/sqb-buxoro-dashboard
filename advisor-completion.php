<?php
// ─────────────────────────────────────────────────────────────
// SQB advisor — prompt-based chat/completions endpoint
// Reads assets/prompts/{district_slug}_chat_completion.json,
// substitutes {{kredit_miqdori}} / {{kredit_muddati}} / {{kredit_foizi}} /
// {{USER_QUESTION}} placeholders, and forwards to OpenAI.
//
// Request body (POST JSON):
//   {
//     "district_slug": "qoqon",
//     "kredit_miqdori": 100,        // optional, default 100 (mln UZS)
//     "kredit_muddati": 36,         // optional, default 36 (months)
//     "kredit_foizi": 25,           // optional, default 25 (%)
//     "user_question": "..."        // optional
//   }
// Returns: the parsed JSON object matching the prompt's response_format schema.
// ─────────────────────────────────────────────────────────────

require_once __DIR__ . '/auth/lib.php';

header('Access-Control-Allow-Origin: https://sqb-mahalla.uz');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']); exit;
}

sqb_start_session();
if (!sqb_current_user()) {
    http_response_code(401);
    echo json_encode(['error' => 'unauthenticated']); exit;
}

function load_env_file($path) {
    if (!file_exists($path)) return [];
    $env = [];
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue;
        $pos = strpos($line, '=');
        if ($pos === false) continue;
        $k = trim(substr($line, 0, $pos));
        $v = trim(substr($line, $pos + 1));
        if ((substr($v,0,1)==='"' && substr($v,-1)==='"') || (substr($v,0,1)==="'" && substr($v,-1)==="'")) {
            $v = substr($v, 1, -1);
        }
        $env[$k] = $v;
    }
    return $env;
}

$env       = load_env_file(__DIR__ . '/.env');
$apiKey    = $env['OPENAI_API_KEY'] ?? getenv('OPENAI_API_KEY');
$orgId     = $env['OPENAI_ORG_ID']     ?? getenv('OPENAI_ORG_ID')     ?: '';
$projectId = $env['OPENAI_PROJECT_ID'] ?? getenv('OPENAI_PROJECT_ID') ?: '';
if (!$apiKey) { http_response_code(500); echo json_encode(['error' => 'OPENAI_API_KEY missing']); exit; }

$body = json_decode(file_get_contents('php://input'), true) ?: [];
$slug = isset($body['district_slug']) ? (string)$body['district_slug'] : '';

// Whitelist slug: lowercase letters, digits, underscore only
if ($slug === '' || !preg_match('/^[a-z0-9_]{2,40}$/', $slug)) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid district_slug']); exit;
}

$promptPath = __DIR__ . '/assets/prompts/' . $slug . '_chat_completion.json';
if (!file_exists($promptPath)) {
    http_response_code(404);
    echo json_encode(['error' => 'prompt file not found', 'slug' => $slug]); exit;
}

$promptRaw = file_get_contents($promptPath);
$prompt    = json_decode($promptRaw, true);
if (!is_array($prompt) || !isset($prompt['messages']) || !is_array($prompt['messages'])) {
    http_response_code(500);
    echo json_encode(['error' => 'prompt file malformed']); exit;
}

// Apply defaults and sanitize loan terms
$kreditMiqdori = isset($body['kredit_miqdori']) ? (float)$body['kredit_miqdori'] : 100.0;
$kreditMuddati = isset($body['kredit_muddati']) ? (int)$body['kredit_muddati']   : 36;
$kreditFoizi   = isset($body['kredit_foizi'])   ? (float)$body['kredit_foizi']   : 25.0;
$userQuestion  = isset($body['user_question'])  ? trim((string)$body['user_question']) : '';

if ($kreditMiqdori <= 0)  $kreditMiqdori = 100.0;
if ($kreditMuddati <= 0)  $kreditMuddati = 36;
if ($kreditFoizi  < 0)    $kreditFoizi   = 25.0;
if ($kreditMiqdori > 100000) $kreditMiqdori = 100000;
if ($kreditMuddati > 360)    $kreditMuddati = 360;
if ($kreditFoizi   > 100)    $kreditFoizi   = 100;

if ($userQuestion === '') {
    $userQuestion = 'Берилган туман ва кредит шартлари асосида комплекс бизнес тавсияси ва молиявий режа тузиб бер.';
}

// Substitute placeholders in messages
$replacements = [
    '{{kredit_miqdori}}' => (string)$kreditMiqdori,
    '{{kredit_muddati}}' => (string)$kreditMuddati,
    '{{kredit_foizi}}'   => (string)$kreditFoizi,
    '{{USER_QUESTION}}'  => $userQuestion,
];

foreach ($prompt['messages'] as &$m) {
    if (!isset($m['content']) || !is_string($m['content'])) continue;
    $m['content'] = strtr($m['content'], $replacements);
}
unset($m);

// Forward to OpenAI
$payload = $prompt; // already has model, temperature, max_tokens, response_format, messages
$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($payload, JSON_UNESCAPED_UNICODE),
    CURLOPT_HTTPHEADER     => array_merge(
        [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey,
        ],
        $orgId     !== '' ? ['OpenAI-Organization: ' . $orgId] : [],
        $projectId !== '' ? ['OpenAI-Project: ' . $projectId]  : []
    ),
    CURLOPT_TIMEOUT        => 180,
    CURLOPT_CONNECTTIMEOUT => 15,
]);
$raw      = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

if ($raw === false) {
    http_response_code(502);
    echo json_encode(['error' => 'upstream fetch failed', 'detail' => $curlErr]); exit;
}

$resp = json_decode($raw, true);
if ($httpCode >= 400 || !is_array($resp)) {
    http_response_code($httpCode ?: 502);
    echo $raw; exit;
}

// Extract the assistant message content (JSON string due to response_format)
$content = '';
if (isset($resp['choices'][0]['message']['content'])) {
    $content = (string)$resp['choices'][0]['message']['content'];
}

$plan = json_decode($content, true);
if (!is_array($plan)) {
    http_response_code(502);
    echo json_encode([
        'error'   => 'model response not valid JSON',
        'content' => $content,
        'usage'   => $resp['usage'] ?? null,
    ]); exit;
}

echo json_encode([
    'plan'  => $plan,
    'usage' => $resp['usage'] ?? null,
    'slug'  => $slug,
    'loan'  => [
        'kredit_miqdori' => $kreditMiqdori,
        'kredit_muddati' => $kreditMuddati,
        'kredit_foizi'   => $kreditFoizi,
    ],
], JSON_UNESCAPED_UNICODE);
