# SQB Минтақавий таҳлил тизими

SQB банк (Ўзсаноатқурилишбанк) учун Ўзбекистон вилоятлари ва туманлари бўйича интерактив веб-дашборд.
3 тилли (UZ/RU/EN). Президент учун тайёрланган.

## Ҳозирги ҳолат

| Вилоят | Туман | Карточкалар | Ҳолат |
|--------|-------|-------------|-------|
| Бухоро | Ғиждувон | 73 | ✅ Тайёр |
| Бухоро | Шофиркон | 44 | ✅ Тайёр |
| Фарғона | Қўқон | 40 | ✅ Тайёр |
| Фарғона | Қўштепа | 39 | ✅ Тайёр |

## Файл тузилмаси

```
🌐 Президент дашборд/
├── index.html                         — асосий HTML
├── gluon_advisor_uz (1).html          — SQB AI Advisor
├── SQB Logo Main short 1.png          — логотип
├── gijduvon.jpg / shofirkon.jpg / ... — hero фон расмлари
├── assets/
│   ├── js/app.js                      — БУТУН логика (~1800 қатор)
│   ├── css/style.css                  — стиллар (~1700 қатор)
│   └── data/
│       ├── gijduvon.json              — Ғиждувон маълумотлари
│       ├── shofirkon.json             — Шофиркон маълумотлари
│       ├── qoqon.json                 — Қўқон маълумотлари
│       ├── qoshtepa.json              — Қўштепа маълумотлари
│       ├── master.json                — слайд структураси
│       └── i18n_indicators.json       — таржималар (RU/EN)
├── functions/api/openai-proxy.js      — Cloudflare Pages proxy
└── proxy.php                          — PHP proxy (Apache/cPanel hosting)
```

## Деплой

| Платформа | URL | Ҳолат |
|-----------|-----|-------|
| **Cloudflare Pages** | https://sqb-dashboard.pages.dev | Production |
| **GitHub** | https://github.com/u-specter/sqb-buxoro-dashboard | Код базаси |

### Push ва деплой қилиш

```bash
# 1. Файлларни деплой репога нусхалаш
cd /tmp/sqb-buxoro-dashboard
rsync -a --delete --exclude=.git \
  "📦 Эски сайт/🌐 Президент дашборд/" ./

# 2. API калитни ҲАММА ВАҚТ redact қилиш (МУҲИМ!)
perl -i -pe 's/sk-proj-[A-Za-z0-9_\-]+/REDACTED_OPENAI_KEY/g' \
  "gluon_advisor_uz (1).html"

# 3. GitHub'га push
git add -A
git commit -m "feat: ..."
git push origin main

# 4. Cloudflare'га деплой
cd "📦 Эски сайт/🌐 Президент дашборд"
wrangler pages deploy . --project-name sqb-dashboard --commit-dirty=true
```

⚠️ **ДИҚҚАТ:** `gluon_advisor_uz (1).html` ичида OpenAI API калити бор.
Push қилишдан ОЛДИН `perl` билан redact қилиш ШАРТ!

---

## Янги туман/шаҳар қўшиш

### 1-қадам: app.js да REGIONS массивига қўшиш (қатор ~200)

```js
const REGIONS = [
  {
    id: "bukhara",
    name: {uz:"Бухоро вилояти", ru:"Бухарская область", en:"Bukhara Region"},
    districts: [
      {id:"gijduvon", name:{uz:"Ғиждувон", ru:"Гиждуван", en:"Gijduvon"},
       file:"gijduvon.json", hasData:true},
      // ЯНГИ ТУМАН ШУ ЕРГА:
      {id:"yangi_id", name:{uz:"Номи", ru:"Название", en:"Name"},
       file:"yangi.json", hasData:true},
      // type:"shahar" — шаҳар бўлса қўшинг ("Шаҳрининг" деб ёзилади)
    ]
  }
];
```

### 2-қадам: DISTRICT_LABEL га қўшиш (қатор ~275)

```js
Object.defineProperty(DISTRICT_LABEL, 'yangi_id',
  {get:function(){return districtLabel('yangi_id');}});
```

### 3-қадам: JSON файл яратиш — `assets/data/yangi.json`

```json
{
  "tuman": "Янги туман",
  "total": 0,
  "found": 0,
  "indicators": [],
  "hero_kpis": {
    "Аҳоли": {"value": 200.5, "unit": "минг киши"},
    "Маҳалла": {"value": 45, "unit": "та"},
    "Оила": {"value": 50000, "unit": "та"},
    "Хонадон": {"value": 48000, "unit": "та"}
  }
}
```

### 4-қадам: Карточкалар қўшиш

`indicators` массивига объект қўшилади:

```json
{
  "no": 1,
  "slide": 1,
  "slide_no": "1",
  "name": "Карточка номи",
  "desc": "Қисқа тавсиф",
  "value": "...",
  "found": true,
  "source_org": "stat.uz",
  "ai_insight": "СИ тавсияси матни"
}
```

**Слайдлар:**
| Слайд | Мавзу |
|-------|-------|
| 1 | Иқтисодий фаоллик |
| 2 | Инфратузилма |
| 3 | Аҳоли ва бандлик |
| 4 | Маҳалла тадбиркорлиги ва банк |
| 5 | Имкониятлар |
| 6 | Хулоса ва режа |

### 5-қадам: Hero фон расми (ихтиёрий)

1. Расмни root папкага қўйинг: `yangi.jpg` (1920px, <600 КБ)
2. `app.js` да `HERO_BG_MAP` га қўшинг:

```js
var HERO_BG_MAP = {
  qoqon: "freepik...jpg",
  shofirkon: "shofirkon.jpg",
  gijduvon: "gijduvon.jpg",
  qoshtepa: "qoshtepa.jpg",
  yangi_id: "yangi.jpg"    // ← ШУ ЕРГА
};
```

---

## Value турлари (карточка маълумотлари)

| Формат | Натижа | Мисол |
|--------|--------|-------|
| `"Жами: ... \| Факт 1: ... \| Факт 2: ..."` | Hero facts карточка | `"Жами: 2025 йил \| Саноат: 3 074 млрд (+6,5%)"` |
| `"2021: 100 \| 2022: 120 \| 2023: 150 (млрд сўм)"` | Чизиқли чарт (timeseries) | `"2021: 42,5 \| 2022: 48,3 \| 2025: 84,0 (%)"` |
| `"68 та"` | Оддий рақам (single_metric) | |
| `{"type":"yearly_credits", ...}` | Вертикал бар чарт | |
| `{"type":"multi_series_forecast", ...}` | Кўп чизиқли чарт | |

## Махсус полялар

| Поля | Мақсад |
|------|--------|
| `no_forecast: true` | Чартда прогноз чизиғини ўчиради |
| `kpi_count: 5165` | Hero KPI да рақам кўрсатади |
| `kpi_pct: 4.5` | Hero KPI да фоиз кўрсатади |
| `source_org` | Манба: stat.uz, SQB, Хокимият, Марказий банк |

---

## Нумерацияни тўғрилаш

Карточкалар қўшиб бўлгандан кейин:

```bash
python3 -c "
import json
with open('assets/data/yangi.json') as f:
    data = json.load(f)
data['indicators'].sort(key=lambda x: (x['slide'], x['no']))
for i, ind in enumerate(data['indicators'], 1):
    ind['no'] = i
data['total'] = len(data['indicators'])
data['found'] = len([x for x in data['indicators'] if x.get('found')])
with open('assets/data/yangi.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
"
```

---

## Янги вилоят қўшиш

Агар янги вилоят (масалан Самарқанд) қўшиш керак бўлса:

1. `app.js` да `REGIONS` массивига янги объект қўшинг:
```js
{
  id: "samarkand",
  name: {uz:"Самарқанд вилояти", ru:"Самаркандская область", en:"Samarkand Region"},
  districts: [
    {id:"samarkand_sh", name:{uz:"Самарқанд шаҳри",...}, file:"samarkand.json", hasData:true, type:"shahar"},
  ]
}
```

2. JSON файл яратинг: `assets/data/samarkand.json`
3. `DISTRICT_LABEL` ва `HERO_BG_MAP` га қўшинг
4. AI Advisor'да (`gluon_advisor_uz (1).html`):
   - `REGION_DISTRICTS` га вилоят қўшинг
   - `MAHALLA_MAP` га маҳаллалар рўйхатини қўшинг
   - Рус таржимада район номини қўшинг

---

## МУҲИМ қоидалар

1. **API калит** — push дан олдин ҲАММА ВАҚТ redact қилинади
2. **СИ ТАВСИЯСИ** деб ёзилади (ИИ эмас)
3. **AI тавсия услуби:** "керак/лозим/зарур" (тўғридан-тўғри буюруқ эмас)
4. **Рус сўзлар ишлатмаслик:** звено→занжир, бренд→номланиш
5. **Тил:** Ўзбек кирил (асосий)
6. **Карточка ўчирилса** → `REGION_KPI_DEFS`, `kpiFromIndicator` ЯНГИЛАНИШИ КЕРАК
7. **Расмлар:** 1920px кенглик, <600 КБ (sips билан оптимизация)

## Корпоратив ранглар

| Ранг | Код | Қўлланиш |
|------|-----|----------|
| Navy | `#0F1F44` | Асосий фон, navbar |
| Dark Blue | `#003D64` | Hero, градиент |
| Blue | `#0590C9` | Акцент, тугмалар, чарт |
| White | `#FFFFFF` | Матн |

## Технологиялар

- HTML5 + CSS3 (Bootstrap 5.3.3)
- Vanilla JavaScript (фреймворксиз)
- Chart.js 4.4.1
- OpenAI API (gpt-4o-mini) — proxy орқали
- Деплой: Cloudflare Pages

## Алоқа

- **GitHub:** https://github.com/u-specter/sqb-buxoro-dashboard
- **Cloudflare:** https://sqb-dashboard.pages.dev
