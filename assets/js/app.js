// SQB Bank Presidential Dashboard
// Note: all dynamic strings pass through escapeHTML() before being inserted.
const SLIDES = [
  {n:1,title:"Иқтисодий фаоллик",          section:"I",  icon:"bi-graph-up-arrow",       desc:"Саноат, қурилиш, ишлаб чиқариш ва иқтисодий ўсиш кўрсаткичлари"},
  {n:2,title:"Инфратузилма",                section:"II", icon:"bi-buildings",            desc:"Йўл, газ, сув, электр энергия ва коммунал инфратузилма"},
  {n:3,title:"Аҳоли ва бандлик",            section:"III",icon:"bi-people-fill",          desc:"Демография, иш билан таъминлаш, мигратсия ва камбағаллик"},
  {n:4,title:"Имкониятлар (1-қисм)",        section:"IV", icon:"bi-stars",                desc:"Туман имкониятлари, ресурслар ва салоҳият — биринчи қисм"},
  {n:5,title:"Имкониятлар (2-қисм)",        section:"IV", icon:"bi-stars",                desc:"Имкониятлар таҳлилининг иккинчи қисми"},
  {n:6,title:"Лойиҳалар фабрикаси: Қишлоқ хўжалиги", section:"V", icon:"bi-tree",         desc:"АПК, деҳқончилик, чорвачилик лойиҳалари"},
  {n:7,title:"Лойиҳалар фабрикаси: Саноат",  section:"V", icon:"bi-gear-wide-connected", desc:"Саноат лойиҳалари, кластерлар, экспорт"},
  {n:8,title:"Лойиҳалар фабрикаси: Хизматлар",section:"V",icon:"bi-shop",                 desc:"Хизмат кўрсатиш, савдо, туризм лойиҳалари"},
  {n:9,title:"Хулоса ва ҳаракатлар режаси",  section:"V", icon:"bi-flag-fill",            desc:"Якуний хулосалар, тавсиялар ва ҳаракатлар режаси"},
];

const STATE = {
  district:"gijduvon",
  data:{gijduvon:null,shofirkon:null},
  search:"",
  filter:"all",
  charts:{},     // canvasId -> Chart instance (for cleanup)
  pending:[],    // queue of {id, type, parsed} to init after DOM insert
};

// ============================================================
// VALUE PARSER — classifies indicator.value into a typed object
// Types: timeseries | breakdown | single_metric | list | text | empty
// ============================================================
function parseValue(raw, ctx){
  ctx = ctx || {};
  if(raw==null || raw==="") return {type:"empty"};
  const str = String(raw).trim();

  // Strip leading "[Tag]" prefix and capture as label
  let label = "";
  const tagM = str.match(/^\[([^\]]+)\]\s*/);
  const body = tagM ? str.slice(tagM[0].length) : str;
  if(tagM) label = tagM[1];

  // ---- Labeled breakdown detection (e.g. "Юридик шахслар: 1 854 та | Кичик бизнес: 194 та") ----
  // Split on |, ;, or ". " — each segment must look like "Label: number unit"
  const segs = body.split(/\s*[\|;]\s*|\.\s+(?=[А-ЯЎҒҲҚЁA-Z])/).map(function(s){return s.trim();}).filter(Boolean);
  if(segs.length>=2 && segs.length<=6){
    const labeled = segs.filter(function(s){
      // No leading year, has a colon, and contains a digit after the colon
      if(/^(?:19|20)\d{2}\b/.test(s)) return false;
      const m = s.match(/^([^:]{2,40}):\s*(.+)$/);
      if(!m) return false;
      return /\d/.test(m[2]);
    });
    if(labeled.length===segs.length){
      return {type:"breakdown", label:label, items:segs.slice(0,6)};
    }
  }

  // ---- Explicit year-value pair detection ----
  // Examples: "2021: 123,4", "2021й - 123", "2021 — 45.2", "2021/123", "(2021) 123"
  const yearPairs = [];
  const seenYears = {};
  const yp = /(?:^|[\s\(\|;,])((?:19|20)\d{2})\s*(?:й(?:ил)?)?\s*[\-\u2014:\/=]\s*(-?\d{1,7}(?:[\.,]\d+)?)/g;
  let mp;
  while((mp = yp.exec(body))!==null){
    const y = parseInt(mp[1]);
    const v = parseFloat(mp[2].replace(",","."));
    if(y>=2010 && y<=2035 && !isNaN(v) && !seenYears[y]){ seenYears[y]=1; yearPairs.push({year:y, value:v}); }
  }
  if(yearPairs.length>=2){
    yearPairs.sort(function(a,b){return a.year-b.year;});
    return finalizeTimeseries(label, yearPairs, detectUnit(label, body), "");
  }

  // Bullet list detection
  if(/^[\u2022\-\*]\s/m.test(body) || body.split(/\n|;/).filter(function(x){return x.trim().length;}).length>=4 && /:/.test(body)){
    const items = body.split(/\n|;|\|\|/).map(function(x){return x.trim();}).filter(Boolean);
    if(items.length>=3 && items.length<=12 && !looksNumeric(body)){
      return {type:"list", label:label, items:items};
    }
  }

  // Extract clean numbers (skip year-like 4-digit and identifier-like long ints)
  const tokens = body.split(/[|;]+|\s{2,}/).map(function(t){return t.trim();}).filter(Boolean);
  const allNums = [];
  tokens.forEach(function(t){
    // strip trailing % and currency hints, then test
    const stripped = t.replace(/%$/,"").trim();
    const m = stripped.match(/^-?\d{1,7}([\.,]\d+)?$/);
    if(m){
      const n = parseFloat(stripped.replace(",","."));
      if(!isNaN(n)) allNums.push(n);
    }
  });

  // Filter: drop obvious year tokens (2018-2030) and drop integers >100000 (likely IDs)
  const cleaned = allNums.filter(function(n){
    if(n>=2018 && n<=2030 && Number.isInteger(n)) return false;
    if(n>100000) return false;
    return true;
  });

  // Find textual breadcrumb tokens (non-numeric)
  const textTokens = tokens.filter(function(t){
    return !/^-?\d/.test(t) && t!=="х" && t.length>1 && t.length<60;
  });

  // Detect unit
  const unit = detectUnit(label, body);

  if(cleaned.length>=3){
    // Try to infer year labels from ctx.name + ctx.desc + body — find a YYYY-YYYY range
    const hayAll = (ctx.name||"")+" "+(ctx.desc||"")+" "+body;
    const rangeM = hayAll.match(/(20\d{2})\s*[\-\u2013\u2014]\s*(20\d{2})/);
    let series;
    const vals = cleaned.slice(0,8);
    if(rangeM){
      const y1 = parseInt(rangeM[1]); const y2 = parseInt(rangeM[2]);
      if(y2>=y1 && (y2-y1+1)===vals.length){
        series = vals.map(function(v,i){return {year:y1+i, value:v};});
      } else if(y2>=y1){
        // Align to the end so latest value = y2
        const start = y2 - vals.length + 1;
        series = vals.map(function(v,i){return {year:start+i, value:v};});
      }
    }
    if(!series){
      // Fall back: assume series ends at current data year (2025)
      const endY = 2025;
      const start = endY - vals.length + 1;
      series = vals.map(function(v,i){return {year:start+i, value:v};});
    }
    return finalizeTimeseries(label, series, unit, textTokens.slice(-1)[0]||"");
  }
  if(cleaned.length===2){
    const [a,b] = cleaned;
    const delta = a!==0 ? ((b-a)/Math.abs(a))*100 : null;
    return {type:"single_metric", label:label, value:b, prev:a, delta:delta, unit:unit, context:textTokens.slice(-1)[0]||""};
  }
  if(cleaned.length===1){
    return {type:"single_metric", label:label, value:cleaned[0], prev:null, delta:null, unit:unit, context:textTokens.slice(-1)[0]||""};
  }

  // Multi-token textual content with separators -> breakdown of categories
  if(textTokens.length>=3){
    return {type:"breakdown", label:label, items:textTokens.slice(0,6)};
  }

  return {type:"text", label:label, text:body};
}

function looksNumeric(s){return /\d/.test(s);}

// Build a fully-described timeseries with stats + AI insight
function finalizeTimeseries(label, series, unit, context){
  const values = series.map(function(p){return p.value;});
  const years = series.map(function(p){return p.year;});
  const last = values[values.length-1];
  const first = values[0];
  const prev = values.length>=2 ? values[values.length-2] : null;
  const yoy = (prev!=null && prev!==0) ? ((last-prev)/Math.abs(prev))*100 : null;
  const yoyAbs = (prev!=null) ? (last-prev) : null;
  let cagr = null;
  if(values.length>=3 && first>0 && last>0){
    cagr = (Math.pow(last/first, 1/(values.length-1)) - 1) * 100;
  }
  const min = Math.min.apply(null, values);
  const max = Math.max.apply(null, values);
  const insight = buildInsight(values, cagr);
  return {
    type:"timeseries", label:label, series:series, values:values, years:years,
    unit:unit, context:context,
    last:last, first:first, prev:prev, yoy:yoy, yoyAbs:yoyAbs,
    cagr:cagr, min:min, max:max, insight:insight,
  };
}

function buildInsight(vals, cagr){
  const n = vals.length;
  if(n<2) return null;
  let incCount=0, decCount=0;
  for(let i=1;i<n;i++){
    if(vals[i]>vals[i-1]) incCount++;
    else if(vals[i]<vals[i-1]) decCount++;
  }
  const last = vals[n-1], first = vals[0], prev = vals[n-2];
  const allInc = incCount===n-1;
  const allDec = decCount===n-1;
  // Recovery: declined first half, then growth
  const half = Math.floor(n/2);
  const declinedEarly = vals[half] < vals[0];
  const grewLate = vals[n-1] > vals[half];

  function fmt(x){return fmtNum(x);}
  if(allInc && cagr!=null && cagr>5){
    const forecast = last * Math.pow(1+cagr/100, 2);
    return "✨ Барқарор ўсиш — "+n+" йилда "+cagr.toFixed(1)+"% йиллик ўртача суръат, тренд сақланса 2027 йилда ~"+fmt(forecast)+" га етади.";
  }
  if(allDec || (cagr!=null && cagr<-2)){
    const pct = (prev!==0) ? Math.abs((last-prev)/prev*100) : 0;
    return "🔻 Пасайиш тренди — охирги 2 йилда "+pct.toFixed(1)+"% га камайди, дарҳол чора кўриш зарур.";
  }
  if(declinedEarly && grewLate && last>=first*0.9){
    return "🔄 Тикланиш — пасайишдан сўнг ўсиш бошланган, мониторинг кучайтирилсин.";
  }
  if(incCount>0 && decCount>0 && Math.abs(incCount-decCount)<=1){
    return "↕ Нотурғун динамика — йиллар оралиғи кескин ўзгариб турибди, барқарорлаштириш керак.";
  }
  if(cagr!=null && cagr>=0 && cagr<=5){
    return "⚠ Секин ўсиш — динамика заиф, қўшимча инвестиция талаб этилади.";
  }
  return "ℹ Кўрсаткич барқарор, қўшимча таҳлил зарур.";
}

function detectUnit(label, body){
  const hay = (label+" "+body).toLowerCase();
  if(/млрд\s*сў?м|млрд\.?\s*so/i.test(hay)) return "млрд сўм";
  if(/млн\s*сў?м/i.test(hay)) return "млн сўм";
  if(/млн\s*\$|млн\s*usd/i.test(hay)) return "млн $";
  if(/\bга\b/.test(hay)) return "га";
  if(/\bта\b/.test(hay)) return "та";
  if(/%|фоиз/.test(hay)) return "%";
  if(/киши|аҳол/.test(hay)) return "киши";
  return "";
}

function fmtNum(n){
  if(n==null||isNaN(n)) return "—";
  const abs = Math.abs(n);
  if(abs>=1000) return n.toLocaleString("ru-RU",{maximumFractionDigits:0});
  if(abs>=100) return n.toFixed(1);
  if(abs>=10) return n.toFixed(1);
  return n.toFixed(2);
}

// ============================================================
// VALUE RENDERER
// ============================================================
function renderValue(ind, canvasId){
  if(!ind.found || !ind.value){
    return '<div class="ic-value empty">'+
      '<div class="ic-value-label">Ҳолат</div>'+
      '<div class="ic-value-text">Маълумот мавжуд эмас</div></div>';
  }
  const p = parseValue(ind.value, {name:ind.name, desc:ind.desc});

  if(p.type==="timeseries"){
    STATE.pending.push({id:canvasId, kind:"line", series:p.series});
    const yoyPill = (p.yoy!=null) ?
      ('<span class="metric-delta '+(p.yoy>=0?'up':'down')+'">'+(p.yoy>=0?'▲ +':'▼ ')+fmtNum(p.yoyAbs)+' ('+(p.yoy>=0?'+':'')+p.yoy.toFixed(1)+'%)</span>')
      : '';
    return '<div class="ic-value rich">'+
      '<div class="ic-value-head"><div class="ic-value-label">Йиллик динамика</div>'+
      (p.label?'<span class="val-tag">'+escapeHTML(p.label)+'</span>':'')+'</div>'+
      '<div class="trend-top">'+
        '<div class="trend-num">'+fmtNum(p.last)+(p.unit?' <span class="metric-unit">'+escapeHTML(p.unit)+'</span>':'')+'</div>'+
        yoyPill+
      '</div>'+
      '<div class="value-chart-wrap trend"><canvas id="'+canvasId+'"></canvas></div>'+
      (p.insight?'<div class="trend-insight"><i class="bi bi-robot"></i><em>'+escapeHTML(p.insight)+'</em></div>':'')+
      '</div>';
  }

  if(p.type==="single_metric"){
    return '<div class="ic-value rich">'+
      '<div class="ic-value-head"><div class="ic-value-label">Қиймат</div>'+
      (p.label?'<span class="val-tag">'+escapeHTML(p.label)+'</span>':'')+'</div>'+
      '<div class="metric-value">'+fmtNum(p.value)+'</div>'+
      (p.unit?'<div class="metric-unit">'+escapeHTML(p.unit)+'</div>':'')+
      (p.delta!=null?'<div class="metric-delta-wrap">'+deltaHTML(p.delta)+
        '<span class="metric-prev">'+fmtNum(p.prev)+' → '+fmtNum(p.value)+'</span></div>':'')+
      '</div>';
  }

  if(p.type==="breakdown"){
    STATE.pending.push({id:canvasId, kind:"bars", data:p.items.map(function(_,i){return p.items.length-i;})});
    return '<div class="ic-value rich">'+
      '<div class="ic-value-head"><div class="ic-value-label">Тақсимот</div>'+
      (p.label?'<span class="val-tag">'+escapeHTML(p.label)+'</span>':'')+'</div>'+
      '<ul class="value-pills">'+
      p.items.map(function(t){return '<li>'+escapeHTML(t)+'</li>';}).join("")+
      '</ul></div>';
  }

  if(p.type==="list"){
    return '<div class="ic-value rich">'+
      '<div class="ic-value-head"><div class="ic-value-label">Рўйхат</div></div>'+
      '<ul class="value-list">'+
      p.items.map(function(t){return '<li>'+escapeHTML(t)+'</li>';}).join("")+
      '</ul></div>';
  }

  // text fallback
  return '<div class="ic-value rich">'+
    '<div class="ic-value-head"><div class="ic-value-label">Маълумот</div>'+
    (p.label?'<span class="val-tag">'+escapeHTML(p.label)+'</span>':'')+'</div>'+
    '<blockquote class="value-text">'+escapeHTML(p.text||ind.value)+'</blockquote>'+
    '</div>';
}

function deltaHTML(d){
  if(d==null||isNaN(d)) return "";
  const up = d>=0;
  const arrow = up?"▲":"▼";
  return '<span class="metric-delta '+(up?'up':'down')+'">'+arrow+' '+(up?'+':'')+d.toFixed(1)+'%</span>';
}

function destroyAllCharts(){
  Object.keys(STATE.charts).forEach(function(k){
    try{STATE.charts[k].destroy();}catch(e){}
    delete STATE.charts[k];
  });
}

function flushPendingCharts(){
  STATE.pending.forEach(function(job){
    const el = document.getElementById(job.id);
    if(!el) return;
    if(STATE.charts[job.id]){try{STATE.charts[job.id].destroy();}catch(e){}}
    const ctx = el.getContext("2d");
    if(job.kind==="line"){
      const grad = ctx.createLinearGradient(0,0,0,140);
      grad.addColorStop(0,"rgba(0,126,136,.35)");
      grad.addColorStop(1,"rgba(0,126,136,0)");
      const series = job.series || [];
      const labels = series.map(function(p){return p.year;});
      const data = series.map(function(p){return p.value;});
      const lastIdx = data.length-1;
      const radii = data.map(function(_,i){return i===lastIdx?5:0;});
      const pointBg = data.map(function(_,i){return i===lastIdx?"#C25E3C":"#005F68";});
      const pointBd = data.map(function(_,i){return i===lastIdx?"#fff":"#005F68";});
      STATE.charts[job.id] = new Chart(ctx,{
        type:"line",
        data:{
          labels:labels,
          datasets:[{
            data:data,
            borderColor:"#005F68",
            backgroundColor:grad,
            borderWidth:2.4,
            tension:.4,
            fill:true,
            pointRadius:radii,
            pointHoverRadius:6,
            pointBackgroundColor:pointBg,
            pointBorderColor:pointBd,
            pointBorderWidth:2,
          }],
        },
        options:{
          responsive:true,maintainAspectRatio:false,
          layout:{padding:{top:6,right:6,left:6,bottom:0}},
          plugins:{legend:{display:false},tooltip:{
            backgroundColor:"#102836",padding:10,
            titleFont:{family:"Inter",size:11,weight:"700"},
            bodyFont:{family:"Inter",size:13,weight:"700"},
            displayColors:false,
            callbacks:{
              title:function(items){return items[0].label+" йил";},
              label:function(c){return "  "+fmtNum(c.parsed.y);},
            },
          }},
          scales:{
            x:{display:true,grid:{display:false},border:{display:false},
               ticks:{font:{family:"Inter",size:10,weight:"600"},color:"#7a8a93",padding:4}},
            y:{display:false,grid:{color:"rgba(0,126,136,.06)"},border:{display:false}},
          },
          animation:{duration:700},
        },
      });
    }
  });
  STATE.pending = [];
}

const DISTRICT_LABEL = {gijduvon:"Ғиждувон тумани", shofirkon:"Шофиркон тумани"};

async function init(){
  setDate();
  const [g,s] = await Promise.all([
    fetch("assets/data/gijduvon.json").then(r=>r.json()),
    fetch("assets/data/shofirkon.json").then(r=>r.json()),
  ]);
  STATE.data.gijduvon = g;
  STATE.data.shofirkon = s;

  buildSlidePages();
  bindEvents();
  render();
  handleHash();
}

function setDate(){
  const d=new Date();
  const m=["январ","феврал","март","апрел","май","июн","июл","август","сентябр","октябр","ноябр","декабр"];
  document.getElementById("todayDate").textContent = d.getDate()+" "+m[d.getMonth()]+" "+d.getFullYear();
}

function buildSlidePages(){
  const wrap = document.getElementById("slidePages");
  const html = SLIDES.map(function(s){
    return '<section id="slide-'+s.n+'" class="page" data-slide-page="'+s.n+'">'+
      '<div class="slide-header"><div class="sh-left">'+
      '<div class="sh-eye">СЛАЙД '+s.n+' • '+s.section+'-БЎЛИМ</div>'+
      '<h1 class="sh-title"><i class="bi '+s.icon+'"></i> '+escapeHTML(s.title)+'</h1>'+
      '<div class="sh-meta">'+escapeHTML(s.desc)+' • <strong id="sh-district-'+s.n+'">Ғиждувон тумани</strong></div>'+
      '</div><div class="sh-right">'+
      '<div class="sh-stat"><div class="v" id="sh-total-'+s.n+'">0</div><div class="l">Жами</div></div>'+
      '<div class="sh-stat"><div class="v" id="sh-found-'+s.n+'">0</div><div class="l">Топилган</div></div>'+
      '<div class="sh-stat"><div class="v" id="sh-pct-'+s.n+'">0%</div><div class="l">Тўлиқлик</div></div>'+
      '</div></div>'+
      '<div class="filter-bar">'+
      '<div class="chip filter-chip active" data-f="all">Барча <span class="badge-n" id="ch-all-'+s.n+'">0</span></div>'+
      '<div class="chip filter-chip" data-f="found"><i class="bi bi-check-circle-fill" style="color:var(--success)"></i> Топилган <span class="badge-n" id="ch-ok-'+s.n+'">0</span></div>'+
      '<div class="chip filter-chip" data-f="missing"><i class="bi bi-x-circle-fill" style="color:var(--warn)"></i> Топилмаган <span class="badge-n" id="ch-no-'+s.n+'">0</span></div>'+
      '</div>'+
      '<div class="cards-grid" id="cards-'+s.n+'"></div>'+
      '</section>';
  }).join("");
  wrap.innerHTML = html;
}

function bindEvents(){
  document.querySelectorAll(".dt-btn").forEach(function(btn){
    btn.addEventListener("click",function(){
      document.querySelectorAll(".dt-btn").forEach(function(b){b.classList.remove("active");});
      btn.classList.add("active");
      STATE.district = btn.dataset.district;
      render();
    });
  });

  document.getElementById("searchInput").addEventListener("input",function(e){
    STATE.search = e.target.value.toLowerCase().trim();
    renderAllCards();
  });

  document.querySelectorAll(".side-item").forEach(function(a){
    a.addEventListener("click",function(e){
      const slide = a.dataset.slide;
      navigate(slide==="0"?"home":"slide-"+slide);
      e.preventDefault();
    });
  });

  document.addEventListener("click",function(e){
    const chip = e.target.closest(".filter-chip");
    if(!chip) return;
    const sec = chip.closest("section");
    sec.querySelectorAll(".filter-chip").forEach(function(c){c.classList.remove("active");});
    chip.classList.add("active");
    STATE.filter = chip.dataset.f;
    renderCardsForSlide(parseInt(sec.dataset.slidePage));
  });

  document.addEventListener("click",function(e){
    const ov = e.target.closest(".ov-card");
    if(!ov) return;
    navigate("slide-"+ov.dataset.slide);
  });

  window.addEventListener("hashchange",handleHash);
}

function navigate(id){ location.hash = "#"+id; }

function handleHash(){
  const id = (location.hash||"#home").slice(1);
  document.querySelectorAll(".page").forEach(function(p){
    p.classList.toggle("active",p.id===id);
  });
  document.querySelectorAll(".side-item").forEach(function(a){
    a.classList.toggle("active",a.getAttribute("href")==="#"+id);
  });
  window.scrollTo({top:0,behavior:"smooth"});
}

function render(){
  const data = STATE.data[STATE.district];
  const label = DISTRICT_LABEL[STATE.district];

  document.getElementById("heroDistrict").textContent = label;

  renderRegionKpis(data);
  renderAiPanel(data);
  renderOverview(data);

  SLIDES.forEach(function(s){
    const inds = data.indicators.filter(function(i){return i.slide===s.n;});
    const f = inds.filter(function(i){return i.found;}).length;
    const p = Math.round(f/inds.length*100);
    document.getElementById("sh-district-"+s.n).textContent = label;
    document.getElementById("sh-total-"+s.n).textContent = inds.length;
    document.getElementById("sh-found-"+s.n).textContent = f;
    document.getElementById("sh-pct-"+s.n).textContent = p+"%";
    document.getElementById("ch-all-"+s.n).textContent = inds.length;
    document.getElementById("ch-ok-"+s.n).textContent = f;
    document.getElementById("ch-no-"+s.n).textContent = inds.length-f;
  });

  renderAllCards();
}

function renderOverview(data){
  const wrap = document.getElementById("slidesOverview");
  const html = SLIDES.map(function(s){
    const inds = data.indicators.filter(function(i){return i.slide===s.n;});
    const f = inds.filter(function(i){return i.found;}).length;
    const pct = Math.round(f/inds.length*100);
    return '<div class="col-xl-4 col-lg-6"><div class="ov-card" data-slide="'+s.n+'">'+
      '<div class="ov-num">'+String(s.n).padStart(2,"0")+'</div>'+
      '<div class="ov-ic"><i class="bi '+s.icon+'"></i></div>'+
      '<div class="ov-title">Слайд '+s.n+'. '+escapeHTML(s.title)+'</div>'+
      '<div class="ov-meta">'+s.section+'-бўлим • '+inds.length+' та кўрсаткич</div>'+
      '<div class="ov-bar"><div style="width:'+pct+'%"></div></div>'+
      '<div class="ov-stats"><span>'+f+' / '+inds.length+' топилган</span><span class="pct">'+pct+'%</span></div>'+
      '</div></div>';
  }).join("");
  wrap.innerHTML = html;
}

function renderAllCards(){
  destroyAllCharts();
  SLIDES.forEach(function(s){renderCardsForSlide(s.n);});
  // Defer chart init to next frame so canvases are in DOM
  requestAnimationFrame(flushPendingCharts);
}

function renderCardsForSlide(n){
  const data = STATE.data[STATE.district];
  let inds = data.indicators.filter(function(i){return i.slide===n;});

  if(STATE.filter==="found") inds = inds.filter(function(i){return i.found;});
  else if(STATE.filter==="missing") inds = inds.filter(function(i){return !i.found;});

  if(STATE.search){
    const q = STATE.search;
    inds = inds.filter(function(i){
      return (i.name||"").toLowerCase().indexOf(q)>=0 ||
             (i.desc||"").toLowerCase().indexOf(q)>=0 ||
             String(i.value||"").toLowerCase().indexOf(q)>=0;
    });
  }

  const grid = document.getElementById("cards-"+n);
  if(!inds.length){
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:50px;color:var(--muted)"><i class="bi bi-inbox" style="font-size:48px;color:var(--line)"></i><div style="margin-top:12px;font-weight:600">Натижа топилмади</div></div>';
    return;
  }

  grid.innerHTML = inds.map(function(i,idx){return cardHTML(i,idx);}).join("");
}

function cardHTML(i,idx){
  const found = i.found;
  const cid = "vchart-"+STATE.district+"-"+i.slide+"-"+i.no;
  return '<div class="ind-card '+(found?'':'missing')+'" style="animation-delay:'+Math.min(idx*30,400)+'ms">'+
    '<div class="ic-head"><div class="ic-no">#'+i.no+'</div>'+
    '<div class="ic-badges">'+
    '<span class="b '+(found?'ok':'no')+'"><i class="bi '+(found?'bi-check-circle-fill':'bi-x-circle-fill')+'"></i> '+(found?'Топилган':'Топилмаган')+'</span>'+
    '<span class="b tag">Слайд '+i.slide+'</span>'+
    '</div></div>'+
    '<h3 class="ic-title">'+escapeHTML(i.name)+'</h3>'+
    '<p class="ic-desc">'+escapeHTML(i.desc||'')+'</p>'+
    renderValue(i,cid)+
    '</div>';
}

function escapeHTML(str){
  return String(str).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

// ============================================================
// REGION KPI TILES (hero)
// ============================================================
function findIndicator(data, no){
  return (data.indicators||[]).find(function(i){return i.no===no;});
}

function kpiFromIndicator(data, no, opts){
  const ind = findIndicator(data, no);
  if(!ind || !ind.found || !ind.value) return null;
  const p = parseValue(ind.value, {name:ind.name, desc:ind.desc});
  const out = {value:null, unit:opts.unit||"", delta:null, deltaDir:null};
  if(p.type==="timeseries"){
    out.value = p.last;
    out.unit = opts.unit || p.unit || "";
    if(p.yoy!=null){
      out.delta = (p.yoy>=0?'+':'')+p.yoy.toFixed(1)+'%';
      out.deltaDir = p.yoy>0?'up':(p.yoy<0?'down':'flat');
    }
  } else if(p.type==="single_metric"){
    out.value = p.value;
    out.unit = opts.unit || p.unit || "";
    if(p.delta!=null){
      out.delta = (p.delta>=0?'+':'')+p.delta.toFixed(1)+'%';
      out.deltaDir = p.delta>0?'up':(p.delta<0?'down':'flat');
    }
  } else if(p.type==="breakdown"){
    // Take the first numeric item (most representative, e.g. "Юридик шахслар: 1 854 та")
    for(let i=0;i<p.items.length;i++){
      const m = p.items[i].match(/[:\-]\s*([\d\s]+(?:[.,]\d+)?)/);
      if(m){
        const n = parseFloat(m[1].replace(/\s/g,"").replace(",","."));
        if(!isNaN(n)){out.value=n; out.unit=opts.unit||""; break;}
      }
    }
  }
  if(out.value==null) return null;
  return out;
}

const REGION_KPI_DEFS = [
  {no:1,  icon:"bi-buildings-fill",     label:"Саноат ишлаб чиқариш", unit:"млрд сўм"},
  {no:4,  icon:"bi-globe2",              label:"Экспорт",              unit:"млн $"},
  {no:11, icon:"bi-shop-window",         label:"Янги корхоналар",      unit:"та"},
  {no:6,  icon:"bi-cash-coin",           label:"Маҳаллий бюджет",      unit:"млрд сўм"},
  {no:47, icon:"bi-people-fill",         label:"Аҳоли",                unit:"минг киши"},
  {no:51, icon:"bi-arrow-down-circle",   label:"Камбағаллик",          unit:"%"},
];

function renderRegionKpis(data){
  const wrap = document.getElementById("regionKpis");
  if(!wrap) return;
  const html = REGION_KPI_DEFS.map(function(def){
    const k = kpiFromIndicator(data, def.no, {unit:def.unit});
    let valHtml, deltaHtml="";
    if(!k){
      valHtml = '<div class="rk-val">—</div>';
    } else {
      valHtml = '<div class="rk-val">'+fmtNum(k.value)+
        (k.unit?' <span class="rk-unit">'+escapeHTML(k.unit)+'</span>':'')+'</div>';
      if(k.delta){
        const arrow = k.deltaDir==='up'?'▲':(k.deltaDir==='down'?'▼':'▬');
        deltaHtml = '<div class="rk-delta '+k.deltaDir+'">'+arrow+' '+escapeHTML(k.delta)+'</div>';
      }
    }
    return '<div class="rk-tile">'+
      '<div class="rk-ic"><i class="bi '+def.icon+'"></i></div>'+
      '<div class="rk-lab">'+escapeHTML(def.label)+'</div>'+
      valHtml + deltaHtml +
    '</div>';
  }).join("");
  wrap.innerHTML = html;
}

// ============================================================
// AI INSIGHTS
// ============================================================
function buildRegionInsights(district){
  const data = STATE.data[district];
  if(!data) return [];
  const stats = [];
  data.indicators.forEach(function(ind){
    if(!ind.found || !ind.value) return;
    const p = parseValue(ind.value, {name:ind.name, desc:ind.desc});
    if(p.type!=="timeseries" || p.values.length<2) return;
    stats.push({name:ind.name, p:p});
  });
  if(!stats.length) return [];

  // Sort by CAGR for growth/decline
  const byCagr = stats.filter(function(s){return s.p.cagr!=null;}).slice().sort(function(a,b){return b.p.cagr-a.p.cagr;});
  const top = byCagr.slice(0,2);
  const decline = byCagr[byCagr.length-1];
  // Stable: smallest abs cagr
  const stable = byCagr.slice().sort(function(a,b){return Math.abs(a.p.cagr)-Math.abs(b.p.cagr);})[0];

  const out = [];
  top.forEach(function(s){
    if(s.p.cagr>2){
      out.push({e:"✨", t:'<b>'+escapeHTML(s.name)+'</b> — '+s.p.cagr.toFixed(1)+'% йиллик ўсиш суръати, охирги қиймат '+fmtNum(s.p.last)+(s.p.unit?' '+s.p.unit:'')+'.'});
    }
  });
  if(decline && decline.p.cagr<-1 && top.indexOf(decline)<0){
    out.push({e:"🔻", t:'<b>'+escapeHTML(decline.name)+'</b> — '+Math.abs(decline.p.cagr).toFixed(1)+'% га камаймоқда, дарҳол чора кўриш керак.'});
  }
  if(stable && top.indexOf(stable)<0 && stable!==decline){
    out.push({e:"📊", t:'<b>'+escapeHTML(stable.name)+'</b> — барқарор динамика, охирги қиймат '+fmtNum(stable.p.last)+(stable.p.unit?' '+stable.p.unit:'')+'.'});
  }
  // Volatile fallback
  if(out.length<3){
    const volatile = stats.find(function(s){
      const v = s.p.values; if(v.length<3) return false;
      let inc=0,dec=0;
      for(let i=1;i<v.length;i++){if(v[i]>v[i-1])inc++;else if(v[i]<v[i-1])dec++;}
      return inc>0 && dec>0 && Math.abs(inc-dec)<=1;
    });
    if(volatile) out.push({e:"↕", t:'<b>'+escapeHTML(volatile.name)+'</b> — нотурғун динамика, барқарорлаштириш зарур.'});
  }
  return out.slice(0,4);
}

function renderAiPanel(data){
  const ul = document.getElementById("aiBullets");
  if(!ul) return;
  const items = buildRegionInsights(STATE.district);
  if(!items.length){
    ul.innerHTML = '<li><span class="ai-emoji">ℹ</span><span>Таҳлил учун маълумот етарли эмас.</span></li>';
    return;
  }
  ul.innerHTML = items.map(function(it){
    return '<li><span class="ai-emoji">'+it.e+'</span><span>'+it.t+'</span></li>';
  }).join("");
}

document.addEventListener("DOMContentLoaded",init);
