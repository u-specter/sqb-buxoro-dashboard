<?php
// SSO bridge to https://sqb.osnovaedu.uz/
//
// Replays the exact OSNOVA login flow that their SPA performs:
//   1) POST /v2/user/check          { email }
//   2) POST /v2/multi-company/login { username, password }
// All required headers (environment-id, resource-id, content-type) are sent
// from the user's browser so that any auth cookies the API sets are stored
// in the browser, scoped to api.osnovaedu.uz. The user is then redirected
// to https://sqb.osnovaedu.uz/ — its SPA calls api.osnovaedu.uz with
// credentials, the cookies are sent, and the user is recognised as logged
// in (assuming OSNOVA's auth is cookie-based on the api domain).
//
// If the SPA uses localStorage instead of cookies, true SSO is impossible
// without OSNOVA cooperation; this script then falls back to redirecting
// to the login page with the password copied to the clipboard.

require_once __DIR__ . '/lib.php';
sqb_require_auth();

$current = sqb_current_user();
$user    = sqb_user_find($current['username']);

$is_email      = (bool)filter_var($current['username'], FILTER_VALIDATE_EMAIL);
$osnova_synced = !empty($user['osnova_synced']);
$can_sso       = $is_email && $osnova_synced;

sqb_audit_log('OSNOVA_SSO_REDIRECT', [
    'user'     => $current['username'],
    'sso_mode' => $can_sso ? 'auto' : 'manual',
]);

if (!$can_sso) {
    header('Location: https://sqb.osnovaedu.uz/');
    exit;
}

// Constants from info/osnova_login.txt
const OSNOVA_API          = 'https://api.osnovaedu.uz';
const OSNOVA_FRONTEND     = 'https://sqb.osnovaedu.uz/';
const OSNOVA_PROJECT_ID   = '4b281d3b-2f4d-4082-8155-2f4c6676a028';
const OSNOVA_ENV_ID       = '46a8d2d8-f5ad-4e2b-b730-a283520502a3';
const OSNOVA_RESOURCE_ID  = 'a49a0cc0-ec6f-4e45-9d1c-d2a79fa77874';

$email = $current['username'];

header('Cache-Control: no-store, no-cache, must-revalidate, private');
?><!doctype html>
<html lang="uz-Cyrl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>SQB Osnova Edu • Кириш…</title>
  <link rel="icon" type="image/png" href="/img/SQB Logo Main short 1.png">
  <style>
    :root { --navy:#1B3A4B; --teal:#003D64; --accent:#0590C9; --warn:#C25E3C; --success:#2E7D6B; }
    *{box-sizing:border-box}
    html,body{margin:0;padding:0;min-height:100%}
    body{
      font-family:'Inter','Segoe UI',system-ui,sans-serif;
      background:linear-gradient(125deg,var(--navy) 0%,#102836 50%,var(--teal) 100%);
      color:#fff;display:grid;place-items:center;min-height:100vh;padding:24px;
    }
    .card{
      background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);
      backdrop-filter:blur(18px);border-radius:22px;
      padding:36px 32px;max-width:520px;width:100%;
      box-shadow:0 24px 60px rgba(16,40,54,.3);
    }
    .logo{width:56px;height:56px;border-radius:14px;background:rgba(255,255,255,.1);
      display:grid;place-items:center;margin:0 auto 18px;border:1px solid rgba(255,255,255,.18)}
    .logo img{width:42px}
    h1{font-size:22px;font-weight:700;margin:0 0 8px;letter-spacing:-.01em;text-align:center}
    .step{
      display:flex;align-items:center;gap:12px;
      padding:10px 14px;border-radius:11px;margin:8px 0;
      background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
      font-size:13.5px;
    }
    .step .ic{width:20px;height:20px;border-radius:50%;flex-shrink:0;
      display:grid;place-items:center;font-size:11px;font-weight:800;
      background:rgba(255,255,255,.12);color:rgba(255,255,255,.55)}
    .step.active .ic{background:#A6F0F6;color:var(--navy)}
    .step.ok     .ic{background:var(--success);color:#fff}
    .step.fail   .ic{background:var(--warn);color:#fff}
    .step.active{border-color:rgba(166,240,246,.35);background:rgba(166,240,246,.08)}
    .step.ok    {border-color:rgba(46,125,107,.35)}
    .step.fail  {border-color:rgba(194,94,60,.4)}
    .spinner{
      width:14px;height:14px;border:2px solid rgba(255,255,255,.2);
      border-top-color:#A6F0F6;border-radius:50%;
      animation:spin .8s linear infinite;
    }
    @keyframes spin{to{transform:rotate(360deg)}}
    .step.active .ic .spinner{display:block}

    .credentials{
      margin-top:18px;padding:14px;border-radius:11px;
      background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.1);
      font-size:13px;line-height:1.55;
    }
    .credentials .row{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:4px 0}
    .credentials .key{color:rgba(255,255,255,.55);font-size:12px;text-transform:uppercase;letter-spacing:.06em;font-weight:600}
    .credentials .val{font-family:ui-monospace,Menlo,Consolas,monospace;color:#A6F0F6;font-size:13px;
      flex:1;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .copy-btn{
      background:rgba(166,240,246,.12);border:1px solid rgba(166,240,246,.3);
      color:#A6F0F6;padding:5px 11px;border-radius:7px;font:inherit;font-size:12px;font-weight:600;
      cursor:pointer;transition:.15s;
    }
    .copy-btn:hover{background:rgba(166,240,246,.22)}
    .copy-btn.copied{background:var(--success);border-color:var(--success);color:#fff}

    .footer-note{
      font-size:12px;color:rgba(255,255,255,.5);margin-top:14px;text-align:center;line-height:1.55;
    }
    .footer-note a{color:#A6F0F6;text-decoration:none;font-weight:600}
    .footer-note a:hover{text-decoration:underline}

    .manual-cta{
      display:none;margin-top:14px;padding:12px;border-radius:10px;
      background:rgba(194,94,60,.12);border:1px solid rgba(194,94,60,.3);
      color:#FFD8C9;font-size:13px;line-height:1.55;
    }
    .manual-cta.show{display:block}
    .manual-cta b{color:#fff}
    .btn{
      display:inline-block;margin-top:10px;padding:9px 18px;
      background:linear-gradient(120deg,#0590C9,#06A0AB);color:#fff;
      border:0;border-radius:9px;font:inherit;font-weight:700;font-size:13.5px;
      text-decoration:none;cursor:pointer;
    }
    .btn:hover{transform:translateY(-1px)}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo"><img src="/img/SQB Logo Main short 1.png" alt="SQB"></div>
    <h1>SQB Osnova Edu га кириш</h1>

    <div class="step" id="s1"><div class="ic">1</div><div>Фойдаланувчи текширилмоқда…</div></div>
    <div class="step" id="s2"><div class="ic">2</div><div>Тизимга кирилмоқда…</div></div>
    <div class="step" id="s3"><div class="ic">3</div><div>Платформага йўналтирилмоқда…</div></div>

    <div class="credentials">
      <div class="row">
        <span class="key">Email</span>
        <span class="val" id="emailVal"><?= htmlspecialchars($email, ENT_QUOTES, 'UTF-8') ?></span>
      </div>
      <div class="row">
        <span class="key">Парол</span>
        <span class="val"><?= htmlspecialchars($email, ENT_QUOTES, 'UTF-8') ?></span>
        <button class="copy-btn" id="copyBtn" type="button">Нусха олиш</button>
      </div>
    </div>

    <div class="manual-cta" id="manualCta">
      <b>Автоматик кириш ишламади.</b><br>
      Парол сизнинг email манзилингиз. Қуйидаги тугмани босинг ва паролни киритинг.
      <a class="btn" href="<?= OSNOVA_FRONTEND ?>" target="_self">SQB Osnova Edu га ўтиш</a>
    </div>

    <div class="footer-note" id="footerNote">
      Парол сизнинг email манзилингиз билан бир хил.
    </div>
  </div>

  <script>
  (function () {
    const EMAIL    = <?= json_encode($email) ?>;
    const API      = <?= json_encode(OSNOVA_API) ?>;
    const FRONTEND = <?= json_encode(OSNOVA_FRONTEND) ?>;
    const PROJECT  = <?= json_encode(OSNOVA_PROJECT_ID) ?>;
    const ENV      = <?= json_encode(OSNOVA_ENV_ID) ?>;
    const RES      = <?= json_encode(OSNOVA_RESOURCE_ID) ?>;

    const s1 = document.getElementById('s1');
    const s2 = document.getElementById('s2');
    const s3 = document.getElementById('s3');
    const manual = document.getElementById('manualCta');
    const footer = document.getElementById('footerNote');
    const copyBtn = document.getElementById('copyBtn');

    function setState(el, state, text) {
      el.classList.remove('active','ok','fail');
      if (state) el.classList.add(state);
      if (text) el.querySelector('div:last-child').textContent = text;
    }

    // Pre-emptively copy password (=email) to clipboard so user can paste
    // even if auto-login ultimately fails. Best-effort — silently swallow
    // errors (clipboard API requires user gesture in some browsers).
    function copyPassword(showFeedback) {
      const ok = () => {
        if (!showFeedback) return;
        copyBtn.textContent = 'Нусха олинди ✓';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Нусха олиш';
          copyBtn.classList.remove('copied');
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(EMAIL).then(ok, () => {});
      } else {
        // Fallback for older browsers
        try {
          const ta = document.createElement('textarea');
          ta.value = EMAIL; ta.style.position='fixed'; ta.style.opacity='0';
          document.body.appendChild(ta); ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          ok();
        } catch (_) {}
      }
    }
    copyBtn.addEventListener('click', () => copyPassword(true));

    const COMMON_HEADERS = {
      'Content-Type':   'application/json',
      'environment-id': ENV,
      'resource-id':    RES,
    };

    async function step1_userCheck() {
      const res = await fetch(API + '/v2/user/check', {
        method: 'POST',
        headers: COMMON_HEADERS,
        body: JSON.stringify({ email: EMAIL }),
        credentials: 'include',
        mode: 'cors',
      });
      if (!res.ok) throw new Error('user-check status ' + res.status);
      const data = await res.json().catch(() => ({}));
      if (data.status !== 'OK') throw new Error('user-check status ' + data.status);
      return data;
    }

    async function step2_login() {
      const url = API + '/v2/multi-company/login?Project-Id=' + encodeURIComponent(PROJECT);
      const res = await fetch(url, {
        method: 'POST',
        headers: COMMON_HEADERS,
        body: JSON.stringify({ username: EMAIL, password: EMAIL }),
        credentials: 'include',
        mode: 'cors',
      });
      if (res.status !== 201 && !res.ok) throw new Error('login status ' + res.status);
      const data = await res.json().catch(() => ({}));
      if (data.status !== 'CREATED' && data.status !== 'OK') {
        throw new Error('login status ' + (data.status || res.status));
      }
      return data;
    }

    function showFailure(reason) {
      setState(s3, 'fail', 'Автоматик кириш ишламади');
      manual.classList.add('show');
      footer.style.display = 'none';
      // Try to pre-copy the password — when the user clicks the manual
      // link below, the clipboard will already have it.
      copyPassword(false);
      try { console.error('[osnova-sso]', reason); } catch (_) {}
    }

    (async () => {
      try {
        // Try to pre-copy password (no user gesture yet — may silently fail
        // in some browsers, but we'll retry after click).
        copyPassword(false);

        setState(s1, 'active', 'Фойдаланувчи текширилмоқда…');
        await step1_userCheck();
        setState(s1, 'ok',     'Фойдаланувчи топилди ✓');

        setState(s2, 'active', 'Тизимга кирилмоқда…');
        await step2_login();
        setState(s2, 'ok',     'Кириш муваффақиятли ✓');

        setState(s3, 'active', 'Йўналтирилмоқда…');
        // Small delay so the success state is visible.
        setTimeout(() => { window.location.replace(FRONTEND); }, 600);
      } catch (err) {
        showFailure(err && err.message ? err.message : err);
      }
    })();
  })();
  </script>
  <noscript>
    <p>JavaScript керак. <a href="<?= OSNOVA_FRONTEND ?>">SQB Osnova Edu га ўтиш</a></p>
  </noscript>
</body>
</html>
