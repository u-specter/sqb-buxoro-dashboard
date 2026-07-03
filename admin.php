<?php
require_once __DIR__ . '/auth/lib.php';
sqb_require_admin_page();
$current = sqb_current_user();
header('Cache-Control: no-store, no-cache, must-revalidate, private');
?><!doctype html>
<html lang="uz-Cyrl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>SQB Bank • Маъмур панели</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <style>
    :root {
      --navy:#1B3A4B; --navy-2:#102836; --teal:#003D64;
      --accent:#0590C9; --accent-2:#06A0AB;
      --cream:#F5F2EC; --cream-2:#EFEAE0;
      --success:#2E7D6B; --warn:#C25E3C;
      --ink:#0E1F29; --muted:#6b7c85; --line:#e3dccd;
      --shadow:0 10px 30px rgba(16,40,54,.10);
      --shadow-lg:0 24px 60px rgba(16,40,54,.18);
    }
    *{box-sizing:border-box}
    html,body{margin:0;padding:0}
    body{
      font-family:'Inter','Segoe UI',system-ui,sans-serif;
      color:var(--ink); background:
        radial-gradient(1200px 600px at 90% -10%, rgba(0,126,136,.08), transparent 60%),
        radial-gradient(900px 500px at -10% 20%, rgba(27,58,75,.06), transparent 60%),
        var(--cream);
      min-height:100vh;
    }

    /* NAVBAR */
    .topbar{
      background:linear-gradient(120deg,var(--navy) 0%,var(--navy-2) 60%,var(--teal) 100%);
      color:#fff; padding:18px 28px;
      display:flex; align-items:center; gap:18px;
      box-shadow:0 6px 24px rgba(16,40,54,.25);
      border-bottom:3px solid var(--accent);
    }
    .topbar-brand{font-size:20px; font-weight:800; letter-spacing:.02em}
    .topbar .title{
      font-size:14px; font-weight:700; letter-spacing:.14em;
      text-transform:uppercase; color:rgba(255,255,255,.85);
    }
    .topbar-actions{margin-left:auto; display:flex; gap:10px; align-items:center}
    .nav-pill{
      display:inline-flex; align-items:center; gap:8px;
      padding:9px 16px; border-radius:11px; font-size:13.5px; font-weight:600;
      color:#fff; text-decoration:none; transition:.2s;
      background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.16);
    }
    .nav-pill:hover{background:rgba(255,255,255,.16); transform:translateY(-1px)}
    .nav-pill.danger{background:rgba(194,94,60,.2); border-color:rgba(194,94,60,.35)}
    .nav-pill.danger:hover{background:rgba(194,94,60,.32)}
    .user-pill{
      display:inline-flex; align-items:center; gap:8px;
      padding:8px 14px; border-radius:30px;
      background:rgba(166,240,246,.1);
      border:1px solid rgba(166,240,246,.25);
      font-size:13px; color:#fff;
    }
    .user-pill i{color:#A6F0F6}
    .user-pill .role{
      font-size:10.5px; font-weight:700; letter-spacing:.06em;
      text-transform:uppercase; padding:2px 8px; border-radius:6px;
      background:rgba(0,0,0,.2); color:#A6F0F6;
    }

    /* MAIN */
    .container{max-width:1100px; margin:0 auto; padding:32px 28px}

    .hero{
      margin-bottom:28px;
    }
    .hero h1{
      font-size:32px; font-weight:800; color:var(--navy);
      margin:0 0 8px; letter-spacing:-.01em;
    }
    .hero p{
      font-size:15px; color:var(--muted); margin:0; line-height:1.55;
    }

    /* CARDS */
    .card{
      background:#fff; border-radius:18px; padding:26px 28px;
      box-shadow:var(--shadow); border:1px solid var(--line);
      margin-bottom:22px;
    }
    .card-head{
      display:flex; align-items:center; gap:12px; margin-bottom:20px;
      padding-bottom:14px; border-bottom:1px solid var(--line);
    }
    .card-head .ic{
      width:42px; height:42px; border-radius:11px;
      background:linear-gradient(135deg,var(--navy),var(--teal));
      color:#fff; display:grid; place-items:center; font-size:18px;
    }
    .card-head h2{
      font-size:18px; font-weight:700; margin:0; color:var(--navy);
      letter-spacing:-.005em;
    }
    .card-head .sub{
      font-size:12.5px; color:var(--muted); margin-top:2px;
    }

    /* FORM */
    .form-grid{
      display:grid; grid-template-columns:1fr 1fr 200px auto; gap:14px;
      align-items:end;
    }
    @media (max-width:780px){ .form-grid{grid-template-columns:1fr; gap:12px} }

    label{
      display:block; font-size:11px; font-weight:700;
      letter-spacing:.08em; text-transform:uppercase; color:var(--navy);
      margin-bottom:6px;
    }
    input, select{
      width:100%; padding:11px 14px; border:1.5px solid var(--line);
      border-radius:10px; font:inherit; font-size:14px; font-weight:500;
      background:#fff; color:var(--ink); outline:none; transition:.2s;
    }
    input:focus, select:focus{
      border-color:var(--accent); box-shadow:0 0 0 4px rgba(5,144,201,.15);
    }
    select{cursor:pointer; appearance:none;
      background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 16 16'><path fill='%236b7c85' d='M4 6l4 4 4-4'/></svg>");
      background-repeat:no-repeat; background-position:right 14px center; padding-right:34px;
    }

    .btn{
      padding:11px 20px; border:0; border-radius:10px;
      font:inherit; font-size:14px; font-weight:700; letter-spacing:.04em;
      cursor:pointer; transition:.2s; white-space:nowrap;
      display:inline-flex; align-items:center; gap:8px; justify-content:center;
    }
    .btn-primary{
      background:linear-gradient(120deg,var(--navy),var(--teal));
      color:#fff; box-shadow:0 6px 18px rgba(16,40,54,.22);
    }
    .btn-primary:hover:not(:disabled){
      transform:translateY(-1px); box-shadow:0 10px 24px rgba(16,40,54,.28);
    }
    .btn-primary:disabled{opacity:.6; cursor:not-allowed}
    .btn-danger{
      background:rgba(194,94,60,.1); color:var(--warn);
      border:1px solid rgba(194,94,60,.35);
    }
    .btn-danger:hover:not(:disabled){background:rgba(194,94,60,.18)}
    .btn-sm{padding:7px 12px; font-size:12.5px}

    .alert{
      display:none; padding:12px 16px; border-radius:10px;
      font-size:13.5px; font-weight:500; margin-bottom:18px;
      align-items:center; gap:10px;
    }
    .alert.show{display:flex}
    .alert.error{background:rgba(194,94,60,.1); color:var(--warn); border:1px solid rgba(194,94,60,.3)}
    .alert.success{background:rgba(46,125,107,.1); color:var(--success); border:1px solid rgba(46,125,107,.3)}
    .alert i{font-size:18px; flex-shrink:0}

    /* TABLE */
    .users-table{
      width:100%; border-collapse:separate; border-spacing:0;
    }
    .users-table th{
      text-align:left; font-size:11px; font-weight:700;
      letter-spacing:.08em; text-transform:uppercase;
      color:var(--muted); padding:10px 14px;
      border-bottom:1.5px solid var(--line);
    }
    .users-table td{
      padding:14px; font-size:14px; color:var(--ink);
      border-bottom:1px solid var(--line);
      vertical-align:middle;
    }
    .users-table tr:last-child td{border-bottom:0}
    .users-table tr:hover td{background:var(--cream-2)}
    .users-table .uname{
      font-weight:600; display:flex; align-items:center; gap:10px;
    }
    .users-table .uname-ic{
      width:32px; height:32px; border-radius:50%;
      background:linear-gradient(135deg,var(--accent),var(--accent-2));
      color:#fff; display:grid; place-items:center;
      font-size:13px; font-weight:700; flex-shrink:0;
    }
    .role-badge{
      display:inline-block; padding:4px 10px; border-radius:6px;
      font-size:11px; font-weight:700; letter-spacing:.05em; text-transform:uppercase;
    }
    .role-badge.admin{background:rgba(5,144,201,.12); color:var(--accent)}
    .role-badge.user{background:rgba(46,125,107,.1); color:var(--success)}
    .you-badge{
      font-size:10.5px; font-weight:700; letter-spacing:.05em; text-transform:uppercase;
      padding:3px 8px; border-radius:5px; margin-left:8px;
      background:var(--cream-2); color:var(--muted);
    }
    .empty{
      text-align:center; padding:48px 20px; color:var(--muted); font-size:14px;
    }
    .empty i{font-size:32px; display:block; margin-bottom:10px; color:var(--line)}

    .table-wrap{overflow-x:auto; margin:-8px}
    .table-wrap > table{margin:8px}
  </style>
</head>
<body>

  <header class="topbar">
    <span class="topbar-brand">SQB Bank</span>
    <span class="title">Маъмур панели</span>
    <div class="topbar-actions">
      <span class="user-pill">
        <i class="bi bi-person-fill"></i>
        <?= htmlspecialchars($current['username'], ENT_QUOTES, 'UTF-8') ?>
        <span class="role">Маъмур</span>
      </span>
      <a class="nav-pill" href="/index.php">
        <i class="bi bi-arrow-left"></i> Дашбордга қайтиш
      </a>
    </div>
  </header>

  <main class="container">

    <div class="hero">
      <h1>Фойдаланувчиларни бошқариш</h1>
      <p>Платформага кириш ҳуқуқига эга фойдаланувчиларни шу ердан қўшинг ва ўчиринг.</p>
    </div>

    <!-- CREATE USER -->
    <section class="card">
      <div class="card-head">
        <div class="ic"><i class="bi bi-person-plus-fill"></i></div>
        <div>
          <h2>Янги фойдаланувчи қўшиш</h2>
          <div class="sub">Парол камида 8 та белги; фойдаланувчи номи 3–32 та белги (a–z, 0–9, . - _).</div>
        </div>
      </div>

      <div class="alert error" id="createError" role="alert">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <span id="createErrorText"></span>
      </div>
      <div class="alert success" id="createSuccess" role="status">
        <i class="bi bi-check-circle-fill"></i>
        <span id="createSuccessText"></span>
      </div>

      <form id="createForm" autocomplete="off">
        <div class="form-grid">
          <div>
            <label for="username">Фойдаланувчи номи</label>
            <input id="username" name="username" type="text" required minlength="3" maxlength="32"
                   pattern="[a-z0-9._\-]+" autocapitalize="off" placeholder="masalan: akmal">
          </div>
          <div>
            <label for="password">Парол</label>
            <input id="password" name="password" type="password" required minlength="8"
                   placeholder="Камида 8 та белги">
          </div>
          <div>
            <label for="role">Роль</label>
            <select id="role" name="role">
              <option value="user">Оддий фойдаланувчи</option>
              <option value="admin">Маъмур</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary" id="createBtn">
            <i class="bi bi-plus-lg"></i> Яратиш
          </button>
        </div>
      </form>
    </section>

    <!-- USER LIST -->
    <section class="card">
      <div class="card-head">
        <div class="ic"><i class="bi bi-people-fill"></i></div>
        <div>
          <h2>Барча фойдаланувчилар</h2>
          <div class="sub" id="userCountSub">—</div>
        </div>
      </div>

      <div class="table-wrap">
        <table class="users-table" id="usersTable">
          <thead>
            <tr>
              <th>Фойдаланувчи</th>
              <th>Роль</th>
              <th>Яратилган</th>
              <th style="width:1%; text-align:right">Амаллар</th>
            </tr>
          </thead>
          <tbody id="usersBody">
            <tr><td colspan="4" class="empty"><i class="bi bi-arrow-clockwise"></i>Юкланмоқда…</td></tr>
          </tbody>
        </table>
      </div>
    </section>

  </main>

  <script>
    const ME = <?= json_encode($current['username']) ?>;

    const errBox     = document.getElementById('createError');
    const errText    = document.getElementById('createErrorText');
    const okBox      = document.getElementById('createSuccess');
    const okText     = document.getElementById('createSuccessText');
    const form       = document.getElementById('createForm');
    const btn        = document.getElementById('createBtn');
    const usersBody  = document.getElementById('usersBody');
    const userCount  = document.getElementById('userCountSub');

    const ERRORS = {
      invalid_username: 'Фойдаланувчи номи нотўғри (3–32 белги: a-z, 0-9, . - _).',
      weak_password:    'Парол камида 8 та белгидан иборат бўлиши керак.',
      invalid_role:     'Роль фақат "user" ёки "admin" бўлиши мумкин.',
      user_exists:      'Бу ном билан фойдаланувчи аллақачон мавжуд.',
      missing_fields:   'Барча майдонларни тўлдиринг.',
      storage_failure:  'Файлга ёзишда хатолик. Серверда ёзиш ҳуқуқини текширинг.',
      unauthorized:     'Ваколат йўқ. Қайта киринг.',
      method_not_allowed:'Сўров усули нотўғри.',
      cannot_delete_last_user:'Сўнгги фойдаланувчини ўчириб бўлмайди.',
      user_not_found:   'Фойдаланувчи топилмади.',
      missing_username: 'Фойдаланувчи номи кўрсатилмаган.',
      network:          'Сервер билан боғланиб бўлмади.',
      unknown:          'Номаълум хатолик.',
    };

    function showAlert(box, txtEl, code, msg) {
      hideAlerts();
      txtEl.textContent = msg || ERRORS[code] || ERRORS.unknown;
      box.classList.add('show');
      if (box === okBox) setTimeout(() => box.classList.remove('show'), 4000);
    }
    function hideAlerts() {
      errBox.classList.remove('show');
      okBox.classList.remove('show');
    }

    function escapeHtml(s){
      return String(s).replace(/[&<>"']/g, c => (
        {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]
      ));
    }

    function fmtDate(iso){
      if (!iso) return '—';
      try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleString('uz-Cyrl-UZ', {
          year:'numeric', month:'short', day:'2-digit',
          hour:'2-digit', minute:'2-digit'
        });
      } catch (_) { return iso; }
    }

    async function loadUsers() {
      try {
        const res = await fetch('/auth/users.php', {credentials:'same-origin'});
        const data = await res.json();
        if (!res.ok || !data.ok) {
          usersBody.innerHTML = `<tr><td colspan="4" class="empty"><i class="bi bi-exclamation-triangle"></i>Юклашда хатолик: ${escapeHtml(data.error||res.status)}</td></tr>`;
          return;
        }
        renderUsers(data.users || []);
      } catch (e) {
        usersBody.innerHTML = `<tr><td colspan="4" class="empty"><i class="bi bi-exclamation-triangle"></i>${escapeHtml(ERRORS.network)}</td></tr>`;
      }
    }

    function renderUsers(users){
      userCount.textContent = `Жами: ${users.length} та фойдаланувчи`;
      if (!users.length) {
        usersBody.innerHTML = `<tr><td colspan="4" class="empty"><i class="bi bi-people"></i>Ҳозирча фойдаланувчилар йўқ</td></tr>`;
        return;
      }
      usersBody.innerHTML = users.map(u => {
        const isMe = u.username === ME;
        const initial = (u.username[0] || '?').toUpperCase();
        const roleLabel = u.role === 'admin' ? 'Маъмур' : 'Фойдаланувчи';
        const delBtn = isMe
          ? '<span style="color:var(--muted); font-size:12px">— ўзингиз —</span>'
          : `<button class="btn btn-danger btn-sm" data-del="${escapeHtml(u.username)}"><i class="bi bi-trash"></i> Ўчириш</button>`;
        return `<tr>
          <td><div class="uname"><span class="uname-ic">${escapeHtml(initial)}</span>
            <span>${escapeHtml(u.username)}${isMe?'<span class="you-badge">сиз</span>':''}</span></div></td>
          <td><span class="role-badge ${u.role}">${escapeHtml(roleLabel)}</span></td>
          <td style="color:var(--muted); font-size:13px">${escapeHtml(fmtDate(u.created_at))}</td>
          <td style="text-align:right">${delBtn}</td>
        </tr>`;
      }).join('');
    }

    usersBody.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-del]');
      if (!btn) return;
      const username = btn.getAttribute('data-del');
      if (!confirm(`"${username}" фойдаланувчисини ўчирасизми? Бу амални бекор қилиб бўлмайди.`)) return;
      btn.disabled = true;
      try {
        const res = await fetch('/auth/users.php?username=' + encodeURIComponent(username),
          {method:'DELETE', credentials:'same-origin'});
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          alert(data.message || ERRORS[data.error] || ERRORS.unknown);
          btn.disabled = false;
          return;
        }
        await loadUsers();
      } catch (_) {
        alert(ERRORS.network);
        btn.disabled = false;
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlerts();
      const body = {
        username: form.username.value.trim().toLowerCase(),
        password: form.password.value,
        role:     form.role.value,
      };
      btn.disabled = true;
      try {
        const res = await fetch('/auth/users.php', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          credentials:'same-origin',
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) {
          showAlert(okBox, okText, null, `"${body.username}" фойдаланувчиси яратилди.`);
          form.reset();
          await loadUsers();
        } else {
          showAlert(errBox, errText, data.error, data.message);
        }
      } catch (_) {
        showAlert(errBox, errText, 'network');
      } finally {
        btn.disabled = false;
      }
    });

    loadUsers();
  </script>
</body>
</html>
