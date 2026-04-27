<?php
// ─────────────────────────────────────────────────────────────
// SQB chat proxy — calls OpenAI Responses API with file_search
// against the pre-built vector store of openai-data/*.json.
// Frontend POSTs: { messages: [{role, content}, ...], tuman?: "boysun" }
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

$vs = @json_decode(@file_get_contents(__DIR__ . '/api/vector-store.json'), true);
$vectorStoreId = $vs['vector_store_id'] ?? null;
if (!$vectorStoreId) {
    http_response_code(500);
    echo json_encode(['error' => 'vector-store.json not found — run scripts/upload-vector-store.sh first']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true) ?: [];
$messages = $body['messages'] ?? [];
$tuman    = isset($body['tuman']) ? trim((string)$body['tuman']) : '';

if (!is_array($messages) || count($messages) === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'messages[] required']); exit;
}

$systemText =
    "Siz — SQB Bank tahlil platformasi uchun AI yordamchisisiz. ".
    "Sizning yagona bilim manbangiz — file_search orqali ulangan vector store ".
    "(O'zbekiston tumanlari bo'yicha JSON ma'lumotlar). ".
    "Javoblarni faqat shu manbalardan oling. Agar ma'lumot manbada yo'q bo'lsa, ".
    "ochiq aytib qo'ying: \"Bu ma'lumot manbalarda topilmadi.\" ".
    "Tarjima qilmang — foydalanuvchi qaysi tilda yozsa, shu tilda javob bering ".
    "(o'zbek lotin, o'zbek kirill, rus yoki ingliz). ".
    "Raqamlarni aniq ko'chiring, taxmin qilmang. Javoblar qisqa va aniq bo'lsin.";
if ($tuman !== '') {
    $systemText .= " Hozirgi kontekst: foydalanuvchi \"$tuman\" tumani sahifasida — ".
                   "agar savol noaniq bo'lsa, shu tuman ma'lumotlariga ustunlik bering.";
}

$input = [['role' => 'system', 'content' => $systemText]];
foreach ($messages as $m) {
    if (!isset($m['role'], $m['content'])) continue;
    $role = $m['role'] === 'assistant' ? 'assistant' : 'user';
    $input[] = ['role' => $role, 'content' => (string)$m['content']];
}

$payload = [
    'model' => 'gpt-4o-mini',
    'input' => $input,
    'tools' => [[
        'type' => 'file_search',
        'vector_store_ids' => [$vectorStoreId],
        'max_num_results' => 8,
    ]],
    'temperature' => 0.3,
];

$ch = curl_init('https://api.openai.com/v1/responses');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($payload, JSON_UNESCAPED_UNICODE),
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
    ],
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

// Extract assistant text + citation snippets from the Responses payload.
$text = '';
$citations = [];
if (!empty($resp['output_text'])) {
    $text = (string)$resp['output_text'];
}
if (!empty($resp['output']) && is_array($resp['output'])) {
    foreach ($resp['output'] as $item) {
        if (($item['type'] ?? '') !== 'message') continue;
        foreach (($item['content'] ?? []) as $c) {
            if (($c['type'] ?? '') === 'output_text') {
                if ($text === '') $text = (string)($c['text'] ?? '');
                foreach (($c['annotations'] ?? []) as $a) {
                    if (($a['type'] ?? '') === 'file_citation') {
                        $citations[] = [
                            'file_id'  => $a['file_id']  ?? null,
                            'filename' => $a['filename'] ?? null,
                            'index'    => $a['index']    ?? null,
                        ];
                    }
                }
            }
        }
    }
}

// Strip inline citation markers like 【4:0†source】 the model sometimes injects
$text = preg_replace('/【[^】]*】/u', '', $text);
$text = preg_replace('/\[\d+(?::\d+)?(?:†[^\]]*)?\]/u', '', $text);
$text = trim(preg_replace('/[ \t]+\n/u', "\n", $text));

echo json_encode([
    'text'      => $text,
    'citations' => $citations,
    'usage'     => $resp['usage'] ?? null,
], JSON_UNESCAPED_UNICODE);
