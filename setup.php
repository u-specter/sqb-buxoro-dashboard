<?php
// One-time setup page: creates the initial admin user.
// Refuses to run once auth/users.json exists (i.e. someone already set up an admin).

require_once __DIR__ . '/auth/lib.php';

$already = file_exists(SQB_USERS_FILE);
$error = null;
$success = false;

if (!$already && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim((string)($_POST['username'] ?? ''));
    $password = (string)($_POST['password'] ?? '');
    $confirm  = (string)($_POST['confirm']  ?? '');

    if ($username === '' || $password === '') {
        $error = 'Илтимос, барча майдонларни тўлдиринг.';
    } elseif ($password !== $confirm) {
        $error = 'Пароллар бир хил эмас.';
    } else {
        $r = sqb_user_create($username, $password, 'admin');
        if (!$r['ok']) {
            $msgs = [
                'invalid_username' => 'Фойдаланувчи номи нотўғри (3–32 та белги: a-z, 0-9, . - _).',
                'weak_password'    => 'Парол камида 8 та белгидан иборат бўлиши керак.',
                'storage_failure'  => 'Файлга ёзишда хатолик. Серверда ёзиш ҳуқуқини текширинг.',
            ];
            $error = $msgs[$r['error']] ?? ('Хатолик: ' . $r['error']);
        } else {
            $success = true;
        }
    }
}

?><!doctype html>
<html lang="uz-Cyrl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>SQB Bank • Илк созлаш</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link rel="icon" type="image/png" href="img/SQB Logo Main short 1.png">
  <style>
    :root {
      --navy:#1B3A4B; --navy-2:#102836; --teal:#003D64;
      --accent:#0590C9; --accent-2:#06A0AB;
      --cream:#F5F2EC; --ink:#0E1F29; --muted:#6b7c85;
      --line:#e3dccd; --warn:#C25E3C; --success:#2E7D6B;
    }
    *{box-sizing:border-box}
    html,body{margin:0;padding:0;min-height:100%}
    body{
      font-family:'Inter',system-ui,sans-serif;color:var(--ink);
      background:linear-gradient(125deg,var(--navy) 0%,var(--navy-2) 50%,var(--teal) 100%);
      display:grid;place-items:center;padding:24px;min-height:100vh;
    }
    .card{
      width:100%;max-width:520px;background:var(--cream);
      border-radius:24px;padding:44px 40px;
      box-shadow:0 24px 60px rgba(16,40,54,.3);
    }
    .brand{display:flex;align-items:center;gap:12px;margin-bottom:24px}
    .brand img{height:38px}
    .brand-text{font-size:12px;font-weight:700;letter-spacing:.16em;color:var(--muted);text-transform:uppercase}
    h1{font-size:26px;font-weight:800;margin:0 0 8px;color:var(--navy);letter-spacing:-.01em}
    p.lead{font-size:14.5px;color:var(--muted);margin:0 0 24px;line-height:1.55}
    .alert{padding:12px 14px;border-radius:10px;font-size:13.5px;font-weight:500;margin-bottom:16px;display:flex;gap:10px;align-items:center}
    .alert.error{background:rgba(194,94,60,.1);border:1px solid rgba(194,94,60,.3);color:var(--warn)}
    .alert.success{background:rgba(46,125,107,.1);border:1px solid rgba(46,125,107,.3);color:var(--success)}
    .alert.info{background:rgba(5,144,201,.08);border:1px solid rgba(5,144,201,.25);color:var(--navy)}
    label{display:block;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--navy);margin-bottom:6px;margin-top:14px}
    input{
      width:100%;padding:13px 14px;border:1.5px solid var(--line);
      border-radius:11px;font:inherit;font-size:15px;font-weight:500;
      background:#fff;outline:none;transition:.2s;
    }
    input:focus{border-color:var(--accent);box-shadow:0 0 0 4px rgba(5,144,201,.15)}
    button.primary{
      width:100%;margin-top:22px;padding:14px;
      background:linear-gradient(120deg,var(--navy),var(--teal));color:#fff;
      border:0;border-radius:12px;font:inherit;font-weight:700;font-size:15px;
      letter-spacing:.04em;cursor:pointer;transition:.2s;
      box-shadow:0 8px 22px rgba(16,40,54,.25);
    }
    button.primary:hover{transform:translateY(-1px);box-shadow:0 12px 28px rgba(16,40,54,.32)}
    a.go-login{
      display:inline-flex;align-items:center;gap:8px;margin-top:18px;
      color:var(--accent);font-weight:600;text-decoration:none;font-size:14px;
    }
    a.go-login:hover{text-decoration:underline}
    code{background:#fff;padding:2px 8px;border-radius:6px;border:1px solid var(--line);font-size:12.5px}
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">
      <img src="img/SQB Logo Main short 1.png" alt="SQB Bank">
      <span class="brand-text">SQB Mahalla • Илк созлаш</span>
    </div>

    <?php if ($already): ?>
      <h1>Созлаш якунланган</h1>
      <p class="lead">Тизим аввалроқ созланган. Хавфсизлик мақсадида бу саҳифа фақат бир марта ишлатилади.</p>
      <div class="alert info">
        <i class="bi bi-shield-lock-fill"></i>
        <span>Янги фойдаланувчилар яратиш учун <code>POST /auth/users.php</code> API дан фойдаланинг.</span>
      </div>
      <a class="go-login" href="/login.html">
        Тизимга кириш <i class="bi bi-arrow-right"></i>
      </a>

    <?php elseif ($success): ?>
      <h1>Маъмур яратилди</h1>
      <p class="lead">Илк маъмур муваффақиятли яратилди. Энди тизимга киришингиз мумкин.</p>
      <div class="alert success">
        <i class="bi bi-check-circle-fill"></i>
        <span>Маъмур ҳисоби фаол. Хавфсизлик учун ушбу <code>setup.php</code> файлини серверингиздан ўчириб ташлашни тавсия қиламиз.</span>
      </div>
      <a class="go-login" href="/login.html">
        Тизимга кириш <i class="bi bi-arrow-right"></i>
      </a>

    <?php else: ?>
      <h1>Илк маъмурни яратинг</h1>
      <p class="lead">Платформага илк бор кириш учун маъмур ҳисобини яратинг. Бу амал фақат бир марта бажарилади.</p>

      <?php if ($error): ?>
        <div class="alert error">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <span><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></span>
        </div>
      <?php endif; ?>

      <form method="post" autocomplete="off">
        <label for="username">Маъмур номи</label>
        <input id="username" name="username" type="text" required minlength="3" maxlength="32"
               pattern="[a-z0-9._\-]+" autocomplete="username" autocapitalize="off"
               value="<?= htmlspecialchars($_POST['username'] ?? 'admin', ENT_QUOTES, 'UTF-8') ?>">

        <label for="password">Парол (камида 8 та белги)</label>
        <input id="password" name="password" type="password" required minlength="8" autocomplete="new-password">

        <label for="confirm">Паролни такрорланг</label>
        <input id="confirm" name="confirm" type="password" required minlength="8" autocomplete="new-password">

        <button type="submit" class="primary">
          Маъмурни яратиш
        </button>
      </form>
    <?php endif; ?>
  </div>
</body>
</html>
