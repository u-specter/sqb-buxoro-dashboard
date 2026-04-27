/* SQB AI chat widget — global, talks to /chat-proxy.php (OpenAI Responses + file_search) */
(function () {
  if (window.__sqbChatLoaded) return;
  window.__sqbChatLoaded = true;

  const ENDPOINT = '/chat-proxy.php';
  const SUGGESTIONS = [
    'Боysun тумани саноат ҳажми қанча?',
    'Қайси туманда ишсизлик энг юқори?',
    'Қоратепа тумани экспорт динамикаси',
    'Маҳаллалар тоифалари бўйича солиштириш',
  ];

  const state = { messages: [], busy: false };

  // ── DOM ───────────────────────────────────────────────────
  const fab = document.createElement('button');
  fab.className = 'sqb-chat-fab';
  fab.title = 'SQB AI ёрдамчи';
  fab.innerHTML = '<i class="bi bi-chat-dots-fill"></i><span class="sqb-chat-pulse"></span>';
  document.body.appendChild(fab);

  const panel = document.createElement('div');
  panel.className = 'sqb-chat-panel';
  panel.innerHTML = `
    <div class="sqb-chat-head">
      <div class="sqb-chat-avatar"><i class="bi bi-robot"></i></div>
      <div>
        <div class="sqb-chat-title">SQB AI ёрдамчи</div>
        <div class="sqb-chat-sub">Туман маълумотлари бўйича сўранг</div>
      </div>
      <button class="sqb-chat-close" aria-label="Yopish">×</button>
    </div>
    <div class="sqb-chat-body" id="sqbChatBody"></div>
    <form class="sqb-chat-foot" id="sqbChatForm" autocomplete="off">
      <textarea id="sqbChatInput" rows="1" placeholder="Саволингизни ёзинг…"></textarea>
      <button type="submit" id="sqbChatSend" title="Юбориш"><i class="bi bi-send-fill"></i></button>
    </form>
  `;
  document.body.appendChild(panel);

  const $body  = panel.querySelector('#sqbChatBody');
  const $input = panel.querySelector('#sqbChatInput');
  const $send  = panel.querySelector('#sqbChatSend');
  const $form  = panel.querySelector('#sqbChatForm');
  const $close = panel.querySelector('.sqb-chat-close');

  // ── helpers ───────────────────────────────────────────────
  function currentTuman() {
    const el = document.getElementById('rsDistrictName');
    if (el && el.textContent) return el.textContent.trim();
    return '';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function renderEmpty() {
    const chips = SUGGESTIONS.map(q =>
      `<button type="button" class="sqb-chip" data-q="${escapeHtml(q)}">${escapeHtml(q)}</button>`
    ).join('');
    $body.innerHTML = `
      <div class="sqb-chat-empty">
        <div class="sqb-empty-title">Салом! 👋</div>
        Ўзбекистон туманлари бўйича иқтисодий, демографик ва инфратузилма маълумотлари асосида саволларингизга жавоб бераман.
        <div class="sqb-chips">${chips}</div>
      </div>
    `;
    $body.querySelectorAll('.sqb-chip').forEach(btn => {
      btn.addEventListener('click', () => { $input.value = btn.dataset.q; $input.focus(); autoResize(); });
    });
  }

  function appendMsg(role, text, citations) {
    // Remove empty-state on first real message
    const empty = $body.querySelector('.sqb-chat-empty');
    if (empty) empty.remove();

    const el = document.createElement('div');
    el.className = 'sqb-msg ' + (role === 'user' ? 'user' : 'bot');
    el.textContent = text;
    if (citations && citations.length) {
      const seen = new Set();
      const names = citations.map(c => c.filename).filter(n => n && !seen.has(n) && seen.add(n));
      if (names.length) {
        const cite = document.createElement('span');
        cite.className = 'sqb-cite';
        cite.textContent = '📄 Манба: ' + names.join(', ');
        el.appendChild(cite);
      }
    }
    $body.appendChild(el);
    $body.scrollTop = $body.scrollHeight;
    return el;
  }

  function appendTyping() {
    const el = document.createElement('div');
    el.className = 'sqb-msg bot typing';
    el.textContent = 'Ёзмоқда…';
    $body.appendChild(el);
    $body.scrollTop = $body.scrollHeight;
    return el;
  }

  async function send(text) {
    if (!text || state.busy) return;
    state.busy = true;
    $send.disabled = true;

    appendMsg('user', text);
    state.messages.push({ role: 'user', content: text });
    const typing = appendTyping();

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: state.messages, tuman: currentTuman() }),
      });
      const data = await res.json().catch(() => ({}));
      typing.remove();

      if (!res.ok) {
        const msg = data.error || ('HTTP ' + res.status);
        appendMsg('assistant', '⚠️ Хато: ' + msg);
        return;
      }
      const answer = (data.text || '').trim() || 'Маълумот топилмади.';
      appendMsg('assistant', answer, data.citations || []);
      state.messages.push({ role: 'assistant', content: answer });
    } catch (err) {
      typing.remove();
      appendMsg('assistant', '⚠️ Тармоқ хатоси: ' + err.message);
    } finally {
      state.busy = false;
      $send.disabled = false;
      $input.focus();
    }
  }

  function autoResize() {
    $input.style.height = 'auto';
    $input.style.height = Math.min($input.scrollHeight, 110) + 'px';
  }

  // ── events ────────────────────────────────────────────────
  fab.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      if (state.messages.length === 0) renderEmpty();
      setTimeout(() => $input.focus(), 50);
    }
  });
  $close.addEventListener('click', () => panel.classList.remove('open'));

  $form.addEventListener('submit', (e) => {
    e.preventDefault();
    const t = $input.value.trim();
    if (!t) return;
    $input.value = '';
    autoResize();
    send(t);
  });

  $input.addEventListener('input', autoResize);
  $input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      $form.requestSubmit();
    }
  });

  // initial empty state
  renderEmpty();
})();
