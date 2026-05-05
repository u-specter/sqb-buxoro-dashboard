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

  function appendTyping(label) {
    const el = document.createElement('div');
    el.className = 'sqb-msg bot typing';
    el.textContent = label || 'Ёзмоқда…';
    $body.appendChild(el);
    $body.scrollTop = $body.scrollHeight;
    return el;
  }

  // Server is JSON-schema-strict, but keep a defensive scrub on the answer field.
  function scrubText(t) {
    return t
      .replace(/【[^】]*】/g, '')
      .replace(/\[\d+(?::\d+)?(?:†[^\]]*)?\]/g, '')
      .replace(/^\s*(?:[\u{1F4C4}\u{1F4D6}\u{1F4DC}\u{1F4D1}]\s*)?(?:Манба|Manba|Source|Sources|Источник|Источники|Reference|References)\s*[:：].*$/gimu, '')
      .replace(/[\w-]+_data\.json|boysun\.json/gi, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  // ── Section → slide mapping & navigation ──────────────────
  // Dashboard slides (data-slide / #slide-N):
  //   1 Иқтисодий фаоллик   2 Инфратузилма   3 Аҳоли ва бандлик
  //   4 Маҳалла тадбиркорлиги ва банк   5 Имкониятлар   6 Хулоса ва режа
  const SECTION_TO_SLIDE = {
    population:     '3',
    labor:          '3',
    economy:        '1',
    trade:          '1',
    infrastructure: '2',
    education:      '2',
    business:       '4',
    credits:        '4',
    tourism:        '5',
    general:        '0',  // home
  };

  function navigateToSection(section) {
    const slide = SECTION_TO_SLIDE[section];
    if (slide == null) return;

    // Use the same nav path the sidebar uses: hash → handleHash() → activates page
    const hash = (slide === '0') ? '#home' : '#slide-' + slide;
    if (location.hash !== hash) location.hash = hash;

    // Highlight target page + sidebar item briefly
    const targetId = (slide === '0') ? 'home' : 'slide-' + slide;
    requestAnimationFrame(() => {
      const page = document.getElementById(targetId);
      if (page) {
        page.classList.remove('sqb-highlight');
        // force reflow so animation re-runs even if same target
        void page.offsetWidth;
        page.classList.add('sqb-highlight');
        try { page.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
        setTimeout(() => page.classList.remove('sqb-highlight'), 2800);
      }
      const sideItem = document.querySelector('.side-item[data-slide="' + slide + '"]');
      if (sideItem) {
        sideItem.classList.remove('sqb-side-pulse');
        void sideItem.offsetWidth;
        sideItem.classList.add('sqb-side-pulse');
        setTimeout(() => sideItem.classList.remove('sqb-side-pulse'), 2400);
      }
    });
  }

  // ── Partial-JSON parser for streaming ─────────────────────
  // The model is forced (json_schema strict) to emit ONE JSON object:
  //   {"answer":"...","target_section":"..."}
  // While streaming, extract the in-progress "answer" string by walking
  // chars after `"answer":"` and respecting JSON escape rules. Also try
  // to extract target_section once the answer string closes.
  function parsePartial(raw) {
    const m = raw.match(/"answer"\s*:\s*"/);
    if (!m) return { answer: '', section: null, complete: false };
    const start = m.index + m[0].length;
    let i = start, out = '', closed = false;
    while (i < raw.length) {
      const c = raw[i];
      if (c === '\\') {
        const n = raw[i + 1];
        if (n === undefined) break; // partial escape — wait
        if (n === 'n') out += '\n';
        else if (n === 't') out += '\t';
        else if (n === 'r') out += '\r';
        else if (n === 'b') out += '\b';
        else if (n === 'f') out += '\f';
        else if (n === 'u') {
          if (i + 5 >= raw.length) break;
          out += String.fromCharCode(parseInt(raw.slice(i + 2, i + 6), 16));
          i += 6; continue;
        } else { out += n; }
        i += 2;
      } else if (c === '"') { closed = true; i++; break; }
      else { out += c; i++; }
    }
    let section = null;
    if (closed) {
      const t = raw.slice(i).match(/"target_section"\s*:\s*"([a-z_]+)"/);
      if (t) section = t[1];
    }
    return { answer: out, section, complete: closed && section !== null };
  }

  async function send(text) {
    if (!text || state.busy) return;
    state.busy = true;
    $send.disabled = true;

    appendMsg('user', text);
    state.messages.push({ role: 'user', content: text });

    const empty = $body.querySelector('.sqb-chat-empty');
    if (empty) empty.remove();
    const bubble = document.createElement('div');
    bubble.className = 'sqb-msg bot streaming';
    bubble.innerHTML = '<span class="sqb-status">Маълумотлар қидирилмоқда…</span><span class="sqb-cursor"></span>';
    $body.appendChild(bubble);
    $body.scrollTop = $body.scrollHeight;

    let raw = '';                 // raw concatenated JSON string from the model
    let lastAnswer = '';
    let finalSection = null;

    const renderLive = () => {
      const p = parsePartial(raw);
      if (p.answer && p.answer !== lastAnswer) {
        lastAnswer = p.answer;
        bubble.innerHTML = mdToHtml(scrubText(p.answer)) + '<span class="sqb-cursor"></span>';
        $body.scrollTop = $body.scrollHeight;
      }
      if (!finalSection && p.section) finalSection = p.section;
    };

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body: JSON.stringify({ messages: state.messages, tuman: currentTuman(), stream: true }),
      });

      if (!res.ok || !res.body) {
        let msg = 'HTTP ' + res.status;
        try { const j = await res.json(); if (j.error) msg = j.error; } catch (e) {}
        bubble.classList.remove('streaming');
        bubble.innerHTML = mdToHtml('⚠️ Хато: ' + msg);
        return;
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let sep;
        while ((sep = buf.indexOf('\n\n')) !== -1) {
          const evt = buf.slice(0, sep);
          buf = buf.slice(sep + 2);
          for (const line of evt.split('\n')) {
            if (!line.startsWith('data:')) continue;
            const dataStr = line.slice(5).trim();
            if (!dataStr || dataStr === '[DONE]') continue;
            let d; try { d = JSON.parse(dataStr); } catch (e) { continue; }
            const t = d.type;
            if (t === 'response.output_text.delta' && typeof d.delta === 'string') {
              raw += d.delta;
              renderLive();
            } else if (t === 'response.output_text.done' && typeof d.text === 'string') {
              raw = d.text; // authoritative final string
              renderLive();
            } else if (t === 'response.error' || t === 'error') {
              raw += '\n' + (d.error?.message || d.message || 'Streaming error');
            }
          }
        }
      }

      // Finalise: parse the full JSON if possible
      let answer = '', section = finalSection || 'general';
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.answer === 'string') answer = parsed.answer;
        if (parsed && typeof parsed.target_section === 'string') section = parsed.target_section;
      } catch (e) {
        answer = lastAnswer;
      }
      answer = scrubText(answer).trim() || 'Кечирасиз, жавоб олишда хатолик юз берди. Қайта уриниб кўринг.';

      bubble.classList.remove('streaming');
      bubble.innerHTML = mdToHtml(answer);
      state.messages.push({ role: 'assistant', content: answer });

      navigateToSection(section);
    } catch (err) {
      bubble.classList.remove('streaming');
      bubble.innerHTML = mdToHtml('⚠️ Тармоқ хатоси: ' + err.message);
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
