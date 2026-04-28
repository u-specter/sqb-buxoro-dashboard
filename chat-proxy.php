<?php
// ─────────────────────────────────────────────────────────────
// SQB chat proxy — Responses API + file_search + structured JSON
// Always returns: { answer, target_section } enforced via json_schema.
// Frontend POSTs: { messages:[{role,content},...], tuman?, stream?:bool }
// ─────────────────────────────────────────────────────────────

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']); exit;
}

function load_env($path) {
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

$env    = load_env(__DIR__ . '/.env');
$apiKey = $env['OPENAI_API_KEY'] ?? getenv('OPENAI_API_KEY');
if (!$apiKey) { http_response_code(500); echo json_encode(['error' => 'OPENAI_API_KEY missing']); exit; }
$orgId     = $env['OPENAI_ORG_ID']     ?? getenv('OPENAI_ORG_ID')     ?: '';
$projectId = $env['OPENAI_PROJECT_ID'] ?? getenv('OPENAI_PROJECT_ID') ?: '';

function openai_auth_headers($apiKey, $orgId, $projectId, $extra = []) {
    $h = ['Authorization: Bearer ' . $apiKey];
    if ($orgId !== '')     $h[] = 'OpenAI-Organization: ' . $orgId;
    if ($projectId !== '') $h[] = 'OpenAI-Project: ' . $projectId;
    return array_merge($h, $extra);
}

$vs = @json_decode(@file_get_contents(__DIR__ . '/api/vector-store.json'), true);
$vectorStoreId = $vs['vector_store_id'] ?? null;
if (!$vectorStoreId) {
    http_response_code(500);
    echo json_encode(['error' => 'vector-store.json missing vector_store_id']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true) ?: [];
$messages = $body['messages'] ?? [];
$tuman    = isset($body['tuman']) ? trim((string)$body['tuman']) : '';
$stream   = !empty($body['stream']);

if (!is_array($messages) || count($messages) === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'messages[] required']); exit;
}

// ─────────────────────────────────────────────────────────────
// SYSTEM PROMPT — analyst role, strict grounding, JSON-only output
// ─────────────────────────────────────────────────────────────
$systemText = <<<TXT
You are an economic analyst, business advisor, and data interpreter for the SQB Bank regional intelligence platform (sqb-mahalla.uz).
You are NOT a chatbot, NOT a storyteller, NOT a generalist assistant.

KNOWLEDGE SOURCE — STRICT
- Your ONLY knowledge source is the file_search tool connected to a vector store of district-level JSON datasets (population, economy, tourism, labor, infrastructure, education, business, credits, trade, etc.).
- ZERO hallucination. NEVER invent figures, names, dates, or facts.
- If the requested information is not retrievable from the vector store, return:
    {"answer":"No data available in platform","target_section":"general"}

LANGUAGE
- Reply in the same language and script the user used (Uzbek Latin, Uzbek Cyrillic, Russian, or English). Do not translate.

FORMATTING (the "answer" field)
- Concise, analytical, professional. No filler.
- Markdown is allowed inside "answer": **bold** for key figures/labels, lists for enumerations, short paragraphs.
- Quote numbers exactly as they appear in the source. Do not round unless the user asks.
- NEVER mention source filenames (boysun.json, *_data.json), the words "Manba", "Манба", "Source", "Источник", "Reference", "file_search", "vector store", or citation markers like 【...】 or [1†...].

INTENT → SECTION (target_section)
Analyse the user's question and return EXACTLY ONE of these section keys, choosing the MOST relevant:
- "population"      → demographics, mahalla counts, households, families, population size/density
- "economy"         → industry, services, GDP, agriculture, salaries, exports of goods, macroeconomic indicators
- "tourism"         → tourists, hotels, attractions, UNESCO heritage, tourism revenue
- "labor"           → employment, unemployment, jobs created, workforce, migration for work
- "infrastructure"  → roads, electricity, water, irrigation, internet, transport, utilities
- "education"       → schools, universities, literacy, students, teachers
- "business"        → entrepreneurship, SMEs, new enterprises, business ideas/opportunities, mahalla business
- "credits"         → bank loans, banking, credit portfolios, financial services
- "trade"           → import/export trade balance, marketplaces, foreign trade activity
- "general"         → if the question is broad, mixes many sections, or no data is found
If multiple sections apply, choose the SINGLE most-relevant one (the dominant intent).

OUTPUT — STRICT
You MUST return a single JSON object exactly matching the provided schema:
{ "answer": string, "target_section": one of the enum values above }
Never return prose outside the JSON. Never wrap the JSON in code fences.
TXT;

if ($tuman !== '') {
    $systemText .= "\n\nCURRENT CONTEXT: the user is viewing the \"$tuman\" district page. If the question is ambiguous about which district, prefer data for \"$tuman\".";
}

$input = [['role' => 'system', 'content' => $systemText]];
foreach ($messages as $m) {
    if (!isset($m['role'], $m['content'])) continue;
    $role = $m['role'] === 'assistant' ? 'assistant' : 'user';
    $input[] = ['role' => $role, 'content' => (string)$m['content']];
}

// JSON Schema — enforced server-side by the model
$schema = [
    'type' => 'object',
    'properties' => [
        'answer' => [
            'type' => 'string',
            'description' => 'The grounded answer text (markdown allowed). "No data available in platform" if the vector store has no matching data.',
        ],
        'target_section' => [
            'type'        => 'string',
            'enum'        => ['population','economy','tourism','labor','infrastructure','education','business','credits','trade','general'],
            'description' => 'The single UI section the answer most belongs to.',
        ],
    ],
    'required'             => ['answer','target_section'],
    'additionalProperties' => false,
];

$payload = [
    'model' => 'gpt-4o-mini',
    'input' => $input,
    'tools' => [[
        'type'             => 'file_search',
        'vector_store_ids' => [$vectorStoreId],
        'max_num_results'  => 8,
    ]],
    'temperature' => 0.1,
    'text' => [
        'format' => [
            'type'   => 'json_schema',
            'name'   => 'sqb_advisor_response',
            'strict' => true,
            'schema' => $schema,
        ],
    ],
];

// ─────────────────────────────────────────────────────────────
// STREAMING MODE — pass raw SSE bytes through to the browser.
// ─────────────────────────────────────────────────────────────
if ($stream) {
    header('Content-Type: text/event-stream; charset=utf-8');
    header('Cache-Control: no-cache, no-transform');
    header('Connection: keep-alive');
    header('X-Accel-Buffering: no');           // nginx
    header('Content-Encoding: identity');      // disable gzip
    if (function_exists('apache_setenv')) {
        @apache_setenv('no-gzip', '1');
        @apache_setenv('dont-vary', '1');
    }
    @ini_set('zlib.output_compression', '0');
    @ini_set('output_buffering', '0');
    @ini_set('implicit_flush', '1');
    while (ob_get_level() > 0) { @ob_end_flush(); }
    ob_implicit_flush(true);

    $payload['stream'] = true;

    $ch = curl_init('https://api.openai.com/v1/responses');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_HTTPHEADER     => openai_auth_headers($apiKey, $orgId, $projectId, [
            'Content-Type: application/json',
            'Accept: text/event-stream',
        ]),
        CURLOPT_TIMEOUT        => 180,
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_WRITEFUNCTION  => function ($curl, $chunk) {
            echo $chunk;
            @ob_flush();
            @flush();
            return strlen($chunk);
        },
    ]);
    curl_exec($ch);
    curl_close($ch);
    exit;
}

// ─────────────────────────────────────────────────────────────
// NON-STREAMING MODE — single JSON response.
// ─────────────────────────────────────────────────────────────
$ch = curl_init('https://api.openai.com/v1/responses');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($payload, JSON_UNESCAPED_UNICODE),
    CURLOPT_HTTPHEADER     => openai_auth_headers($apiKey, $orgId, $projectId, [
        'Content-Type: application/json',
    ]),
    CURLOPT_TIMEOUT        => 120,
    CURLOPT_CONNECTTIMEOUT => 15,
]);
$raw  = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err  = curl_error($ch);
curl_close($ch);

if ($raw === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Upstream fetch failed', 'detail' => $err]); exit;
}
$resp = json_decode($raw, true);
if ($code >= 400 || !is_array($resp)) {
    http_response_code($code ?: 502);
    echo $raw; exit;
}

// Extract the JSON-string output produced under the schema
$jsonText = '';
if (!empty($resp['output_text'])) {
    $jsonText = (string)$resp['output_text'];
}
if ($jsonText === '' && !empty($resp['output']) && is_array($resp['output'])) {
    foreach ($resp['output'] as $item) {
        if (($item['type'] ?? '') !== 'message') continue;
        foreach (($item['content'] ?? []) as $c) {
            if (($c['type'] ?? '') === 'output_text') {
                $jsonText = (string)($c['text'] ?? '');
                break 2;
            }
        }
    }
}

$parsed = json_decode($jsonText, true);
if (!is_array($parsed) || !isset($parsed['answer'], $parsed['target_section'])) {
    // Defensive fallback if schema-strict somehow gives us garbage
    $parsed = ['answer' => 'No data available in platform', 'target_section' => 'general'];
}

echo json_encode([
    'answer'         => (string)$parsed['answer'],
    'target_section' => (string)$parsed['target_section'],
    'usage'          => $resp['usage'] ?? null,
], JSON_UNESCAPED_UNICODE);
