# SQB Минтақавий таҳлил тизими

Ўзсаноатқурилишбанк (SQB) учун Ўзбекистон вилоятлари ва туманлари бўйича интерактив президент дашборди. Static SPA: vanilla JavaScript, Bootstrap 5, Chart.js. Cloudflare Pages'да деплой қилинади. Маълумотлар ҳар туман учун битта JSON файли (қатъий схема, GitHub Actions'да валидация). Асосий тил — ўзбек кирил, UI 3 тилли (UZ/RU/EN).

---

## 1. Ҳозирги қамров

| Вилоят / Республика | Туман / Шаҳар | JSON | Карточка | Ҳолат |
|---|---|---|---|---|
| Бухоро | Ғиждувон | `gijduvon.json` | 42 | ✅ |
| Бухоро | Шофиркон | `shofirkon.json` | 47 | ✅ |
| Фарғона | Қўқон шаҳри | `qoqon.json` | 43 | ✅ |
| Фарғона | Қўштепа | `qoshtepa.json` | 36 | ✅ |
| Сурхондарё | Сурхондарё вилояти | `boysun.json` | 40 | ✅ |
| Сурхондарё | Бойсун | `boysun_tuman.json` | 40 | ✅ |
| Сурхондарё | Сариосиё | `sariosiyo.json` | 45 | ✅ |
| Сурхондарё | Термиз | `termiz.json` | 42 | ✅ |
| Қорақалпоғистон | Республика | `karakalpakstan.json` | 42 | ✅ |
| Қорақалпоғистон | Қўнғирот | `qongirot.json` | 39 | ✅ |
| Қорақалпоғистон | Қонлиқўл | `qonlikol.json` | 43 | ✅ |
| Қорақалпоғистон | Тахиатош | `toxiatosh.json` | 16 | 🟡 placeholder |
| Сирдарё | Гулистон шаҳри | `guliston.json` | 46 | ✅ |
| Тошкент шаҳри | Мирзо Улуғбек | `mirzoulgbek.json` | 44 | ✅ |
| Тошкент шаҳри | Учтепа | `uchtepa.json` | 44 | ✅ |
| Андижон | Хонобод шаҳри | `xonobod.json` | 45 | ✅ |
| Андижон | Шаҳрихон | `shahrixon.json` | 41 | ✅ |
| Андижон | Андижон вилояти | `andijan.json` | 0 | 🟡 placeholder |
| Наманган | Янгиқўрғон | `yangiqorgon.json` | 44 | ✅ |
| Жиззах | Фориш | `forish.json` | 44 | ✅ |
| Самарқанд | Пайариқ | `payariq.json` | 44 | ✅ |
| Навоий | Кармана | `karmana.json` | 44 | ✅ |

**Жами:** 12 минтақа, 22 туман/шаҳар/вилоят, ~870 карточка.

---

## 2. Архитектура ва файл тузилмаси

```
🌐 Президент дашборд/
├── index.html                       — асосий SPA entry-point
├── advisor.html                     — SQB AI Advisor (OpenAI gpt-4o-mini орқали)
├── sqb-mahalla-map.html             — маҳалла харита экспериментал саҳифаси
├── proxy.php                        — PHP OpenAI proxy (Apache/cPanel hosting)
├── .htaccess                        — Apache конфиг (cache headers)
├── functions/
│   └── api/openai-proxy.js          — Cloudflare Pages Function (OpenAI proxy)
├── assets/
│   ├── js/
│   │   ├── app.js                   — асосий SPA логикаси (~1875 қатор)
│   │   ├── parsers.js               — value-string парсерлари (window.SQB_Parsers)
│   │   ├── parsers.test.html        — юнит-тестлар (17 та сценарий)
│   │   └── map-bg.js                — Three.js 3D Ўзбекистон харита фон
│   ├── css/
│   │   └── style.css                — стиллар (~1887 қатор)
│   └── data/
│       ├── master.json              — слайд структураси (6 секция, 151 индикатор)
│       ├── i18n_indicators.json     — RU/EN таржималар кэши
│       └── <district>.json × 22     — ҳар туман маълумотлари
├── img/
│   ├── SQB Logo Main short 1.png    — логотип
│   ├── <district>.jpg / <district>_opt.jpg — hero фон расмлари
│   └── satellite-bg.jpg             — landing satellite фон
├── schemas/
│   ├── district.schema.json         — district JSON учун JSON Schema (Draft-7)
│   └── sources.json                 — манба ташкилотлар канонcкий рўйхати
├── scripts/
│   ├── validate_data.py             — JSON валидатор (CI'да ишлайди)
│   └── normalize_sources.py         — source_org нормализатори
├── .github/workflows/
│   └── validate-data.yml            — GitHub Actions CI пайплайни
├── db_backup_generator.py           — PostgreSQL backup генератори (script)
├── sqb_dashboard_backup.sql         — DDL + data dump (~1.1 MB)
└── README.md                        — мана шу файл
```

### 2.1 Routing (hash-based)

`#landing` → старт саҳифаси (вилоят/туман танлаш)
`#home` → танланган туманнинг hero ва KPI tile'лари
`#slide-1` … `#slide-6` → секциялар бўйича карточкалар
`#advisor` → AI Advisor (advisor.html ичида)

### 2.2 Загрузка тартиби (`index.html`)

1. Bootstrap 5.3.3 CSS, Bootstrap Icons, Inter fonts, `style.css`
2. Bootstrap JS, Chart.js 4.4.1
3. **`parsers.js`** (мажбурий **app.js'дан олдин** — `window.SQB_Parsers` экспозицияси)
4. **`app.js`**
5. Three.js (lazy loaded — FCP'ни блок қилмайди)

---

## 3. Маълумот модели

### 3.1 District JSON схемаси (`schemas/district.schema.json`)

Top-level мажбурий поля:

| Поля | Тип | Description |
|---|---|---|
| `district` | string (slug, `^[a-z][a-z0-9_]{1,40}$`) | URL-safe ID; `app.js` REGIONS'даги `id` билан мос |
| `district_name` | string | Тўлиқ ўзбек кирил номи (масалан `"Бойсун тумани"`) |
| `region` | string | Ота-минтақа (масалан `"Сурхондарё вилояти"`) |
| `year` | integer (2024–2035) | Ҳисобот йили |
| `total` | integer | `len(indicators)` га тенг бўлиши шарт |
| `hero_kpis` | object | Аниқ 4 калит, бошқалари йўқ |
| `indicators` | array | Карточкалар |

`hero_kpis` калитлари (ҳар бирида `{value: number, unit: string}`):

```json
{
  "Аҳоли":   {"value": 331.5, "unit": "минг киши"},
  "Маҳалла": {"value": 70,    "unit": "та"},
  "Оила":    {"value": 75000, "unit": "та"},
  "Хонадон": {"value": 72000, "unit": "та"}
}
```

### 3.2 Indicator (карточка) тузилмаси

```json
{
  "no": 12,                      // Карточка рақами (1..N, такрорланмаслик керак)
  "slide": 2,                    // 1–6 (қуйидаги бўлим жадвалига қаранг)
  "slide_no": "2",               // Compatibility учун string
  "name": "Карточка номи",
  "desc": "Қисқа тавсиф",
  "value": "...",                // Pipe-separated string ёки typed object (3.4 га қаранг)
  "found": true,                 // false = карточка яширилади / "маълумот йўқ" белгиси
  "source_org": "stat.uz",       // schemas/sources.json'даги канонcкий ном
  "ai_insight": "СИ таҳлили...", // ихтиёрий
  "kpi_count": 5165,             // ихтиёрий: hero KPI tile'да рақам
  "kpi_pct": 4.5,                // ихтиёрий: hero KPI tile'да фоиз
  "no_forecast": true,           // ихтиёрий: чартда прогноз чизиғини ўчиради
  "hidden": false,               // ихтиёрий: UI'дан яширади (ҳужжатдан ўчирмасдан)
  "note": "..."                  // ихтиёрий: ички қайд
}
```

### 3.3 Слайд секциялари

| Слайд | Мавзу |
|---|---|
| 1 | Иқтисодий фаоллик |
| 2 | Инфратузилма |
| 3 | Аҳоли ва бандлик |
| 4 | Маҳалла тадбиркорлиги ва банк |
| 5 | Имкониятлар |
| 6 | Хулоса ва режа |

### 3.4 `value` формат грамматикалари

`assets/js/parsers.js` етти грамматикани автоматик аниқлайди (тартиб бўйича):

| Grammar | Pattern | Misol | Render |
|---|---|---|---|
| `metric_delta` | `"<метрика>: <рақам> (<+/-%>)"` | `"Саноат: 3 074 млрд (+6,5%)"` | KPI карточка delta-чегараси билан |
| `hero_facts` | `"Жами: ... \| Факт1: ... \| Факт2: ..."` | `"Жами: 2025 йил \| Саноат: 3 074 млрд"` | Hero facts блок |
| `breakdown` | `"<label>: A: 50 \| B: 30 \| C: 20"` | `"Тармоқлар: Саноат: 65% \| Хизматлар: 25%"` | Donut/pie чарт |
| `estimated_trend` | `"2021: 100 → 2022: 120 → 2025: 150 (млрд)"` | `"2021: 100 → 2025: 150"` | Линейный чарт |
| `year_timeseries` | `"2021: 42 \| 2022: 48 \| 2025: 84 (%)"` | timeseries | Йиллик линейный чарт |
| `bullet_list` | `"• A • B • C"` | `"• Саноат • Хизмат • Қурилиш"` | Маркированний рўйхат |
| `numeric_fallback` | оддий рақам/матн | `"68 та"` | single_metric |

**Pre-typed object вариант:**

```json
"value": {
  "type": "yearly_credits",
  "data": [{"year": 2021, "value": 42}, ...]
}
```

Қўллаб-қувватланадиган `type` лар: `yearly_credits`, `multi_series_forecast` (қ. `app.js` 1100+ қатор атрофида).

### 3.5 `master.json` ва `i18n_indicators.json`

- `master.json` — 6 секция × ~25 индикатор реестри. UI слайд тузилмасини ясаш учун ишлатилади (туманга боғлиқ эмас).
- `i18n_indicators.json` — `{"ru": {<key>: <text>}, "en": {<key>: <text>}}` форматида таржималар. Калит схемаси: `<district>:<no>:<field>` (масалан `gij:1:desc`). Бўш қолдириш мумкин — UI fallback ўзбек кирилга қайтаради.

> **Эслатма:** RU/EN таржималарни тўлдириш мажбурий эмас. Дашборд президент учун — асосий тил ўзбек кирил.

---

## 4. Манба ташкилотлар (`source_org`) реестри

### 4.1 Канонcкий рўйхат (`schemas/sources.json`)

```jsonc
{
  "version": "1.0",
  "aliases": {
    "Хокимият": "Ҳокимият",                     // типографик хато
    "Кадастр": "Кадастр агентлиги",             // аббревиатура
    "Минэнерго": "Энергетика вазирлиги",        // русча → ўзбек
    "Халқ таълими бўлими": "Мактабгача ва мактаб таълими бўлими"
    // …
  },
  "canonical": [
    {"id": "sqb",        "name": "SQB",                "kind": "bank"},
    {"id": "stat_uz",    "name": "stat.uz",            "kind": "stat"},
    {"id": "khok",       "name": "Ҳокимият",           "kind": "generic"}
    // …~90 ёзув
  ]
}
```

Composite source строкалари (`/`, `|`, `+` атрофида пробеллар билан) атом-by-атом нормализация қилинади. `Қ/х` каби аббревиатуралар сақланади чунки SPLIT_RX пробелларни талаб қилади.

### 4.2 Workflow

```bash
# 1. Қанча ўзгариш кутилишини кўриш
python3 scripts/normalize_sources.py --dry-run

# 2. Қўллаш
python3 scripts/normalize_sources.py
```

**Янги манба ташкилот қўшиш:**

- Расмий янги ташкилот → `canonical` массивига обйект қўшинг (`id`, `name`, `kind`).
- Эски/типографик/аббревиатура → `aliases` объектига қўшинг (`"Хато": "Тўғри"`).
- Композит "X ва Y" → `aliases` га whole-string entry: `"X ва Y": "X / Y"` (тарафлари канонcкий бўлиши керак).

`kind` қийматлари: `bank`, `ministry`, `agency`, `committee`, `regional`, `district`, `city`, `generic`, `external`, `internal`, `utility`, `local`, `stat`, `ngo`.

### 4.3 Валидация

`scripts/validate_data.py` ҳар бир `source_org` атомини канонcкий рўйхатдан текширади. Канонcкийдан четлашган атомлар warning сифатида чиқарилади ва `normalize_sources.py` ишга туширишга йўналтирилади.

---

## 5. Локал дев

### 5.1 Сервер ишга тушириш

```bash
cd "📦 Эски сайт/🌐 Президент дашборд"
python3 -m http.server 8765
# http://localhost:8765 — асосий саҳифа
# http://localhost:8765/assets/js/parsers.test.html — парсер тестлари
```

### 5.2 Маълумотларни валидация қилиш

```bash
python3 scripts/validate_data.py            # барча файллар
python3 scripts/validate_data.py --strict   # warning'лар ҳам error
python3 scripts/normalize_sources.py --dry-run   # source_org нормализация preview
```

Текширилаётган элементлар (валидатор):
- ✅ JSON Schema (top-level + indicators + hero_kpis)
- ✅ `total` = `len(indicators)` (cross-check)
- ✅ Indicator `no` уникал
- ✅ `district` slug файл номига мос
- ✅ Slug уникал барча файллар бўйича
- ✅ `app.js` REGIONS массивидан orphan'лар
- ✅ `source_org` атомлари канонcкий
- ⚠ Warning: `hero_kpis` value=0, кўриниб турган карточкада `source_org` йўқлиги, slug mismatch

### 5.3 Парсер юнит-тестлар

Браузерда `assets/js/parsers.test.html` очинг — 17 та тест автоматик ишлайди. Янги грамматика қўшилса, шу файлга тест қўшиш керак.

---

## 6. CI (GitHub Actions)

`.github/workflows/validate-data.yml` — `assets/data/**`, `schemas/**`, ёки валидатор ўзгарганда ҳар PR'да ва main'га push'да ишлайди. Агар валидатор fail бўлса PR merge'дан тўсилади.

---

## 7. Деплой

| Платформа | URL | Роли |
|---|---|---|
| Cloudflare Pages | https://sqb-dashboard.pages.dev | Production |
| GitHub | https://github.com/u-specter/sqb-buxoro-dashboard | Manba код |

### 7.1 Push + деплой workflow

Дашборд репози `/tmp/sqb-buxoro-dashboard` да клон қилинган (working dir эмас). Workflow:

```bash
# 1. Working dir'дан деплой репога нусхалаш
cd /tmp/sqb-buxoro-dashboard
rsync -a --delete --exclude=.git --exclude=.vercel --exclude=.wrangler \
  "/Users/.../📦 Эски сайт/🌐 Президент дашборд/" ./

# 2. API калитни redact (МАЖБУРИЙ — advisor.html ичида)
perl -i -pe 's/sk-proj-[A-Za-z0-9_\-]+/REDACTED_OPENAI_KEY/g' advisor.html

# 3. Feature branch'да commit + push (main'га тўғридан-тўғри пуш йўқ)
git add -A
git commit -m "feat: ..."
git push origin <feature-branch>

# 4. GitHub'да PR очиб main'га merge

# 5. Cloudflare деплой (main'га merge'дан кейин)
cd "📦 Эски сайт/🌐 Президент дашборд"
wrangler pages deploy . --project-name sqb-dashboard --commit-dirty=true
```

⚠️ **МАЖБУРИЙ қоидалар:**
- `advisor.html` ичида OpenAI API калити бор → push'дан **олдин** redact ШАРТ
- `main` бранчга тўғридан-тўғри push **тақиқланган** — feature branch + PR
- Деплой автоматик эмас — main'га merge'дан кейин қўлда `wrangler pages deploy`

---

## 8. Янги туман қўшиш (тўлиқ chec-list)

Ҳар бир қадам мажбурий — биттаси ўтказиб юборилса UI ёки CI'да хато беради.

### 1-қадам: `assets/js/app.js` — REGIONS массиви (~200 қатор)

Тегишли вилоят объекти ичида `districts` массивига қўшинг:

```js
{
  id: "yangi_id",                    // URL-safe slug
  name: {uz:"Номи", ru:"Имя", en:"Name"},
  file: "yangi.json",
  hasData: true,
  type: "shahar"                     // ихтиёрий: "shahar" | "viloyat" | "respublika"
}
```

Янги вилоят бўлса — REGIONS массивига янги region объект қўшинг.

### 2-қадам: `assets/js/app.js` — DISTRICT_LABEL (~325 қатор)

```js
Object.defineProperty(DISTRICT_LABEL, 'yangi_id',
  {get:function(){return districtLabel('yangi_id');}});
```

### 3-қадам: `assets/js/app.js` — HERO_BG_MAP (~1039 қатор) (ихтиёрий)

```js
var HERO_BG_MAP = {
  // ...
  yangi_id: "img/yangi_opt.jpg"
};
```

Расм: 1920px кенглик, <600 KB, `img/` папкасига `_opt.jpg` суффикси билан жойланади.

### 4-қадам: `assets/data/yangi.json` — JSON файл

```json
{
  "district": "yangi_id",
  "district_name": "Янги тумани",
  "region": "X вилояти",
  "year": 2025,
  "total": 0,
  "hero_kpis": {
    "Аҳоли":   {"value": 200.5, "unit": "минг киши"},
    "Маҳалла": {"value": 45,    "unit": "та"},
    "Оила":    {"value": 50000, "unit": "та"},
    "Хонадон": {"value": 48000, "unit": "та"}
  },
  "indicators": []
}
```

### 5-қадам: Карточкалар қўшиш

`indicators` массивига 3.2-секцияда кўрсатилган тузилмага мос объектлар қўшинг.

### 6-қадам: `advisor.html` — REGION_DISTRICTS (~3198 қатор)

```js
var REGION_DISTRICTS = {
  // ...
  'X вилояти': ['Янги тумани']  // тўлиқ кирил ном
};
var MAHALLA_LIST = {
  // ...
  'Янги тумани': ['Маҳалла 1', 'Маҳалла 2', ...]
};
```

### 7-қадам: Нумерация ва total'ни автоматик тузатиш

```bash
python3 -c "
import json
fp = 'assets/data/yangi.json'
data = json.loads(open(fp).read())
data['indicators'].sort(key=lambda x: (x['slide'], x['no']))
for i, ind in enumerate(data['indicators'], 1):
    ind['no'] = i
data['total'] = len(data['indicators'])
open(fp, 'w').write(json.dumps(data, ensure_ascii=False, indent=2))
"
```

### 8-қадам: Валидация

```bash
python3 scripts/normalize_sources.py     # source_org канонcклаштириш
python3 scripts/validate_data.py         # тўлиқ валидация
```

---

## 9. Карточка ўчириш / янгилаш ҳавфли жойлари

1. **Карточка ўчирилганда** → `app.js` `REGION_KPI_DEFS` ва `kpiFromIndicator` функцияларидаги шу карточкага реф'лар янгиланиши ШАРТ. Акс ҳолда KPI tile буш ёки `undefined` чиқади.
2. **`no` ўзгартирилганда** → `i18n_indicators.json` калитлари (`<district>:<no>:<field>`) ҳам янгиланиши керак — акс ҳолда RU/EN таржималар бошқа карточкага тушиб қолади.
3. **`source_org` ўзгартирилганда** → `normalize_sources.py` дан кейин `validate_data.py` ишга туширинг. Канонcкий бўлмаса аввал `schemas/sources.json` га қўшинг.

---

## 10. Кодлаш ва контент қоидалари

| # | Қоида |
|---|---|
| 1 | **API калит** push'дан олдин ҲАММА ВАҚТ redact (қ. 7.1) |
| 2 | **main'га тўғридан-тўғри push йўқ** — feature branch + PR |
| 3 | **Тил**: ўзбек кирил (асосий). Рус сўзлар ишлатмаслик: звено→занжир, бренд→номланиш |
| 4 | **"СИ таҳлили"** деб ёзилади (ИИ эмас) |
| 5 | **AI тавсия услуби**: "керак / лозим / зарур" — буюруқ эмас, тавсия |
| 6 | **Расмлар**: 1920px, <600 KB, `_opt.jpg` суффикси (sips билан оптимизация) |
| 7 | **Карточка ўчирилса** → KPI ref'лар янгиланиши шарт (9-секция) |
| 8 | **`source_org` фақат канонcкий** (`schemas/sources.json`) |
| 9 | RU/EN таржима **мажбурий эмас** |

---

## 11. Корпоратив дизайн

| Ранг | Hex | Қўлланиш |
|---|---|---|
| Navy | `#0F1F44` | Асосий фон, navbar |
| Dark Blue | `#003D64` | Hero, градиент |
| Accent Blue | `#0590C9` | Тугмалар, чарт акценти |
| Silver | `#B4B4B6` | Иккинчи даражали матн |
| Red | `#FB0007` | Огоҳлантириш, негатив дельта |
| White | `#FFFFFF` | Асосий матн |

---

## 12. Технологик стек

| Қатлам | Технология |
|---|---|
| Markup | HTML5 |
| Стиллар | CSS3, Bootstrap 5.3.3, Bootstrap Icons 1.11.3 |
| Тил/JS | Vanilla ES2015+ (фреймворксиз) |
| Чартлар | Chart.js 4.4.1 |
| 3D фон | Three.js r128 (lazy load) |
| Шрифт | Inter (Google Fonts) |
| AI Advisor | OpenAI gpt-4o-mini (proxy орқали) |
| Backend | йўқ (static SPA + Cloudflare Function proxy) |
| Валидация | Python 3.12 (зерох dependency) + JSON Schema Draft-7 |
| CI | GitHub Actions |
| Деплой | Cloudflare Pages (`wrangler pages deploy`) |

---

## 13. Тезкор файл-навигация (AI агентлар учун)

Энг кўп ўзгартирилаётган локацияларда:

| Локация | Сатр | Что бор |
|---|---|---|
| `assets/js/app.js` | ~200 | `REGIONS` (минтақа/туман реестри) |
| `assets/js/app.js` | ~303 | `districtLabel()` функцияси |
| `assets/js/app.js` | ~325 | `DISTRICT_LABEL` (динамик геттер'лар) |
| `assets/js/app.js` | ~337 | `parseValue()` диспетчер (parsers.js'га делегат) |
| `assets/js/app.js` | ~1039 | `HERO_BG_MAP` (фон расмлар) |
| `assets/js/parsers.js` | ~226 | `window.SQB_Parsers` экспорт |
| `advisor.html` | ~3198 | `REGION_DISTRICTS`, `MAHALLA_LIST` |

---

## 14. Алоқа

- **GitHub:** https://github.com/u-specter/sqb-buxoro-dashboard
- **Production:** https://sqb-dashboard.pages.dev
- **Request log:** `📦 Эски сайт/📄 Ҳужжатлар/📝 LOG.md` (ҳар талаб қайд этилади)
