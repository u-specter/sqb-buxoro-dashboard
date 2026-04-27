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

  // Lightweight markdown → HTML for bot replies (bold, italic, code, lists, headings)
  function mdToHtml(src) {
    let s = escapeHtml(src);

    // protect inline code so * / _ inside don't get parsed
    const codes = [];
    s = s.replace(/`([^`\n]+)`/g, (_, c) => `${codes.push(c) - 1}`);

    // bold first, then italic (avoid eating bold's stars)
    s = s.replace(/\*\*([^\n*][^*]*?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[\s(>])\*([^\s*][^*\n]*?)\*(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');
    s = s.replace(/(^|[\s(>])_([^\s_][^_\n]*?)_(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');

    // restore code
    s = s.replace(/(\d+)/g, (_, i) => `<code>${codes[+i]}</code>`);

    // block-level: lists / headings / paragraphs
    const lines = s.split(/\r?\n/);
    const out = [];
    let listType = null, listBuf = [];
    const flushList = () => {
      if (listType) {
        out.push(`<${listType}>${listBuf.map(li => `<li>${li}</li>`).join('')}</${listType}>`);
        listType = null; listBuf = [];
      }
    };
    for (const raw of lines) {
      const line = raw;
      const ol = line.match(/^\s*(\d+)\.\s+(.*)$/);
      const ul = line.match(/^\s*[-•*]\s+(.*)$/);
      const h  = line.match(/^(#{1,4})\s+(.*)$/);
      if (ol) {
        if (listType !== 'ol') { flushList(); listType = 'ol'; }
        listBuf.push(ol[2]);
      } else if (ul) {
        if (listType !== 'ul') { flushList(); listType = 'ul'; }
        listBuf.push(ul[1]);
      } else if (h) {
        flushList();
        const lvl = Math.min(h[1].length + 2, 6);
        out.push(`<h${lvl}>${h[2]}</h${lvl}>`);
      } else if (line.trim() === '') {
        flushList();
      } else {
        flushList();
        out.push(`<p>${line}</p>`);
      }
    }
    flushList();
    return out.join('') || '<p></p>';
  }

  function renderEmpty() {
    const chips = SUGGESTIONS.map(q =>
      `<button type="button" class="sqb-chip" data-q="${escapeHtml(q)}">${escapeHtml(q)}</button>`
    ).join('');
    $body.innerHTML = `
      <div class="sqb-chat-empty">
        <div class="sqb-empty-icon"><i class="bi bi-stars"></i></div>
        <div class="sqb-empty-title">Салом! Сизга қандай ёрдам берай?</div>
        Ўзбекистон туманлари бўйича иқтисодий, демографик ва инфратузилма маълумотлари асосида саволларингизга жавоб бераман.
        <div class="sqb-chips">${chips}</div>
      </div>
    `;
    $body.querySelectorAll('.sqb-chip').forEach(btn => {
      btn.addEventListener('click', () => { $input.value = btn.dataset.q; $input.focus(); autoResize(); });
    });
  }

  function appendMsg(role, text) {
    // Remove empty-state on first real message
    const empty = $body.querySelector('.sqb-chat-empty');
    if (empty) empty.remove();

    const el = document.createElement('div');
    el.className = 'sqb-msg ' + (role === 'user' ? 'user' : 'bot');
    if (role === 'user') {
      el.textContent = text;
    } else {
      el.innerHTML = mdToHtml(text);
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
      appendMsg('assistant', answer);
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
