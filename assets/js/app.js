// SQB Bank Presidential Dashboard
// Note: all dynamic strings pass through escapeHTML() before being inserted.

// ============================================================
// I18N — three-language UI (uz / ru / en)
// ============================================================
const I18N = {
  uz:{
    sidebar_title:"Слайдлар",
    home:"Бош саҳифа",
    advisor:"SQB AI Advisor",
    year:"2026 йил",
    region:"Бухоро вилояти",
    gij_district:"Ғиждувон тумани",
    shof_district:"Шофиркон тумани",
    gij_short:"ҒИЖДУВОН",
    shof_short:"ШОФИРКОН",
    hero_title:"Туманнинг умумий ҳолати",
    ai_title:"Сунъий интеллект таҳлили",
    ai_sub:"Кўрсаткичлар динамикаси асосида автоматик хулосалар",
    arch_title:"АРХИТЕКТУРА ВА ТУЗИЛМА",
    footer_sources:"Расмий манбалар:",
    kpi_mahalla:"Маҳаллалар сони",
    kpi_xonadon:"Хонадонлар сони",
    kpi_oila:"Оилалар сони",
    kpi_aholi:"Аҳоли сони",
    kpi_ishsizlik:"Ишсизлик",
    kpi_kambag:"Камбағаллик",
    unit_ta:"та",
    unit_ming_kishi:"минг киши",
    label_source:"Манба:",
    label_value:"Қиймат",
    label_status:"Ҳолат",
    label_no_data:"Маълумот мавжуд эмас",
    label_breakdown:"Тақсимот",
    label_trend:"Йиллик динамика",
    label_total:"Жами",
    label_year:"йил",
    label_forecast:"(прогноз)",
    label_growth:"ўсиш",
    ai_label:"СИ ТАВСИЯСИ",
    slide_word:"СЛАЙД",
    section_word:"-БЎЛИМ",
    indicators_word:"та кўрсаткич",
    slide_titles:["Иқтисодий фаоллик","Инфратузилма","Аҳоли ва бандлик","Маҳалла тадбиркорлиги ва банк","Имкониятлар","Хулоса ва режа"],
    slide_descs:["Саноат, қурилиш, ишлаб чиқариш ва иқтисодий ўсиш кўрсаткичлари","Йўл, газ, сув, электр энергия ва коммунал инфратузилма","Демография, иш билан таъминлаш, мигратсия ва камбағаллик","Маҳалла даражасидаги тадбиркорлик ва банк молиявий хизматлари","Туман иқтисодий имкониятлари ва салоҳият","Якуний хулосалар, тавсиялар ва ҳаракатлар режаси"],
    arch_data_layer:"DATA LEVEL · Маълумот қатлами",
    arch_ai_layer:"AI LEVEL · Сунъий интеллект қатлами",
    arch_platform_layer:"PLATFORMS · Платформалар",
    arch_data_section:"📊 Маълумотлар",
    arch_people_section:"👥 Аҳоли",
    arch_bank_section:"🏦 Банк",
    arch_blocks:{
      tumanlar:["Туманлар","географик"],infra:["Инфратузилма","тизимлар"],turizm:["Туризм","сайёҳлик"],iqtisod:["Иқтисодиёт","кўрсаткичлар"],
      qishloq:["Қишлоқ хўжалиги","агрозона"],aholi:["Аҳоли","демография"],bandlik:["Бандлик","меҳнат бозори"],ijtimoiy:["Ижтимоий ҳимоя","нозик гуруҳлар"],
      mahalla:["Маҳаллалар","МФЙ тармоғи"],oilalar:["Оилалар","оилавий иқтисод"],tadbirkor:["Тадбиркорлар","микробизнес"],
      kredit:["Кредит портфели","SQB"],npl:["NPL мониторинг","муаммоли актив"],bankir:["Маҳалла банкири","молиявий вакил"],
      analiz:["Таҳлил","тренд + динамика"],modellar:["Моделлар","прогноз ва скоринг"],rag:["RAG","ҳужжатлар базаси"],
      analitika:["Аналитика","дашборд"],prognoz:["Прогноз","2026-2028"],bizmes:["Бизнес ва меҳнат бозори","микрокредит + бандлик"],
    },
  },
  ru:{
    sidebar_title:"Слайды",
    home:"Главная",
    advisor:"SQB AI Advisor",
    year:"2026 год",
    region:"Бухарская область",
    gij_district:"Гиждуванский район",
    shof_district:"Шафирканский район",
    gij_short:"ГИЖДУВАН",
    shof_short:"ШАФИРКАН",
    hero_title:"Общее состояние района",
    ai_title:"Анализ искусственного интеллекта",
    ai_sub:"Автоматические выводы на основе динамики показателей",
    arch_title:"АРХИТЕКТУРА И СТРУКТУРА",
    footer_sources:"Официальные источники:",
    kpi_mahalla:"Количество махаллей",
    kpi_xonadon:"Домохозяйства",
    kpi_oila:"Семьи",
    kpi_aholi:"Население",
    kpi_ishsizlik:"Безработица",
    kpi_kambag:"Бедность",
    unit_ta:"шт",
    unit_ming_kishi:"тыс. чел",
    label_source:"Источник:",
    label_value:"Значение",
    label_status:"Статус",
    label_no_data:"Данные отсутствуют",
    label_breakdown:"Распределение",
    label_trend:"Годовая динамика",
    label_total:"Всего",
    label_year:"год",
    label_forecast:"(прогноз)",
    label_growth:"рост",
    ai_label:"AI РЕКОМЕНДАЦИЯ",
    slide_word:"СЛАЙД",
    section_word:"-РАЗДЕЛ",
    indicators_word:"показателей",
    slide_titles:["Экономическая активность","Инфраструктура","Население и занятость","Махаллинское предпринимательство и банк","Возможности","Выводы и план"],
    slide_descs:["Промышленность, строительство, производство и показатели экономического роста","Дороги, газ, вода, электроэнергия и коммунальная инфраструктура","Демография, занятость, миграция и бедность","Предпринимательство на уровне махалли и банковские услуги","Экономические возможности и потенциал района","Итоговые выводы, рекомендации и план действий"],
    arch_data_layer:"DATA LEVEL · Уровень данных",
    arch_ai_layer:"AI LEVEL · Уровень искусственного интеллекта",
    arch_platform_layer:"PLATFORMS · Платформы",
    arch_data_section:"📊 Данные",
    arch_people_section:"👥 Население",
    arch_bank_section:"🏦 Банк",
    arch_blocks:{
      tumanlar:["Районы","география"],infra:["Инфраструктура","системы"],turizm:["Туризм","туристы"],iqtisod:["Экономика","показатели"],
      qishloq:["Сельское хоз-во","агрозона"],aholi:["Население","демография"],bandlik:["Занятость","рынок труда"],ijtimoiy:["Соц. защита","уязвимые"],
      mahalla:["Махалли","сеть МФЙ"],oilalar:["Семьи","семейная экон."],tadbirkor:["Предпринимат.","микробизнес"],
      kredit:["Кредит. портфель","SQB"],npl:["NPL мониторинг","проблемные"],bankir:["Махалла банкир","фин. представит."],
      analiz:["Анализ","тренд + динамика"],modellar:["Модели","прогноз + скоринг"],rag:["RAG","база документов"],
      analitika:["Аналитика","дашборд"],prognoz:["Прогноз","2026-2028"],bizmes:["Бизнес и рынок труда","микрокредит + занятость"],
    },
  },
  en:{
    sidebar_title:"Slides",
    home:"Home",
    advisor:"SQB AI Advisor",
    year:"2026",
    region:"Bukhara Region",
    gij_district:"Gijduvon District",
    shof_district:"Shofirkon District",
    gij_short:"GIJDUVON",
    shof_short:"SHOFIRKON",
    hero_title:"District Overview",
    ai_title:"AI Analysis",
    ai_sub:"Automated insights based on indicator dynamics",
    arch_title:"ARCHITECTURE & STRUCTURE",
    footer_sources:"Official sources:",
    kpi_mahalla:"Mahallas",
    kpi_xonadon:"Households",
    kpi_oila:"Families",
    kpi_aholi:"Population",
    kpi_ishsizlik:"Unemployment",
    kpi_kambag:"Poverty",
    unit_ta:"units",
    unit_ming_kishi:"k people",
    label_source:"Source:",
    label_value:"Value",
    label_status:"Status",
    label_no_data:"No data available",
    label_breakdown:"Breakdown",
    label_trend:"Annual trend",
    label_total:"Total",
    label_year:"yr",
    label_forecast:"(forecast)",
    label_growth:"growth",
    ai_label:"AI INSIGHT",
    slide_word:"SLIDE",
    section_word:"-SECTION",
    indicators_word:"indicators",
    slide_titles:["Economic Activity","Infrastructure","Population & Employment","Mahalla Business & Banking","Opportunities","Conclusions & Plan"],
    slide_descs:["Industry, construction, production and economic growth indicators","Roads, gas, water, electricity and utility infrastructure","Demography, employment, migration and poverty","Mahalla-level entrepreneurship and bank financial services","District economic opportunities and potential","Final conclusions, recommendations and action plan"],
    arch_data_layer:"DATA LEVEL",
    arch_ai_layer:"AI LEVEL",
    arch_platform_layer:"PLATFORMS",
    arch_data_section:"📊 Data",
    arch_people_section:"👥 People",
    arch_bank_section:"🏦 Bank",
    arch_blocks:{
      tumanlar:["Districts","geographic"],infra:["Infrastructure","systems"],turizm:["Tourism","tourists"],iqtisod:["Economy","indicators"],
      qishloq:["Agriculture","agro-zone"],aholi:["Population","demography"],bandlik:["Employment","labor market"],ijtimoiy:["Social Protection","vulnerable"],
      mahalla:["Mahallas","MFY network"],oilalar:["Families","family economy"],tadbirkor:["Entrepreneurs","microbusiness"],
      kredit:["Credit portfolio","SQB"],npl:["NPL monitoring","problem assets"],bankir:["Mahalla banker","financial agent"],
      analiz:["Analysis","trend + dynamics"],modellar:["Models","forecast + scoring"],rag:["RAG","document base"],
      analitika:["Analytics","dashboard"],prognoz:["Forecast","2026-2028"],bizmes:["Business & labor market","microcredit + employment"],
    },
  },
};
function T(k){ return (I18N[STATE.lang]||I18N.uz)[k] ?? I18N.uz[k] ?? k; }
function Tind(district, ind, field){
  // Translate indicator field via STATE.i18n_ind cache; fallback to original UZ
  const orig = ind[field] || "";
  if(STATE.lang==='uz' || !STATE.i18n_ind || !STATE.i18n_ind[STATE.lang]) return orig;
  const dprefix = district==='gijduvon'?'gij':'shof';
  const key = dprefix+":"+ind.no+":"+field;
  return STATE.i18n_ind[STATE.lang][key] || orig;
}

const SLIDES = [
  {n:1, icon:"bi-graph-up-arrow"},
  {n:2, icon:"bi-buildings"},
  {n:3, icon:"bi-people-fill"},
  {n:4, icon:"bi-bank2"},
  {n:5, icon:"bi-stars"},
  {n:6, icon:"bi-flag-fill"},
];
const SLIDE_SECTIONS = ["I","II","III","IV","IV","V"];
SLIDES.forEach(function(s,idx){
  Object.defineProperty(s,'title',{get:function(){return T('slide_titles')[idx];}});
  Object.defineProperty(s,'desc',{get:function(){return T('slide_descs')[idx];}});
  s.section = SLIDE_SECTIONS[idx];
});

// ============================================================
// REGIONS & DISTRICTS CONFIG
// Add new regions/districts here — data files must exist in assets/data/
// ============================================================
const REGIONS = [
  {
    id: "bukhara",
    name: {uz:"Бухоро вилояти", ru:"Бухарская область", en:"Bukhara Region"},
    districts: [
      {id:"gijduvon",  name:{uz:"Ғиждувон",  ru:"Гиждуван",   en:"Gijduvon"},  file:"gijduvon.json",  hasData:true},
      {id:"shofirkon", name:{uz:"Шофиркон",  ru:"Шафиркан",   en:"Shofirkon"}, file:"shofirkon.json", hasData:true},
    ]
  },
  {
    id: "fergana",
    name: {uz:"Фарғона вилояти", ru:"Ферганская область", en:"Fergana Region"},
    districts: [
      {id:"qoqon",     name:{uz:"Қўқон",     ru:"Коканд",     en:"Kokand"},     file:"qoqon.json",     hasData:true, type:"shahar"},
      {id:"qoshtepa",  name:{uz:"Қўштепа",   ru:"Куштепа",    en:"Qoshtepa"},   file:"qoshtepa.json",  hasData:true},
    ]
  },
  {
    id: "surkhandarya",
    name: {uz:"Сурхондарё вилояти", ru:"Сурхандарьинская область", en:"Surkhandarya Region"},
    districts: [
      {id:"surkhandarya_vil", name:{uz:"Сурхондарё вилояти", ru:"Сурхандарьинская область", en:"Surkhandarya Region"}, file:"boysun.json", hasData:true, type:"viloyat"},
      {id:"boysun",    name:{uz:"Бойсун",    ru:"Байсун",     en:"Boysun"},    file:"boysun_tuman.json",    hasData:true},
    ]
  },
  {
    id: "karakalpakstan",
    name: {uz:"Қорақалпоғистон Республикаси", ru:"Республика Каракалпакстан", en:"Republic of Karakalpakstan"},
    districts: [
      {id:"karakalpakstan_resp", name:{uz:"Қорақалпоғистон Республикаси", ru:"Республика Каракалпакстан", en:"Republic of Karakalpakstan"}, file:"karakalpakstan.json", hasData:true, type:"respublika"},
      {id:"qongirot",   name:{uz:"Қўнғирот",   ru:"Кунград",     en:"Qongirot"},   file:"qongirot.json",   hasData:true},
      {id:"qonlikol",   name:{uz:"Қонлиқўл",   ru:"Канлыкуль",   en:"Qonlikol"},   file:"qonlikol.json",   hasData:true},
      {id:"toxiatosh",  name:{uz:"Тахиатош",   ru:"Тахиаташ",    en:"Taxiatosh"},  file:"toxiatosh.json",  hasData:true},
    ]
  },
];

function getRegion(regionId){ return REGIONS.find(function(r){return r.id===regionId;}); }
function getDistrict(regionId, districtId){
  var r = getRegion(regionId);
  return r ? r.districts.find(function(d){return d.id===districtId;}) : null;
}
function getDistrictAny(districtId){
  for(var i=0;i<REGIONS.length;i++){
    var d = REGIONS[i].districts.find(function(d){return d.id===districtId;});
    if(d) return {region:REGIONS[i], district:d};
  }
  return null;
}
function districtLabel(districtId){
  var info = getDistrictAny(districtId);
  if(!info) return districtId;
  return info.district.name[STATE.lang] || info.district.name.uz;
}
function regionLabel(regionId){
  var r = getRegion(regionId);
  if(!r) return regionId;
  return r.name[STATE.lang] || r.name.uz;
}

const STATE = {
  region:null,
  district:null,
  lang: (typeof localStorage!=="undefined" && localStorage.getItem("dash_lang")) || "uz",
  data:{},          // districtId -> JSON data (динамик юкланади)
  search:"",
  filter:"all",
  charts:{},
  pending:[],
};
// Backward compatibility — DISTRICT_LABEL[key] dynamic lookup
const DISTRICT_LABEL = {};
Object.defineProperty(DISTRICT_LABEL, 'gijduvon',  {get:function(){return districtLabel('gijduvon');}});
Object.defineProperty(DISTRICT_LABEL, 'shofirkon', {get:function(){return districtLabel('shofirkon');}});
Object.defineProperty(DISTRICT_LABEL, 'qoqon',     {get:function(){return districtLabel('qoqon');}});
Object.defineProperty(DISTRICT_LABEL, 'qoshtepa',  {get:function(){return districtLabel('qoshtepa');}});
Object.defineProperty(DISTRICT_LABEL, 'surkhandarya_vil', {get:function(){return districtLabel('surkhandarya_vil');}});
Object.defineProperty(DISTRICT_LABEL, 'boysun',    {get:function(){return districtLabel('boysun');}});

// ============================================================
// VALUE PARSER — classifies indicator.value into a typed object
// Types: timeseries | breakdown | single_metric | list | text | empty
// ============================================================
function parseValue(raw, ctx){
  ctx = ctx || {};
  if(raw==null || raw==="") return {type:"empty"};
  // === Pre-typed object (rich data) ===
  if(typeof raw === "object" && raw.type){
    return raw; // pass through — caller handles known types
  }
  const str = String(raw).trim();

  // Strip leading "[Tag]" prefix and capture as label
  let label = "";
  const tagM = str.match(/^\[([^\]]+)\]\s*/);
  const body = tagM ? str.slice(tagM[0].length) : str;
  if(tagM) label = tagM[1];

  // ---- Metric + delta detection (e.g. "43.1 млн $ | ўсиш: +108.5% (тахминий)") ----
  // Requires the literal "ўсиш:" keyword so it only fires for explicitly tagged metrics.
  if(/ўсиш\s*:/i.test(body) && !/^\s*(?:19|20)\d{2}\s*[:\-]/.test(body)){
    const md = body.match(/^\s*(-?\d[\d\s\u00A0]{0,14}(?:[\.,]\d+)?)\s*([^\|]*?)\s*\|\s*ўсиш\s*:\s*([+\-]?\d{1,4}(?:[\.,]\d+)?)\s*%\s*(?:\(([^)]*)\))?\s*$/i);
    if(md){
      const value = parseFloat(md[1].replace(/[\s\u00A0]/g,"").replace(",","."));
      const unit = (md[2]||"").trim();
      const deltaPct = parseFloat(md[3].replace(",","."));
      const note = (md[4]||"").trim();
      if(!isNaN(value) && !isNaN(deltaPct)){
        return {type:"metric_delta", label:label, value:value, unit:unit, deltaPct:deltaPct, note:note};
      }
    }
  }

  // ---- Hero + facts detection: leading "Жами: ..." segment ----
  {
    const hfSegs = body.split(/\s*\|\s*/).map(function(s){return s.trim();}).filter(Boolean);
    if(hfSegs.length>=2){
      const heroM = hfSegs[0].match(/^Жами\s*:\s*(.+)$/i);
      if(heroM){
        const facts = [];
        for(let i=1;i<hfSegs.length;i++){
          const fm = hfSegs[i].match(/^([^:]{2,60}):\s*(.+)$/);
          if(fm) facts.push({name:fm[1].trim(), value:fm[2].trim()});
        }
        if(facts.length>=1){
          return {type:"hero_facts", label:label, hero:heroM[1].trim(), facts:facts};
        }
      }
    }
  }

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

  // ---- Estimated trend detection (YYYY: N ±M) ----
  const estPairs = [];
  const seenEstY = {};
  const ep = /((?:19|20)\d{2})\s*:?\s*(-?\d{1,7}(?:[\.,]\d+)?)\s*[±\+\-]\s*(\d{1,7}(?:[\.,]\d+)?)/g;
  // Use explicit ± character only to avoid false positives
  const ep2 = /((?:19|20)\d{2})\s*:?\s*(-?\d{1,7}(?:[\.,]\d+)?)\s*±\s*(\d{1,7}(?:[\.,]\d+)?)/g;
  let mep;
  while((mep = ep2.exec(body))!==null){
    const y = parseInt(mep[1]);
    const v = parseFloat(mep[2].replace(",","."));
    const er = parseFloat(mep[3].replace(",","."));
    if(y>=2010 && y<=2035 && !isNaN(v) && !isNaN(er) && !seenEstY[y]){
      seenEstY[y]=1; estPairs.push({year:y, value:v, error:er});
    }
  }
  if(estPairs.length>=1){
    estPairs.sort(function(a,b){return a.year-b.year;});
    const vals = estPairs.map(function(p){return p.value;});
    const last = vals[vals.length-1];
    const prev = vals.length>=2 ? vals[vals.length-2] : null;
    const yoy = (prev!=null && prev!==0) ? ((last-prev)/Math.abs(prev))*100 : null;
    const yoyAbs = (prev!=null) ? (last-prev) : null;
    const unit = detectUnit(label, body);
    const insight = "🤖 Баҳоланган қиймат — расмий манба йўқлиги сабабли вилоят улуши асосида ҳисобланган, ишончлилик оралиғи ±"+estPairs[estPairs.length-1].error+" "+unit+".";
    return {
      type:"estimated_trend", label:label, series:estPairs,
      unit:unit, last:last, prev:prev, yoy:yoy, yoyAbs:yoyAbs,
      insight:insight,
    };
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
  if(/трлн\s*сў?м/i.test(hay)) return "трлн сўм";
  if(/млн\s*сў?м/i.test(hay)) return "млн сўм";
  if(/млн\s*\$|млн\s*usd/i.test(hay)) return "млн $";
  if(/минг\s*киши|минг\s*нафар|минг\s*аҳол/i.test(hay)) return "минг киши";
  if(/\bга\b/.test(hay)) return "га";
  if(/\bта\b/.test(hay)) return "та";
  if(/%|фоиз/.test(hay)) return "%";
  if(/киши|аҳол|нафар/.test(hay)) return "киши";
  return "";
}

function fmtNum(n){
  if(n==null||isNaN(n)) return "—";
  const abs = Math.abs(n);
  if(abs>=1000) return n.toLocaleString("ru-RU",{maximumFractionDigits:0});
  if(Number.isInteger(n)) return String(n);
  if(abs>=100) return n.toFixed(1).replace(/\.0$/,"");
  if(abs>=10) return n.toFixed(1).replace(/\.0$/,"");
  return n.toFixed(2).replace(/\.?0+$/,"");
}

// ============================================================
// VALUE RENDERER
// ============================================================
function renderValue(ind, canvasId){
  if(!ind.found || !ind.value){
    return '<div class="ic-value empty">'+
      '<div class="ic-value-label">'+T("label_status")+'</div>'+
      '<div class="ic-value-text">Маълумот мавжуд эмас</div></div>';
  }
  const p = parseValue(ind.value, {name:ind.name, desc:ind.desc});

  if(p.type==="timeseries"){
    STATE.pending.push({id:canvasId, kind:"line", series:p.series, noForecast:!!ind.no_forecast, showLabels:true});
    const lastYear = p.series.length ? p.series[p.series.length-1].year : '';
    const yoyPill = (p.yoy!=null) ?
      ('<span class="metric-delta '+(p.yoy>=0?'up':'down')+'">'+(p.yoy>=0?'▲ +':'▼ ')+fmtNum(p.yoyAbs)+' ('+(p.yoy>=0?'+':'')+p.yoy.toFixed(1)+'%)</span>')
      : '';
    return '<div class="ic-value rich">'+
      '<div class="ic-value-head"><div class="ic-value-label">'+T("label_trend")+'</div>'+
      (p.label?'<span class="val-tag">'+escapeHTML(p.label)+'</span>':'')+'</div>'+
      '<div class="trend-top">'+
        '<div class="trend-num">'+fmtNum(p.last)+(p.unit?' <span class="metric-unit">'+escapeHTML(p.unit)+'</span>':'')+
        (lastYear?' <span class="trend-year">('+lastYear+' '+T('label_year')+')</span>':'')+'</div>'+
        yoyPill+
      '</div>'+
      '<div class="value-chart-wrap trend"><canvas id="'+canvasId+'"></canvas></div>'+
      '</div>';
  }

  if(p.type==="estimated_trend"){
    STATE.pending.push({id:canvasId, kind:"band", series:p.series});
    const yoyPill = (p.yoy!=null) ?
      ('<span class="metric-delta '+(p.yoy>=0?'up':'down')+'">'+(p.yoy>=0?'▲ +':'▼ ')+fmtNum(p.yoyAbs)+' ('+(p.yoy>=0?'+':'')+p.yoy.toFixed(1)+'%)</span>')
      : '';
    return '<div class="ic-value rich">'+
      '<div class="ic-value-head"><div class="ic-value-label">'+T("label_trend")+'</div>'+
      (p.label?'<span class="val-tag">'+escapeHTML(p.label)+'</span>':'')+'</div>'+
      '<div class="trend-top">'+
        '<div class="trend-num">'+fmtNum(p.last)+(p.unit?' <span class="metric-unit">'+escapeHTML(p.unit)+'</span>':'')+'</div>'+
        yoyPill+
      '</div>'+
      '<div class="value-chart-wrap trend"><canvas id="'+canvasId+'"></canvas></div>'+
      '</div>';
  }

  if(p.type==="metric_delta"){
    const up = p.deltaPct>=0;
    const sign = up?"+":"";
    const arrow = up?"▲":"▼";
    return '<div class="ic-value rich"><div class="metric-square">'+
      '<div class="ms-num">'+fmtNum(p.value)+'</div>'+
      (p.unit?'<div class="ms-unit">'+escapeHTML(p.unit)+'</div>':'')+
      '<div class="ms-delta '+(up?'up':'down')+'">'+arrow+' '+sign+p.deltaPct.toFixed(1)+'%</div>'+
      '<div class="ms-note">'+escapeHTML(p.note||'2024 йилга нисбатан')+'</div>'+
      '</div></div>';
  }

  // === Google Trends — 24 ой қидирув индекси ===
  if(p.type==="timeseries_monthly"){
    STATE.pending.push({id:canvasId, kind:"area", labels:p.labels, values:p.values});
    return '<div class="ic-value rich">'+
      '<div class="ic-value-head"><div class="ic-value-label">'+escapeHTML(p.title||T('label_trend'))+'</div>'+
      '<span class="val-tag">'+(p.subtitle?escapeHTML(p.subtitle):'')+'</span></div>'+
      '<div class="trend-top">'+
        '<div class="trend-num">'+p.avg+' <span class="metric-unit">/100 ўртача</span></div>'+
        '<span class="metric-delta up">▲ макс '+p.max+'</span>'+
        '<span class="metric-delta down" style="margin-left:6px">▼ мин '+p.min+'</span>'+
      '</div>'+
      '<div class="value-chart-wrap trend" style="height:140px"><canvas id="'+canvasId+'"></canvas></div>'+
      '</div>';
  }

  // === Yearly credits — bar chart + total (sayt mavzusi) ===
  if(p.type==="yearly_credits"){
    const max = Math.max.apply(null, p.values);
    const last = p.values[p.values.length-1];
    const prev = p.values[p.values.length-2];
    const yoyAbs = last - prev;
    const yoyPct = prev>0 ? ((last-prev)/prev*100) : 0;
    const fmt = function(n){ return n.toLocaleString('ru-RU').replace(/,/g,' '); };
    const bars = p.years.map(function(y, i){
      const v = p.values[i];
      const h = max>0 ? Math.round((v/max)*100) : 0;
      const isLast = i === p.years.length-1;
      return '<div class="yc-bar-item">'+
        '<div class="yc-bar-val">'+fmt(v)+'</div>'+
        '<div class="yc-bar-col"><div class="yc-bar-fill'+(isLast?' active':'')+'" style="height:'+h+'%"></div></div>'+
        '<div class="yc-bar-year">'+y+'</div>'+
      '</div>';
    }).join('');
    return '<div class="ic-value rich yc-card">'+
      '<div class="yc-head">'+
        '<div class="yc-h-left">'+
          '<div class="yc-h-lab">ЖАМИ 2021–2025</div>'+
          '<div class="yc-h-val">'+fmt(p.total)+' <span class="yc-h-unit">'+escapeHTML(p.unit||'')+'</span></div>'+
        '</div>'+
        '<div class="yc-h-right">'+
          '<div class="yc-h-lab">2024 → 2025</div>'+
          '<div class="yc-h-pct">↑ +'+fmt(yoyAbs)+' ('+(yoyPct>=0?'+':'')+yoyPct.toFixed(1).replace('.',',')+'%)</div>'+
        '</div>'+
      '</div>'+
      '<div class="yc-chart">'+bars+'</div>'+
      '</div>';
  }

  // === Sector table — Stripe Dashboard (Variant C) ===
  if(p.type==="sector_table"){
    const max = Math.max.apply(null, p.sectors.map(function(s){return s.value;}));
    const totalSum = p.sectors.reduce(function(a,s){return a+s.value;},0);
    const avgGrowth = (p.sectors.reduce(function(a,s){return a+(s.growth-100);},0) / p.sectors.length);
    const fmtTrln = function(n){
      if(n>=1000) return (n/1000).toFixed(2).replace('.',',');
      return n.toFixed(1).replace('.',',');
    };
    const fmtMlrd = function(n){
      return n.toLocaleString('ru-RU', {minimumFractionDigits:1, maximumFractionDigits:1}).replace('.',',');
    };
    const items = p.sectors.map(function(s){
      const barW = max>0 ? Math.round((s.value/max)*100) : 0;
      const isPositive = s.growth >= 100;
      const deltaFromBase = (s.growth - 100).toFixed(1).replace('.',',');
      return '<div class="sc-item">'+
        '<div class="sc-bar-wrap" style="--c:'+s.color+'">'+
          '<div class="sc-bar-fill" style="width:'+barW+'%"></div>'+
          '<span class="sc-bar-text">'+escapeHTML(s.name)+'</span>'+
        '</div>'+
        '<div class="sc-vals">'+
          '<span class="sc-num">'+fmtMlrd(s.value)+'</span>'+
          '<span class="sc-pct '+(isPositive?'up':'down')+'">+'+deltaFromBase+'%</span>'+
        '</div>'+
      '</div>';
    }).join('');
    return '<div class="ic-value rich sc-card">'+
      '<div class="sc-head">'+
        '<div class="sc-h-left">'+
          '<div class="sc-h-lab">МАКРОИҚТИСОДИЙ ҲАЖМ</div>'+
          '<div class="sc-h-val">'+fmtTrln(totalSum)+' <span class="sc-h-unit">трлн сўм</span></div>'+
        '</div>'+
        '<div class="sc-h-right">'+
          '<div class="sc-h-lab">2024 → 2025</div>'+
          '<div class="sc-h-pct">↑ +'+avgGrowth.toFixed(1).replace('.',',')+'% ўртача</div>'+
        '</div>'+
      '</div>'+
      '<div class="sc-list">'+items+'</div>'+
      '</div>';
  }

  // === Category breakdown — clean table with color dots ===
  if(p.type==="category_breakdown"){
    const total = p.categories.reduce(function(s,c){return s+(c.count||0);},0);
    const maxCat = Math.max.apply(null, p.categories.map(function(c){return c.count;}));
    STATE.pending.push({id:canvasId, kind:"category_donut", categories:p.categories, total:total});
    var rows = p.categories.map(function(c){
      var pct = total>0 ? Math.round((c.count/total)*100) : 0;
      var barW = maxCat>0 ? Math.round((c.count/maxCat)*100) : 0;
      return '<tr class="cb-row">'+
        '<td class="cb-dot-cell"><span class="cb-dot" style="background:'+c.color+'"></span></td>'+
        '<td class="cb-name-cell">'+escapeHTML(c.name)+'</td>'+
        '<td class="cb-bar-cell"><div class="cb-bar-bg"><div class="cb-bar-fill" style="width:'+barW+'%;background:'+c.color+'"></div></div></td>'+
        '<td class="cb-count-cell">'+c.count+' та</td>'+
        '<td class="cb-pct-cell">'+pct+'%</td>'+
      '</tr>';
    }).join('');
    return '<div class="ic-value rich">'+
      '<div class="cb-layout">'+
        '<div class="cb-chart-side"><canvas id="'+canvasId+'" style="max-height:160px"></canvas></div>'+
        '<div class="cb-table-side">'+
          '<table class="cb-table"><tbody>'+rows+'</tbody></table>'+
          '<div class="cb-total">Жами: <b>'+total+'</b> та маҳалла</div>'+
        '</div>'+
      '</div>'+
      '</div>';
  }

  // === ML прогноз — 5 секторли мульти-чизиқли (факт+прогноз) ===
  if(p.type==="multi_series_forecast"){
    STATE.pending.push({id:canvasId, kind:"forecast", years:p.years, sectors:p.sectors, factUntil:p.fact_until});
    const top3 = p.sectors.slice(0, 3).map(function(s){
      return '<div class="ml-sector"><span class="ml-name">'+escapeHTML(s.name)+'</span>'+
        '<span class="ml-grow">'+escapeHTML(s.growth||'')+'</span></div>';
    }).join('');
    return '<div class="ic-value rich">'+
      '<div class="ic-value-head"><div class="ic-value-label">'+escapeHTML(p.title||T('label_trend'))+'</div>'+
      '<span class="val-tag">'+(p.subtitle?escapeHTML(p.subtitle):'')+'</span></div>'+
      '<div class="value-chart-wrap" style="height:240px"><canvas id="'+canvasId+'"></canvas></div>'+
      '<div class="ml-sectors">'+top3+'</div>'+
      '</div>';
  }

  if(p.type==="single_metric"){
    return '<div class="ic-value rich">'+
      '<div class="ic-value-head"><div class="ic-value-label">'+T("label_value")+'</div>'+
      (p.label?'<span class="val-tag">'+escapeHTML(p.label)+'</span>':'')+'</div>'+
      '<div class="metric-value">'+fmtNum(p.value)+'</div>'+
      (p.unit?'<div class="metric-unit">'+escapeHTML(p.unit)+'</div>':'')+
      (p.delta!=null?'<div class="metric-delta-wrap">'+deltaHTML(p.delta)+
        '<span class="metric-prev">'+fmtNum(p.prev)+' → '+fmtNum(p.value)+'</span></div>':'')+
      '</div>';
  }

  if(p.type==="hero_facts"){
    // Split hero into leading numeric and trailing label
    const hm = p.hero.match(/^([\d\s.,]+)\s*(.*)$/);
    const hasNum = hm && /\d/.test(hm[1]);
    const heroNum = hasNum ? hm[1].trim() : '';
    const heroTail = hasNum ? (hm[2]||'').trim() : '';
    const heroLabel = hasNum ? (heroTail || 'Жами') : p.hero;
    const factsHtml = p.facts.map(function(f){
      const isMoney = /(млн\s*сўм|млрд\s*сўм|трлн\s*сўм)/i.test(f.value);
      return '<div class="hf-row"><span class="hf-name">'+escapeHTML(f.name)+'</span>'+
        '<span class="hf-val'+(isMoney?' green':'')+'">'+escapeHTML(f.value)+'</span></div>';
    }).join("");
    return '<div class="ic-value rich"><div class="hero-facts">'+
      '<div class="hf-top">'+
        '<div><div class="hf-num">'+escapeHTML(heroNum)+'</div>'+
        '<div class="hf-lab">'+escapeHTML(heroLabel)+'</div></div>'+
        '<div class="hf-ic"><i class="bi '+(/устувор|соҳа|йўналиш/i.test(p.hero+heroLabel)?'bi-stars':'bi-buildings-fill')+'"></i></div>'+
      '</div>'+
      factsHtml+
      '</div></div>';
  }

  if(p.type==="breakdown"){
    STATE.pending.push({id:canvasId, kind:"bars", data:p.items.map(function(_,i){return p.items.length-i;})});
    return '<div class="ic-value rich">'+
      '<div class="ic-value-head"><div class="ic-value-label">'+T("label_breakdown")+'</div>'+
      (p.label?'<span class="val-tag">'+escapeHTML(p.label)+'</span>':'')+'</div>'+
      '<ul class="value-pills">'+
      p.items.map(function(t){return '<li>'+escapeHTML(t)+'</li>';}).join("")+
      '</ul></div>';
  }

  if(p.type==="list"){
    return '<div class="ic-value rich">'+
      '<div class="ic-value-head"><div class="ic-value-label">'+T("label_breakdown")+'</div></div>'+
      '<ul class="value-list">'+
      p.items.map(function(t){return '<li>'+escapeHTML(t)+'</li>';}).join("")+
      '</ul></div>';
  }

  // text fallback
  return '<div class="ic-value rich">'+
    '<div class="ic-value-head"><div class="ic-value-label">'+T("label_value")+'</div>'+
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
    if(job.kind==="category_donut"){
      STATE.charts[job.id] = new Chart(ctx, {
        type:"doughnut",
        data:{
          labels: job.categories.map(function(c){return c.name;}),
          datasets:[{
            data: job.categories.map(function(c){return c.count;}),
            backgroundColor: job.categories.map(function(c){return c.color;}),
            borderColor: "rgba(11,22,40,0.8)",
            borderWidth: 3,
            hoverOffset: 18,
            hoverBorderWidth: 0,
          }]
        },
        options:{
          responsive:true, maintainAspectRatio:false,
          cutout:"68%",
          plugins:{
            legend:{display:false},
            tooltip:{
              backgroundColor:"rgba(11,22,40,0.95)",
              borderColor:"rgba(255,255,255,0.1)",
              borderWidth:1,
              padding:12,
              titleFont:{family:"Inter",size:13,weight:"700"},
              bodyFont:{family:"Inter",size:12},
              callbacks:{
                label:function(c){
                  const t = job.total||1;
                  return c.parsed+" МФЙ ("+Math.round(c.parsed/t*100)+"%)";
                }
              }
            }
          },
          animation:{animateRotate:true, duration:1100, easing:"easeOutQuart"}
        }
      });
      return;
    }
    if(job.kind==="line"){
      const grad = ctx.createLinearGradient(0,0,0,140);
      grad.addColorStop(0,"rgba(0,126,136,.35)");
      grad.addColorStop(1,"rgba(0,126,136,0)");
      const series = job.series || [];
      const labels = series.map(function(p){return String(p.year);});
      const data = series.map(function(p){return p.value;});
      const n = data.length;
      // Linear regression forecast (next 3 years) when ≥3 points
      let forecastYears = [], forecastVals = [];
      if(n>=3 && !job.noForecast){
        const xs = series.map(function(p){return p.year;});
        const xMean = xs.reduce(function(a,b){return a+b;},0)/n;
        const yMean = data.reduce(function(a,b){return a+b;},0)/n;
        let num=0, den=0;
        for(let i=0;i<n;i++){num+=(xs[i]-xMean)*(data[i]-yMean); den+=Math.pow(xs[i]-xMean,2);}
        const slope = den===0?0:num/den;
        const intercept = yMean - slope*xMean;
        const lastY = xs[n-1];
        for(let k=1;k<=3;k++){
          const fy = lastY+k;
          forecastYears.push(fy);
          var fv=Math.max(0.1, slope*fy+intercept); if(Math.max.apply(null,data)<=100) fv=Math.min(99.5,fv); forecastVals.push(fv);
        }
      }
      const allLabels = labels.concat(forecastYears.map(String));
      // Actual dataset: real values, then nulls
      const actualData = data.concat(forecastYears.map(function(){return null;}));
      // Forecast dataset: nulls for actual (except last to bridge), then forecast values
      const forecastData = data.map(function(_,i){return i===n-1?data[n-1]:null;}).concat(forecastVals);
      const lastIdx = n-1;
      const radii = actualData.map(function(_,i){return i===lastIdx?5:0;});
      const pointBg = actualData.map(function(_,i){return i===lastIdx?"#C25E3C":"#003D64";});
      const pointBd = actualData.map(function(_,i){return i===lastIdx?"#fff":"#003D64";});
      const fcRadii = forecastData.map(function(_,i){return i>=n?4:0;});
      const fcBg = forecastData.map(function(){return "#C25E3C";});
      const datasets = [{
        data:actualData,
        borderColor:"#003D64",
        backgroundColor:grad,
        borderWidth:2.6,
        tension:.4,
        fill:true,
        pointRadius:radii,
        pointHoverRadius:6,
        pointBackgroundColor:pointBg,
        pointBorderColor:pointBd,
        pointBorderWidth:2,
      }];
      if(forecastVals.length){
        datasets.push({
          data:forecastData,
          borderColor:"#C25E3C",
          backgroundColor:"rgba(194,94,60,0)",
          borderWidth:2.4,
          borderDash:[6,5],
          tension:.4,
          fill:false,
          pointRadius:fcRadii,
          pointHoverRadius:6,
          pointBackgroundColor:fcBg,
          pointBorderColor:"#fff",
          pointBorderWidth:2,
        });
      }
      const dataLabelsPlugin = {
        id:'dataLabels_'+job.id,
        afterDatasetsDraw(chart){
          const {ctx} = chart;
          ctx.save();
          ctx.font = "700 10px Inter,system-ui,sans-serif";
          ctx.textAlign = "center";
          chart.data.datasets.forEach(function(ds,di){
            const meta = chart.getDatasetMeta(di);
            meta.data.forEach(function(pt,i){
              const v = ds.data[i];
              if(v==null) return;
              const isFc = di===1;
              ctx.fillStyle = isFc ? "#C25E3C" : "#1B3A4B";
              const label = fmtNum(v);
              ctx.fillText(label, pt.x, pt.y - 8);
            });
          });
          ctx.restore();
        }
      };
      STATE.charts[job.id] = new Chart(ctx,{
        type:"line",
        data:{labels:allLabels, datasets:datasets},
        plugins:job.showLabels?[dataLabelsPlugin]:[],
        options:{
          responsive:true,maintainAspectRatio:false,
          layout:{padding:{top:22,right:26,left:26,bottom:0}},
          plugins:{legend:{display:false},tooltip:{
            backgroundColor:"#102836",padding:10,
            titleFont:{family:"Inter",size:11,weight:"700"},
            bodyFont:{family:"Inter",size:13,weight:"700"},
            displayColors:false,
            callbacks:{
              title:function(items){return items[0].label+" йил";},
              label:function(c){
                const isFc = c.datasetIndex===1;
                return "  "+fmtNum(c.parsed.y)+(isFc?" (прогноз)":"");
              },
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
    if(job.kind==="band"){
      const series = job.series || [];
      const labels = series.map(function(p){return p.year;});
      const main = series.map(function(p){return p.value;});
      const upper = series.map(function(p){return p.value+p.error;});
      const lower = series.map(function(p){return p.value-p.error;});
      const errors = series.map(function(p){return p.error;});
      const lastIdx = main.length-1;
      const radii = main.map(function(_,i){return i===lastIdx?5:0;});
      const pointBg = main.map(function(_,i){return i===lastIdx?"#C25E3C":"#003D64";});
      const pointBd = main.map(function(_,i){return i===lastIdx?"#fff":"#003D64";});
      STATE.charts[job.id] = new Chart(ctx,{
        type:"line",
        data:{
          labels:labels,
          datasets:[
            {label:"upper", data:upper, borderColor:"rgba(0,0,0,0)",
             backgroundColor:"rgba(0,126,136,.15)", fill:"+1",
             pointRadius:0, pointHoverRadius:0, tension:.4, borderWidth:0},
            {label:"lower", data:lower, borderColor:"rgba(0,0,0,0)",
             backgroundColor:"rgba(0,0,0,0)", fill:false,
             pointRadius:0, pointHoverRadius:0, tension:.4, borderWidth:0},
            {label:"main", data:main, borderColor:"#003D64",
             backgroundColor:"rgba(0,0,0,0)", borderWidth:2.5, tension:.4, fill:false,
             pointRadius:radii, pointHoverRadius:6,
             pointBackgroundColor:pointBg, pointBorderColor:pointBd, pointBorderWidth:2},
          ],
        },
        options:{
          responsive:true,maintainAspectRatio:false,
          layout:{padding:{top:6,right:6,left:6,bottom:0}},
          plugins:{legend:{display:false},tooltip:{
            backgroundColor:"#102836",padding:10,
            titleFont:{family:"Inter",size:11,weight:"700"},
            bodyFont:{family:"Inter",size:13,weight:"700"},
            displayColors:false,
            filter:function(item){return item.datasetIndex===2;},
            callbacks:{
              title:function(items){return items[0].label+" йил";},
              label:function(c){return "  "+fmtNum(c.parsed.y)+" ±"+errors[c.dataIndex];},
            },
          }},
          scales:{
            x:{display:true,grid:{display:false},border:{display:false},
               ticks:{font:{family:"Inter",size:10,weight:"600"},color:"#7a8a93",padding:4}},
            y:{display:false,grid:{display:false},border:{display:false}},
          },
          animation:{duration:700},
        },
      });
    }
    if(job.kind==="forecast"){
      var colors = ["#06A0AB","#C25E3C","#7C3AED","#D97706","#059669"];
      var datasets = job.sectors.map(function(sec, si){
        return {
          label: sec.name,
          data: sec.data,
          borderColor: colors[si % colors.length],
          backgroundColor: "transparent",
          borderWidth: 2.5,
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: colors[si % colors.length],
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        };
      });
      // Data labels plugin — show value ONLY at last point
      var fcLabelsPlugin = {
        id:'fcLabels_'+job.id,
        afterDatasetsDraw:function(chart){
          var ctx2 = chart.ctx;
          ctx2.save();
          chart.data.datasets.forEach(function(ds,di){
            var meta = chart.getDatasetMeta(di);
            var lastIdx = ds.data.length - 1;
            var pt = meta.data[lastIdx];
            var v = ds.data[lastIdx];
            if(v==null || !pt) return;
            ctx2.font = "700 11px Inter,system-ui,sans-serif";
            ctx2.fillStyle = ds.borderColor;
            ctx2.textAlign = "left";
            ctx2.fillText(fmtNum(v), pt.x + 8, pt.y + 4);
          });
          ctx2.restore();
        }
      };
      STATE.charts[job.id] = new Chart(ctx, {
        type: "line",
        data: {
          labels: job.years.map(String),
          datasets: datasets
        },
        plugins: [fcLabelsPlugin],
        options: {
          responsive:true, maintainAspectRatio:false,
          layout:{padding:{top:24,right:36,left:10,bottom:0}},
          plugins:{
            legend:{
              display:true, position:"bottom",
              labels:{
                color:"#cfe6e9", font:{family:"Inter",size:11,weight:"700"},
                boxWidth:20, boxHeight:3, padding:16, usePointStyle:false,
              }
            },
            tooltip:{
              backgroundColor:"#102836",padding:10,
              titleFont:{family:"Inter",size:11,weight:"700"},
              bodyFont:{family:"Inter",size:12,weight:"600"},
              callbacks:{
                title:function(items){return items[0].label+" йил";},
                label:function(c){return "  "+c.dataset.label+": "+fmtNum(c.parsed.y);}
              }
            }
          },
          scales:{
            x:{display:true,grid:{display:false},border:{display:false},
               ticks:{font:{family:"Inter",size:10,weight:"600"},color:"#7a8a93",padding:4}},
            y:{display:true,grid:{color:"rgba(255,255,255,0.06)"},border:{display:false},
               ticks:{font:{family:"Inter",size:9,weight:"500"},color:"#7a8a93",padding:4,
                      callback:function(v){return fmtNum(v);}}},
          },
          animation:{duration:700},
        }
      });
    }
  });
  STATE.pending = [];
}


async function loadDistrictData(districtId){
  if(STATE.data[districtId]) return STATE.data[districtId];
  var info = getDistrictAny(districtId);
  if(!info || !info.district.hasData) return null;
  try{
    var res = await fetch("assets/data/"+info.district.file);
    if(!res.ok) return null;
    var data = await res.json();
    STATE.data[districtId] = data;
    return data;
  }catch(e){
    console.warn("Failed to load data for "+districtId, e);
    return null;
  }
}

var HERO_BG_MAP = {
  qoqon: "freepik__remove-all-trees-bushes-and-plants-from-the-foregr__54828 1.jpg",
  shofirkon: "shofirkon.jpg",
  gijduvon: "gijduvon.jpg",
  qoshtepa: "qoshtepa.jpg"
};
function updateHeroBg(districtId){
  var el = document.querySelector(".hero-bg");
  if(!el) return;
  var img = HERO_BG_MAP[districtId];
  if(img){
    el.style.backgroundImage = "linear-gradient(rgba(15,31,68,0.55),rgba(15,31,68,0.55)), url('"+img+"')";
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
  } else {
    el.style.backgroundImage = "";
    el.style.backgroundSize = "";
    el.style.backgroundPosition = "";
  }
}

async function switchDistrict(regionId, districtId){
  STATE.region = regionId;
  STATE.district = districtId;
  // Load data if not cached
  await loadDistrictData(districtId);
  updateSelectorUI();
  updateHeroBg(districtId);
  buildSlidePages();
  render();
  handleHash();
}

async function init(){
  // Load all districts that have data
  var loadPromises = [];
  REGIONS.forEach(function(r){
    r.districts.forEach(function(d){
      if(d.hasData){
        loadPromises.push(
          fetch("assets/data/"+d.file)
            .then(function(res){return res.json();})
            .then(function(data){STATE.data[d.id]=data;})
            .catch(function(e){console.warn("Skip "+d.id, e);})
        );
      }
    });
  });
  await Promise.all(loadPromises);

  // Optional indicator translations
  STATE.i18n_ind = {ru:{},en:{}};
  try{
    const tr = await fetch("assets/data/i18n_indicators.json").then(r=>r.ok?r.json():null);
    if(tr) STATE.i18n_ind = tr;
  }catch(e){}

  buildRegionSelector();
  buildLandingPage();
  buildSlidePages();
  bindEvents();
  applyLang(STATE.lang);
  if(STATE.district) updateHeroBg(STATE.district);
  if(STATE.district) render();
  handleHash();
}

function buildLandingPage(){
  var statsEl=document.getElementById("landingStats");
  if(statsEl){
    var totalInd=0;
    REGIONS.forEach(function(r){r.districts.forEach(function(d){if(d.hasData && STATE.data[d.id]) totalInd+=STATE.data[d.id].total;});});
    statsEl.textContent="";
    [{icon:"bi-bar-chart-line",v:totalInd+"+",l:"кўрсаткич"},{icon:"bi-robot",v:"",l:"СИ таҳлил ва тавсиялар"},{icon:"bi-graph-up-arrow",v:"",l:"хулоса ва режа"},{icon:"bi-shield-check",v:"",l:"расмий манбалар"}].forEach(function(s){
      var d=document.createElement("div");d.className="landing-stat";
      var ic=document.createElement("i");ic.className="bi "+s.icon;d.appendChild(ic);
      if(s.v!==""){var st=document.createElement("strong");st.textContent=s.v;d.appendChild(st);}
      d.appendChild(document.createTextNode(" "+s.l));statsEl.appendChild(d);
    });
  }
  var regEl=document.getElementById("landingRegions");
  if(!regEl)return;
  regEl.textContent="";
  REGIONS.forEach(function(r){
    var section=document.createElement("div");section.className="landing-region-section";
    var heading=document.createElement("div");heading.className="landing-region-heading";
    var name=document.createElement("span");name.className="landing-region-name";name.textContent=r.name[STATE.lang]||r.name.uz;heading.appendChild(name);
    var line=document.createElement("span");line.className="landing-region-line";heading.appendChild(line);
    section.appendChild(heading);
    var pills=document.createElement("div");pills.className="landing-pills";
    r.districts.forEach(function(d){
      if(d.hasData){
        var pill=document.createElement("a");pill.className="landing-pill";pill.href="#";
        var ic=document.createElement("i");ic.className="bi bi-geo-alt-fill";pill.appendChild(ic);
        pill.appendChild(document.createTextNode(d.name[STATE.lang]||d.name.uz));
        (function(rid,did){pill.addEventListener("click",function(e){e.preventDefault();switchDistrict(rid,did);navigate("home");});})(r.id,d.id);
        pills.appendChild(pill);
      }
    });
    section.appendChild(pills);
    regEl.appendChild(section);
  });
}

function applyLang(lang){
  if(I18N[lang]) STATE.lang = lang;
  try{ localStorage.setItem("dash_lang", STATE.lang); }catch(e){}
  document.documentElement.lang = STATE.lang==='uz'?'uz-Cyrl':STATE.lang;
  // 1) Generic data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(function(el){
    el.textContent = T(el.getAttribute('data-i18n'));
  });
  // 2) Sidebar slide titles
  document.querySelectorAll('[data-slide-title]').forEach(function(el){
    const n = parseInt(el.getAttribute('data-slide-title'),10);
    el.textContent = n+'. '+T('slide_titles')[n-1];
  });
  // 3) Architecture blocks
  document.querySelectorAll('[data-arch]').forEach(function(el){
    const k = el.getAttribute('data-arch');
    const blk = T('arch_blocks')[k];
    if(blk){
      const t=el.querySelector('.ab-title'), s=el.querySelector('.ab-sub');
      if(t) t.textContent=blk[0]; if(s) s.textContent=blk[1];
    }
  });
  // 4) Lang switcher state
  document.querySelectorAll('.lang-btn').forEach(function(b){
    b.classList.toggle('active', b.dataset.lang===STATE.lang);
  });
  // 5) Re-render dynamic UI (slide headers, cards, AI panel)
  if(STATE.data[STATE.district]){
    updateSelectorUI();
    buildSlidePages();
    render();
    handleHash();
  }
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
      '<div class="sh-eye">'+T('slide_word')+' '+s.n+' • '+s.section+T('section_word')+'</div>'+
      '<h1 class="sh-title"><i class="bi '+s.icon+'"></i> '+escapeHTML(s.title)+'</h1>'+
      '<div class="sh-meta">'+escapeHTML(s.desc)+' • <strong id="sh-district-'+s.n+'">'+escapeHTML(districtLabel(STATE.district))+'</strong></div>'+
      '</div></div>'+
      '<div class="cards-grid" id="cards-'+s.n+'"></div>'+
      '</section>';
  }).join("");
  wrap.innerHTML = html;
}

function bindEvents(){
  // Region selector toggle
  var rsCurrent = document.getElementById("rsCurrent");
  var rsDropdown = document.getElementById("rsDropdown");
  if(rsCurrent && rsDropdown){
    rsCurrent.addEventListener("click",function(e){
      e.stopPropagation();
      var open = rsDropdown.classList.toggle("open");
      rsCurrent.setAttribute("aria-expanded", String(open));
      if(open) showRegionsList();
    });
    // Close on outside click
    document.addEventListener("click",function(e){
      if(!e.target.closest(".region-selector")){
        rsDropdown.classList.remove("open");
        rsCurrent.setAttribute("aria-expanded","false");
      }
    });
    // Keyboard
    rsCurrent.addEventListener("keydown",function(e){
      if(e.key==="Enter"||e.key===" "){e.preventDefault();rsCurrent.click();}
      if(e.key==="Escape"){rsDropdown.classList.remove("open");rsCurrent.setAttribute("aria-expanded","false");}
    });
  }

  document.querySelectorAll(".lang-btn").forEach(function(btn){
    btn.addEventListener("click",function(){
      applyLang(btn.dataset.lang);
    });
  });

  const si=document.getElementById("searchInput");
  if(si) si.addEventListener("input",function(e){
    STATE.search = e.target.value.toLowerCase().trim();
    renderAllCards();
  });

  document.querySelectorAll(".side-item").forEach(function(a){
    if(a.classList.contains("side-advisor")) return;
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

  // Hamburger sidebar toggle for mobile
  var ham = document.getElementById("sidebarToggle");
  var overlay = document.getElementById("sidebarOverlay");
  var sidebar = document.querySelector(".sidebar");
  function closeSidebar(){ if(sidebar) sidebar.classList.remove("open"); if(overlay) overlay.classList.remove("active"); }
  if(ham) ham.addEventListener("click",function(){
    sidebar.classList.toggle("open");
    overlay.classList.toggle("active");
  });
  if(overlay) overlay.addEventListener("click", closeSidebar);
  // Close sidebar when a nav item is clicked on mobile
  document.querySelectorAll(".side-item").forEach(function(a){
    a.addEventListener("click", closeSidebar);
  });
}

function navigate(id){ location.hash = "#"+id; }

function handleHash(){
  var id = (location.hash||"#landing").slice(1);
  // Guard: if no district selected, always show landing
  if(!STATE.district && id!=="landing"){
    id = "landing";
    location.hash = "#landing";
  }
  // Toggle landing mode on body
  document.body.classList.toggle("on-landing", id==="landing");
  document.querySelectorAll(".page").forEach(function(p){
    p.classList.toggle("active",p.id===id);
  });
  document.querySelectorAll(".side-item").forEach(function(a){
    a.classList.toggle("active",a.getAttribute("href")==="#"+id);
  });
  // Hide landing bg when not on landing
  var lbg = document.querySelector(".landing-bg");
  if(lbg) lbg.style.display = (id==="landing") ? "" : "none";
  window.scrollTo({top:0,behavior:"smooth"});
}

function render(){
  const data = STATE.data[STATE.district];
  const label = districtLabel(STATE.district);

  document.getElementById("heroDistrict").textContent = label;

  // Update region name dynamically
  var regionEls = document.querySelectorAll('[data-i18n="region"]');
  regionEls.forEach(function(el){ el.textContent = regionLabel(STATE.region); });

  // Update hero title — шаҳар/туман
  var info = getDistrictAny(STATE.district);
  var isShahar = info && info.district.type === "shahar";
  var heroTitleEl = document.querySelector('[data-i18n="hero_title"]');
  if(heroTitleEl){
    var dName = info ? (info.district.name[STATE.lang] || info.district.name.uz) : '';
    var titles = {uz: isShahar ? dName+" шаҳрининг умумий ҳолати" : dName+" туманининг умумий ҳолати",
                  ru: isShahar ? "Общее состояние г. "+dName : "Общее состояние "+dName+" района",
                  en: isShahar ? dName+" City Overview" : dName+" District Overview"};
    heroTitleEl.textContent = titles[STATE.lang] || titles.uz;
  }

  renderRegionKpis(data);
  renderAiPanel(data);
  renderOverview(data);

  SLIDES.forEach(function(s){
    const el = document.getElementById("sh-district-"+s.n);
    if(el) el.textContent = label;
  });

  renderAllCards();
}

function renderOverview(data){
  const wrap = document.getElementById("slidesOverview");
  if(!wrap) return;
  const html = SLIDES.map(function(s){
    const inds = data.indicators.filter(function(i){return i.slide===s.n;});
    return '<div class="col-xl-4 col-lg-6"><div class="ov-card" data-slide="'+s.n+'">'+
      '<div class="ov-num">'+String(s.n).padStart(2,"0")+'</div>'+
      '<div class="ov-ic"><i class="bi '+s.icon+'"></i></div>'+
      '<div class="ov-title">Слайд '+s.n+'. '+escapeHTML(s.title)+'</div>'+
      '<div class="ov-meta">'+s.section+'-бўлим • '+inds.length+' та кўрсаткич</div>'+
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
  let inds = data.indicators.filter(function(i){return i.slide===n && !i.hidden;});

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
  const tName = Tind(STATE.district, i, 'name');
  const tDesc = Tind(STATE.district, i, 'desc');
  const tAi = i.ai_insight ? Tind(STATE.district, i, 'ai_insight') : '';
  const i_view = Object.assign({}, i, {value: Tind(STATE.district, i, 'value')});
  return '<div class="ind-card '+(found?'':'missing')+'" style="animation-delay:'+Math.min(idx*30,400)+'ms">'+
    '<div class="ic-head"><div class="ic-no">#'+i.no+'</div>'+
    '<div class="ic-badges">'+
    '<span class="b src src-'+srcSlug(i.source_org||'SQB')+'">'+T('label_source')+' '+escapeHTML(i.source_org||'SQB')+'</span>'+
    '</div></div>'+
    '<h3 class="ic-title">'+escapeHTML(tName)+'</h3>'+
    '<p class="ic-desc">'+escapeHTML(tDesc||'')+'</p>'+
    renderValue(i_view,cid)+
    (tAi ? '<div class="ai-insight"><div class="ai-insight-head"><i class="bi bi-robot"></i><span>'+T('ai_label')+'</span></div><p class="ai-insight-text">'+escapeHTML(tAi)+'</p></div>' : '')+
    '</div>';
}

function srcSlug(s){
  const map = {'stat.uz':'stat','Марказий банк':'cb','Солиқ қўмитаси':'tax','Кадастр':'cad','Хокимият':'hok','Минэнерго':'en','Узавтойул':'road','Mehnat.uz':'lab','Иқтисодиёт вазирлиги':'stat','SQB':'sqb'};
  return map[s]||'sqb';
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
function findIndicatorByName(data, namePattern){
  return (data.indicators||[]).find(function(i){
    return i.name && i.name.toLowerCase().indexOf(namePattern.toLowerCase())>=0;
  });
}

function kpiFromIndicator(data, no, opts){
  // FIRST: check hero_kpis at root level
  if(opts && opts.namePattern && data.hero_kpis && data.hero_kpis[opts.namePattern]){
    var hk = data.hero_kpis[opts.namePattern];
    return {value:hk.value, unit:hk.unit||'', delta:null, deltaDir:null};
  }
  // Then check kpi_data map on any indicator (for combined cards)
  if(opts && opts.namePattern){
    for(var j=0;j<(data.indicators||[]).length;j++){
      var candidate = data.indicators[j];
      if(candidate.kpi_data && candidate.kpi_data[opts.namePattern]){
        var kd = candidate.kpi_data[opts.namePattern];
        return {value:kd.value, unit:kd.unit||'', delta:null, deltaDir:null};
      }
    }
  }
  // Then try by namePattern — prefer cards with kpi_count/kpi_pct
  var ind = null;
  if(opts && opts.namePattern){
    var pat = opts.namePattern.toLowerCase();
    var candidates = (data.indicators||[]).filter(function(i){
      return i.name && i.name.toLowerCase().indexOf(pat)>=0;
    });
    // Prefer card with kpi_count (explicit KPI data)
    ind = candidates.find(function(c){return c.kpi_count!=null;}) || candidates[0] || null;
  }
  // Fallback: try by no (legacy — works for Gijduvon/Shofirkon where no matches)
  if(!ind){
    ind = findIndicator(data, no);
  }
  if(!ind || !ind.found || !ind.value) return null;
  // Override: indicator can carry kpi_count and kpi_pct fields directly
  if(ind.kpi_count!=null && ind.kpi_pct!=null){
    return {value:ind.kpi_count, unit:'нафар', sub:String(ind.kpi_pct).replace('.',',')+"%", subClass:'warn', delta:null, deltaDir:null};
  }
  const raw = String(ind.value).trim();
  // Special: "N% (M киши)" — show count as main, % as sub
  const pcm = raw.match(/(-?\d+(?:[.,]\d+)?)\s*%\s*\(\s*([\d\s]+)\s*(киши|та|нафар)\s*\)/i);
  if(pcm){
    const pct = parseFloat(pcm[1].replace(",","."));
    const cnt = parseInt(pcm[2].replace(/\s/g,""),10);
    return {value:cnt, unit:pcm[3], sub:pct.toFixed(1).replace(".",",")+"%", subClass:"warn", delta:null, deltaDir:null};
  }
  const p = parseValue(raw, {name:ind.name, desc:ind.desc});
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
  } else if(p.type==="metric_delta"){
    out.value = p.value;
    out.unit = opts.unit || p.unit || "";
    out.delta = (p.deltaPct>=0?'+':'')+p.deltaPct.toFixed(1)+'%';
    out.deltaDir = p.deltaPct>0?'up':(p.deltaPct<0?'down':'flat');
  } else if(p.type==="breakdown"){
    // Take the first numeric item (most representative, e.g. "Юридик шахслар: 1 854 та")
    for(let i=0;i<p.items.length;i++){
      const m = p.items[i].match(/[:\-]\s*([\d\s]+(?:[.,]\d+)?)/);
      if(m){
        const n = parseFloat(m[1].replace(/\s/g,"").replace(",","."));
        if(!isNaN(n)){out.value=n; out.unit=opts.unit||""; break;}
      }
    }
  } else if(p.type==="hero_facts"){
    const m = p.hero.match(/([\d\s]+(?:[.,]\d+)?)/);
    if(m){
      const n = parseFloat(m[1].replace(/\s/g,"").replace(",","."));
      if(!isNaN(n)){out.value=n; out.unit=opts.unit||"";}
    }
  }
  if(out.value==null){
    // Fallback: first number in the raw text
    const mm = raw.match(/(\d[\d\s]*(?:[.,]\d+)?)/);
    if(mm){
      const n = parseFloat(mm[1].replace(/\s/g,"").replace(",","."));
      if(!isNaN(n)){
        out.value = n;
        if(!out.unit){
          const tail = raw.slice(mm.index+mm[0].length).trim();
          if(tail) out.unit = tail.split(/\s/)[0];
        }
      }
    }
  }
  if(out.value==null) return null;
  return out;
}

const REGION_KPI_DEFS = [
  {no:24, icon:"bi-geo-alt-fill",        labelKey:"kpi_mahalla",   unitKey:"unit_ta",         namePattern:"Маҳалла"},
  {no:26, icon:"bi-house-door-fill",     labelKey:"kpi_xonadon",   unit:"",                   namePattern:"Хонадон"},
  {no:25, icon:"bi-people",              labelKey:"kpi_oila",      unit:"",                   namePattern:"Оила"},
  {no:23, icon:"bi-people-fill",         labelKey:"kpi_aholi",     unitKey:"unit_ming_kishi", namePattern:"Аҳоли"},
  {no:19, icon:"bi-person-x-fill",       labelKey:"kpi_ishsizlik", unit:"%", pctCount:true,   namePattern:"Ишсизлик"},
  {no:20, icon:"bi-arrow-down-circle",   labelKey:"kpi_kambag",    unit:"%", pctCount:true,   namePattern:"Камбағаллик"},
];

function renderRegionKpis(data){
  const wrap = document.getElementById("regionKpis");
  if(!wrap) return;
  const html = REGION_KPI_DEFS.map(function(def){
    const unit = def.unitKey ? T(def.unitKey) : (def.unit||"");
    const k = kpiFromIndicator(data, def.no, {unit:unit, namePattern:def.namePattern});
    let valHtml, deltaHtml="";
    if(!k){
      valHtml = '<div class="rk-val">—</div>';
    } else {
      valHtml = '<div class="rk-val">'+fmtNum(k.value)+
        (k.unit?' <span class="rk-unit">'+escapeHTML(k.unit)+'</span>':'')+'</div>';
      if(k.sub){
        const arrow = def.pctCount ? '<span class="rk-arrow">▼ </span>' : '';
        deltaHtml = '<div class="rk-sub'+(k.subClass?' '+k.subClass:'')+'">'+arrow+escapeHTML(k.sub)+'</div>';
      } else if(k.delta && !def.pctCount){
        const arrow = k.deltaDir==='up'?'▲':(k.deltaDir==='down'?'▼':'▬');
        deltaHtml = '<div class="rk-delta '+k.deltaDir+'">'+arrow+' '+escapeHTML(k.delta)+'</div>';
      }
    }
    const label = T(def.labelKey);
    return '<div class="rk-tile">'+
      '<div class="rk-ic"><i class="bi '+def.icon+'"></i></div>'+
      '<div class="rk-lab">'+escapeHTML(label)+'</div>'+
      valHtml + deltaHtml +
    '</div>';
  }).join("");
  wrap.innerHTML = html;
}

// ============================================================
// AI INSIGHTS
// ============================================================
const AI_TPL = {
  uz:{
    mah: (n)=>`<b>Маҳаллалар (${n} та)</b> — ҳар бир маҳаллага индивидуал драйвер сектор белгилаш ва маҳалла банкирлари орқали кузатув тизимини кучайтириш тавсия этилади.`,
    fam: (x,o)=>`<b>${x} та хонадон ва ${o} та оила</b> — оилавий тадбиркорлик (оналар дастури, ҳунармандчилик) орқали уй иқтисодиётини ривожлантириш резерви юқори.`,
    ishsiz:(p,cnt)=>`<b>Ишсизлик</b> — расмий даража ${p}% — нормал чегарада, лекин норасмий бандлик улуши юқори. Меҳнат бозорини расмийлаштириш устувор.${cnt?' Ҳозир '+cnt+' нафар ишсиз рўйхатда.':''}`,
    kamb:(p,cnt)=>`<b>Камбағаллик</b> — ${p}% — 2026 йил охиригача 2,0% гача тушириш учун ҳар бир камбағал оилага мақсадли микрокредит ва субсидия пакети шакллантирилсин.${cnt?' Жами '+cnt+' нафар.':''}`,
  },
  ru:{
    mah: (n)=>`<b>Махалли (${n} шт)</b> — рекомендуется определить индивидуальный драйвер-сектор для каждой махалли и усилить мониторинг через махаллинских банкиров.`,
    fam: (x,o)=>`<b>${x} домохозяйств и ${o} семей</b> — высокий резерв развития домашней экономики через семейное предпринимательство (программа для матерей, ремёсла).`,
    ishsiz:(p,cnt)=>`<b>Безработица</b> — официальный уровень ${p}% — в норме, но доля неформальной занятости высока. Приоритет — формализация рынка труда.${cnt?' Сейчас ${cnt} безработных в реестре.'.replace('${cnt}',cnt):''}`,
    kamb:(p,cnt)=>`<b>Бедность</b> — ${p}% — для снижения до 2,0% к 2026 году каждой малообеспеченной семье сформировать адресный пакет микрокредитов и субсидий.${cnt?' Всего ${cnt} человек.'.replace('${cnt}',cnt):''}`,
  },
  en:{
    mah: (n)=>`<b>Mahallas (${n})</b> — recommend assigning an individual driver sector to each mahalla and strengthening monitoring through mahalla bankers.`,
    fam: (x,o)=>`<b>${x} households and ${o} families</b> — high reserve for developing home economy through family entrepreneurship (mothers' program, crafts).`,
    ishsiz:(p,cnt)=>`<b>Unemployment</b> — official rate ${p}% is within norm, but informal employment share is high. Labor market formalization is a priority.${cnt?' Currently '+cnt+' unemployed registered.':''}`,
    kamb:(p,cnt)=>`<b>Poverty</b> — ${p}% — to reduce to 2.0% by 2026, a targeted microcredit and subsidy package should be formed for each poor family.${cnt?' Total '+cnt+' people.':''}`,
  },
};

function buildRegionInsights(district){
  const data = STATE.data[district];
  if(!data) return [];
  const tpl = AI_TPL[STATE.lang] || AI_TPL.uz;
  const out = [];

  const mah = kpiFromIndicator(data, 24, {namePattern:"Маҳалла"});
  const xon = kpiFromIndicator(data, 26, {namePattern:"Хонадон"});
  const oila = kpiFromIndicator(data, 25, {namePattern:"Оила"});
  const ishsiz = kpiFromIndicator(data, 19, {namePattern:"Ишсизлик"});
  const kamb = kpiFromIndicator(data, 20, {namePattern:"Камбағаллик"});

  if(mah && mah.value!=null){
    out.push({e:"🏘", t: tpl.mah(fmtNum(mah.value))});
  }
  if(xon && oila && xon.value!=null && oila.value!=null){
    out.push({e:"🏠", t: tpl.fam(fmtNum(xon.value), fmtNum(oila.value))});
  }
  function extractPct(k){
    if(!k) return null;
    if(k.unit==='%') return k.value;
    if(k.sub){
      const m=String(k.sub).match(/(-?\d+(?:[.,]\d+)?)\s*%/);
      if(m) return parseFloat(m[1].replace(',','.'));
    }
    return null;
  }
  const ishsizPct = extractPct(ishsiz);
  const kambPct = extractPct(kamb);
  if(ishsizPct!=null){
    const cnt = (ishsiz && ishsiz.unit!=='%') ? fmtNum(ishsiz.value) : '';
    out.push({e:"💼", t: tpl.ishsiz(ishsizPct.toFixed(1).replace('.',','), cnt)});
  }
  if(kambPct!=null){
    const cnt = (kamb && kamb.unit!=='%') ? fmtNum(kamb.value) : '';
    out.push({e:"📉", t: tpl.kamb(kambPct.toFixed(1).replace('.',','), cnt)});
  }
  return out.slice(0,6);
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

// ============================================================
// REGION SELECTOR (cascading: Region → District)
// All dynamic content uses escapeHTML() — no raw user input.
// ============================================================
function buildRegionSelector(){
  updateSelectorUI();
}

function updateSelectorUI(){
  var nameEl = document.getElementById("rsRegionName");
  var distEl = document.getElementById("rsDistrictName");
  if(nameEl) nameEl.textContent = regionLabel(STATE.region);
  if(distEl) distEl.textContent = districtLabel(STATE.district);
}

function showRegionsList(){
  var panel = document.getElementById("rsRegions");
  var distPanel = document.getElementById("rsDistricts");
  if(!panel) return;
  panel.style.display = "";
  if(distPanel) distPanel.style.display = "none";

  // Build with safe DOM methods
  panel.textContent = "";
  var title = document.createElement("div");
  title.className = "rs-title";
  title.textContent = "Вилоятни танланг";
  panel.appendChild(title);

  REGIONS.forEach(function(r){
    var count = r.districts.filter(function(d){return d.hasData;}).length;
    var total = r.districts.length;
    var isActive = r.id === STATE.region;

    var item = document.createElement("div");
    item.className = "rs-item" + (isActive?" active":"");
    item.dataset.region = r.id;

    var icon = document.createElement("i");
    icon.className = "bi bi-geo-alt"+(isActive?"-fill":"");
    item.appendChild(icon);

    var info = document.createElement("div");
    info.className = "rs-item-info";
    var nameDiv = document.createElement("div");
    nameDiv.className = "rs-item-name";
    nameDiv.textContent = r.name[STATE.lang]||r.name.uz;
    info.appendChild(nameDiv);
    var meta = document.createElement("div");
    meta.className = "rs-item-meta";
    meta.textContent = count+" / "+total+" туман маълумоти мавжуд";
    info.appendChild(meta);
    item.appendChild(info);

    var arrow = document.createElement("i");
    arrow.className = "bi bi-chevron-right";
    item.appendChild(arrow);

    item.addEventListener("click",function(e){
      e.stopPropagation();
      showDistrictsList(r.id);
    });
    panel.appendChild(item);
  });
}

function showDistrictsList(regionId){
  var panel = document.getElementById("rsDistricts");
  var regPanel = document.getElementById("rsRegions");
  if(!panel) return;
  if(regPanel) regPanel.style.display = "none";
  panel.style.display = "";

  var region = getRegion(regionId);
  if(!region) return;

  panel.textContent = "";

  // Back button
  var backEl = document.createElement("div");
  backEl.className = "rs-back";
  var backIcon = document.createElement("i");
  backIcon.className = "bi bi-arrow-left";
  backEl.appendChild(backIcon);
  backEl.appendChild(document.createTextNode(" "+(region.name[STATE.lang]||region.name.uz)));
  backEl.addEventListener("click",function(e){
    e.stopPropagation();
    showRegionsList();
  });
  panel.appendChild(backEl);

  var title = document.createElement("div");
  title.className = "rs-title";
  title.textContent = "Туманни танланг";
  panel.appendChild(title);

  region.districts.forEach(function(d){
    var isActive = d.id === STATE.district;
    var disabled = !d.hasData;

    var item = document.createElement("div");
    item.className = "rs-item"+(isActive?" active":"")+(disabled?" disabled":"");
    item.dataset.district = d.id;
    item.dataset.region = regionId;

    var icon = document.createElement("i");
    icon.className = "bi bi-building"+(disabled?" text-muted":"");
    item.appendChild(icon);

    var info = document.createElement("div");
    info.className = "rs-item-info";
    var nameDiv = document.createElement("div");
    nameDiv.className = "rs-item-name";
    nameDiv.textContent = d.name[STATE.lang]||d.name.uz;
    info.appendChild(nameDiv);
    if(disabled){
      var metaDiv = document.createElement("div");
      metaDiv.className = "rs-item-meta";
      metaDiv.textContent = "маълумот тайёрланмоқда";
      info.appendChild(metaDiv);
    }
    item.appendChild(info);

    if(isActive){
      var check = document.createElement("i");
      check.className = "bi bi-check-circle-fill rs-check";
      item.appendChild(check);
    }

    if(!disabled){
      item.addEventListener("click",function(e){
        e.stopPropagation();
        var dd = document.getElementById("rsDropdown");
        if(dd) dd.classList.remove("open");
        var cur = document.getElementById("rsCurrent");
        if(cur) cur.setAttribute("aria-expanded","false");
        switchDistrict(regionId, d.id);
      });
    }
    panel.appendChild(item);
  });
}

document.addEventListener("DOMContentLoaded",init);
