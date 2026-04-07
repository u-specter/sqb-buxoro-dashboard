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
  donut:null,
  charts:{},     // canvasId -> Chart instance (for cleanup)
  pending:[],    // queue of {id, type, parsed} to init after DOM insert
};

// ============================================================
// VALUE PARSER — classifies indicator.value into a typed object
// Types: timeseries | breakdown | single_metric | list | text | empty
// ============================================================
function parseValue(raw){
  if(raw==null || raw==="") return {type:"empty"};
  const str = String(raw).trim();

  // Strip leading "[Tag]" prefix and capture as label
  let label = "";
  const tagM = str.match(/^\[([^\]]+)\]\s*/);
  const body = tagM ? str.slice(tagM[0].length) : str;
  if(tagM) label = tagM[1];

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
    return {type:"timeseries", label:label, values:cleaned.slice(0,8), unit:unit, context:textTokens.slice(-1)[0]||""};
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
  const p = parseValue(ind.value);

  if(p.type==="timeseries"){
    STATE.pending.push({id:canvasId, kind:"line", data:p.values});
    const last = p.values[p.values.length-1];
    const first = p.values[0];
    const delta = first!==0 ? ((last-first)/Math.abs(first))*100 : null;
    return '<div class="ic-value rich">'+
      '<div class="ic-value-head"><div class="ic-value-label">Динамика</div>'+
      (p.label?'<span class="val-tag">'+escapeHTML(p.label)+'</span>':'')+'</div>'+
      '<div class="metric-row">'+
        '<div class="metric-value-sm">'+fmtNum(last)+(p.unit?' <span class="metric-unit">'+escapeHTML(p.unit)+'</span>':'')+'</div>'+
        (delta!=null?deltaHTML(delta):'')+
      '</div>'+
      '<div class="value-chart-wrap"><canvas id="'+canvasId+'"></canvas></div>'+
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
      const grad = ctx.createLinearGradient(0,0,0,80);
      grad.addColorStop(0,"rgba(6,160,171,.35)");
      grad.addColorStop(1,"rgba(6,160,171,0)");
      STATE.charts[job.id] = new Chart(ctx,{
        type:"line",
        data:{
          labels:job.data.map(function(_,i){return i;}),
          datasets:[{
            data:job.data,
            borderColor:"#06A0AB",
            backgroundColor:grad,
            borderWidth:2.2,
            tension:.4,
            fill:true,
            pointRadius:0,
            pointHoverRadius:4,
            pointHoverBackgroundColor:"#005F68",
          }],
        },
        options:{
          responsive:true,maintainAspectRatio:false,
          plugins:{legend:{display:false},tooltip:{
            backgroundColor:"#102836",padding:8,
            displayColors:false,
            callbacks:{title:function(){return"";},label:function(c){return fmtNum(c.parsed.y);}},
          }},
          scales:{x:{display:false},y:{display:false}},
          animation:{duration:600},
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

  const total = data.total, found = data.found, missing = total-found, pct = Math.round(found/total*100);
  animateCount(document.querySelector('.kpi-tile .kpi-val[data-count="159"]'),159);
  const kF = document.getElementById("kpiFound");
  kF.dataset.count=found; animateCount(kF,found);
  const kM = document.getElementById("kpiMissing");
  kM.dataset.count=missing; animateCount(kM,missing);
  animatePct("kpiPct",pct);
  document.getElementById("chartPct").textContent = pct+"%";

  drawDonut(found,missing);
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
  const fileLine = i.file ? '<div style="margin-top:3px;opacity:.8"><strong>Файл:</strong> '+escapeHTML(i.file)+'</div>' : '';
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
    '<div class="ic-src"><i class="bi bi-folder2-open"></i><div>'+
    '<div><strong>Манба:</strong> '+escapeHTML(i.src||'—')+'</div>'+fileLine+
    '</div></div>'+
    '</div>';
}

function escapeHTML(str){
  return String(str).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

function animateCount(el,target){
  if(!el) return;
  const start=parseInt(el.textContent)||0;
  const dur=900;const t0=performance.now();
  function step(t){
    const p=Math.min(1,(t-t0)/dur);
    const eased=1-Math.pow(1-p,3);
    el.textContent=Math.round(start+(target-start)*eased);
    if(p<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function animatePct(id,target){
  const el=document.getElementById(id);if(!el)return;
  const start=parseInt(el.textContent)||0;
  const dur=900;const t0=performance.now();
  function step(t){
    const p=Math.min(1,(t-t0)/dur);
    const eased=1-Math.pow(1-p,3);
    el.textContent=Math.round(start+(target-start)*eased);
    if(p<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function drawDonut(found,missing){
  const ctx = document.getElementById("coverageDonut");
  if(!ctx) return;
  if(STATE.donut){
    STATE.donut.data.datasets[0].data = [found,missing];
    STATE.donut.update();
    return;
  }
  STATE.donut = new Chart(ctx,{
    type:'doughnut',
    data:{
      labels:['Топилган','Топилмаган'],
      datasets:[{
        data:[found,missing],
        backgroundColor:['#06A0AB','rgba(255,255,255,0.18)'],
        borderColor:['#06A0AB','rgba(255,255,255,0.25)'],
        borderWidth:2,
        hoverOffset:8,
      }],
    },
    options:{
      cutout:'72%',
      plugins:{legend:{display:false},tooltip:{
        bodyFont:{family:'Inter',size:13},
        backgroundColor:'#102836',
        padding:12,
      }},
      animation:{animateRotate:true,duration:1100},
    },
  });
}

document.addEventListener("DOMContentLoaded",init);
