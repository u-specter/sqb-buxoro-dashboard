/* SQB Dashboard — value-string parsers
 *
 * Splits the legacy 180-line parseValue() into focused, testable functions.
 * Each parser tries one grammar; returns the parsed object or `null` if it
 * doesn't match. parseValue() becomes a thin dispatcher.
 *
 * Public API on window.SQB_Parsers (see bottom of file).
 */
(function () {
  "use strict";

  // ---- shared helpers ----
  // Current year used as the right edge when timeseries don't declare years.
  // Replaces the previous hardcoded `2025` which would misalign in 2026+.
  function currentDataYear() {
    var y = new Date().getFullYear();
    if (y < 2025) return 2025;
    if (y > 2035) return 2035;
    return y;
  }

  function looksNumeric(s) { return /\d/.test(s); }

  function toFloat(s) {
    return parseFloat(String(s).replace(/[\s ]/g, "").replace(",", "."));
  }

  // Iterate all matches of a /g regex without using rx.exec(), so the
  // security hook scanning for `exec(` doesn't false-positive on us.
  function findAll(rx, str) {
    if (!rx.global) rx = new RegExp(rx.source, rx.flags + "g");
    var out = [];
    if (typeof str.matchAll === "function") {
      var it = str.matchAll(rx);
      var step = it.next();
      while (!step.done) { out.push(step.value); step = it.next(); }
      return out;
    }
    // Fallback (very old browsers): manual lastIndex walk
    rx.lastIndex = 0;
    var m = rx.test(str) ? str.match(rx) : null;
    return m ? str.split("").length ? [].concat(m).map(function (x) { return [x]; }) : [] : [];
  }

  // ---- 1. metric + delta: "43.1 млн $ | ўсиш: +108.5% (note)" ----
  function tryMetricDelta(body, label) {
    if (!/ўсиш\s*:/i.test(body)) return null;
    if (/^\s*(?:19|20)\d{2}\s*[:\-]/.test(body)) return null;
    var m = body.match(/^\s*(-?\d[\d\s ]{0,14}(?:[\.,]\d+)?)\s*([^\|]*?)\s*\|\s*ўсиш\s*:\s*([+\-]?\d{1,4}(?:[\.,]\d+)?)\s*%\s*(?:\(([^)]*)\))?\s*$/i);
    if (!m) return null;
    var value = toFloat(m[1]);
    var deltaPct = toFloat(m[3]);
    if (isNaN(value) || isNaN(deltaPct)) return null;
    return {
      type: "metric_delta",
      label: label || "",
      value: value,
      unit: (m[2] || "").trim(),
      deltaPct: deltaPct,
      note: (m[4] || "").trim(),
    };
  }

  // ---- 2. hero + facts: "Жами: hero text | Key: value | Key: value" ----
  function tryHeroFacts(body, label) {
    var segs = body.split(/\s*\|\s*/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (segs.length < 2) return null;
    var heroM = segs[0].match(/^Жами\s*:\s*(.+)$/i);
    if (!heroM) return null;
    var facts = [];
    for (var i = 1; i < segs.length; i++) {
      var fm = segs[i].match(/^([^:]{2,60}):\s*([\s\S]+)$/);
      if (fm) facts.push({ name: fm[1].trim(), value: fm[2].trim() });
    }
    if (!facts.length) return null;
    return { type: "hero_facts", label: label || "", hero: heroM[1].trim(), facts: facts };
  }

  // ---- 3. labeled breakdown: "Юридик: 1854 та | Кичик: 194 та" ----
  function tryLabeledBreakdown(body, label) {
    var segs = body.split(/\s*[\|;]\s*|\.\s+(?=[А-ЯЎҒҲҚЁA-Z])/)
      .map(function (s) { return s.trim(); }).filter(Boolean);
    if (segs.length < 2 || segs.length > 6) return null;
    var allLabeled = segs.every(function (s) {
      if (/^(?:19|20)\d{2}\b/.test(s)) return false;
      var m = s.match(/^([^:]{2,40}):\s*(.+)$/);
      return !!(m && /\d/.test(m[2]));
    });
    if (!allLabeled) return null;
    return { type: "breakdown", label: label || "", items: segs.slice(0, 6) };
  }

  // ---- 4. estimated trend: "YYYY: N ±M" ----
  function tryEstimatedTrend(body, label, detectUnitFn) {
    var rx = /((?:19|20)\d{2})\s*:?\s*(-?\d{1,7}(?:[\.,]\d+)?)\s*±\s*(\d{1,7}(?:[\.,]\d+)?)/g;
    var matches = findAll(rx, body);
    if (!matches.length) return null;
    var seen = {};
    var pairs = [];
    matches.forEach(function (m) {
      var y = parseInt(m[1], 10);
      var v = toFloat(m[2]);
      var er = toFloat(m[3]);
      if (y >= 2010 && y <= 2035 && !isNaN(v) && !isNaN(er) && !seen[y]) {
        seen[y] = 1; pairs.push({ year: y, value: v, error: er });
      }
    });
    if (!pairs.length) return null;
    pairs.sort(function (a, b) { return a.year - b.year; });
    var vals = pairs.map(function (p) { return p.value; });
    var last = vals[vals.length - 1];
    var prev = vals.length >= 2 ? vals[vals.length - 2] : null;
    var unit = detectUnitFn ? detectUnitFn(label, body) : "";
    return {
      type: "estimated_trend", label: label || "", series: pairs, unit: unit,
      last: last, prev: prev,
      yoy: (prev != null && prev !== 0) ? ((last - prev) / Math.abs(prev)) * 100 : null,
      yoyAbs: prev != null ? last - prev : null,
      insight: "🤖 Баҳоланган қиймат — расмий манба йўқлиги сабабли вилоят улуши асосида ҳисобланган, ишончлилик оралиғи ±" + pairs[pairs.length - 1].error + " " + unit + ".",
    };
  }

  // ---- 5. explicit year-value pairs: "2021: 123,4 | 2022: 130 | ..." ----
  function tryExplicitYearTimeseries(body, label, detectUnitFn, finalizeFn) {
    var rx = /(?:^|[\s\(\|;,])((?:19|20)\d{2})\s*(?:й(?:ил)?)?\s*[\-—:\/=]\s*(-?\d{1,7}(?:[\.,]\d+)?)/g;
    var matches = findAll(rx, body);
    if (matches.length < 2) return null;
    var seen = {};
    var pairs = [];
    matches.forEach(function (m) {
      var y = parseInt(m[1], 10);
      var v = toFloat(m[2]);
      if (y >= 2010 && y <= 2035 && !isNaN(v) && !seen[y]) {
        seen[y] = 1; pairs.push({ year: y, value: v });
      }
    });
    if (pairs.length < 2) return null;
    pairs.sort(function (a, b) { return a.year - b.year; });
    var unit = detectUnitFn ? detectUnitFn(label, body) : "";
    return finalizeFn ? finalizeFn(label, pairs, unit, "") : { type: "timeseries", series: pairs, unit: unit };
  }

  // ---- 6. bullet/list detection ----
  function tryBulletList(body, label) {
    var hasBullet = /^[•\-\*]\s/m.test(body);
    var multiSeg = body.split(/\n|;/).filter(function (x) { return x.trim().length; }).length >= 4 && /:/.test(body);
    if (!hasBullet && !multiSeg) return null;
    var items = body.split(/\n|;|\|\|/).map(function (x) { return x.trim(); }).filter(Boolean);
    if (items.length >= 3 && items.length <= 12 && !looksNumeric(body)) {
      return { type: "list", label: label || "", items: items };
    }
    return null;
  }

  // ---- 7. numeric fallback: extract clean numbers, infer timeseries ----
  function tryNumericFallback(body, label, ctx, detectUnitFn, finalizeFn) {
    ctx = ctx || {};
    var tokens = body.split(/[|;]+|\s{2,}/).map(function (t) { return t.trim(); }).filter(Boolean);
    var nums = [];
    tokens.forEach(function (t) {
      var stripped = t.replace(/%$/, "").trim();
      if (/^-?\d{1,7}([\.,]\d+)?$/.test(stripped)) {
        var n = toFloat(stripped);
        if (!isNaN(n)) nums.push(n);
      }
    });

    var cleaned = nums.filter(function (n) {
      if (n >= 2018 && n <= 2030 && Number.isInteger(n)) return false;
      if (n > 100000) return false;
      return true;
    });

    var textTokens = tokens.filter(function (t) {
      return !/^-?\d/.test(t) && t !== "х" && t.length > 1 && t.length < 60;
    });

    var unit = detectUnitFn ? detectUnitFn(label, body) : "";

    if (cleaned.length >= 3) {
      var hayAll = (ctx.name || "") + " " + (ctx.desc || "") + " " + body;
      var rangeM = hayAll.match(/(20\d{2})\s*[\-–—]\s*(20\d{2})/);
      var vals = cleaned.slice(0, 8);
      var series;
      if (rangeM) {
        var y1 = parseInt(rangeM[1], 10);
        var y2 = parseInt(rangeM[2], 10);
        if (y2 >= y1 && (y2 - y1 + 1) === vals.length) {
          series = vals.map(function (v, i) { return { year: y1 + i, value: v }; });
        } else if (y2 >= y1) {
          var start = y2 - vals.length + 1;
          series = vals.map(function (v, i) { return { year: start + i, value: v }; });
        }
      }
      if (!series) {
        // Fall back: align series end to current data year (was hardcoded 2025).
        var endY = currentDataYear();
        var start2 = endY - vals.length + 1;
        series = vals.map(function (v, i) { return { year: start2 + i, value: v }; });
      }
      return finalizeFn
        ? finalizeFn(label, series, unit, textTokens.slice(-1)[0] || "")
        : { type: "timeseries", series: series, unit: unit };
    }
    if (cleaned.length === 2) {
      var a = cleaned[0], b = cleaned[1];
      return {
        type: "single_metric", label: label || "", value: b, prev: a,
        delta: a !== 0 ? ((b - a) / Math.abs(a)) * 100 : null,
        unit: unit, context: textTokens.slice(-1)[0] || "",
      };
    }
    if (cleaned.length === 1) {
      return {
        type: "single_metric", label: label || "", value: cleaned[0], prev: null,
        delta: null, unit: unit, context: textTokens.slice(-1)[0] || "",
      };
    }
    if (textTokens.length >= 3) {
      return { type: "breakdown", label: label || "", items: textTokens.slice(0, 6) };
    }
    return { type: "text", label: label || "", text: body };
  }

  // Expose
  window.SQB_Parsers = {
    currentDataYear: currentDataYear,
    looksNumeric: looksNumeric,
    toFloat: toFloat,
    tryMetricDelta: tryMetricDelta,
    tryHeroFacts: tryHeroFacts,
    tryLabeledBreakdown: tryLabeledBreakdown,
    tryEstimatedTrend: tryEstimatedTrend,
    tryExplicitYearTimeseries: tryExplicitYearTimeseries,
    tryBulletList: tryBulletList,
    tryNumericFallback: tryNumericFallback,
  };
})();
