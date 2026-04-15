# SQB Дашборд — Қўлланма

## 1. Лойиҳа тузилмаси

```
📦 Эски сайт/🌐 Президент дашборд/
├── index.html                    — асосий HTML (navbar, sidebar, hero)
├── assets/
│   ├── js/app.js                 — бутун логика (REGIONS конфиг, рендер, чартлар)
│   ├── css/style.css             — стиллар
│   └── data/
│       ├── gijduvon.json         — Ғиждувон маълумотлари
│       ├── shofirkon.json        — Шофиркон маълумотлари
│       └── qoqon.json            — Қўқон маълумотлари
```

## 2. Янги туман/шаҳар қўшиш

### А) `app.js` да `REGIONS` массивига қўшиш:

```js
const REGIONS = [
  {
    id: "bukhara",
    name: {uz:"Бухоро вилояти", ru:"...", en:"..."},
    districts: [
      {id:"gijduvon", name:{uz:"Ғиждувон",...}, file:"gijduvon.json", hasData:true},
      ...
    ]
  },
  {
    id: "fergana",
    name: {uz:"Фарғона вилояти", ru:"...", en:"..."},
    districts: [
      {id:"qoqon", name:{uz:"Қўқон",...}, file:"qoqon.json", hasData:true, type:"shahar"},
      // type:"shahar" бўлса "Шаҳрининг", бўлмаса "Туманининг"
    ]
  },
  // ЯНГИ ВИЛОЯТ ШУ ЕРГА ҚЎШИЛАДИ
];
```

### Б) JSON файл яратиш — `assets/data/yangi_tuman.json`:

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

`hero_kpis` — бош саҳифадаги 6 та KPI учун. Ишсизлик/Камбағаллик эса карточкалардан `kpi_count`/`kpi_pct` орқали олинади.

### В) `DISTRICT_LABEL` да янги туман қўшиш (app.js):

```js
Object.defineProperty(DISTRICT_LABEL, 'yangi_tuman', {get:function(){return districtLabel('yangi_tuman');}});
```

## 3. Карточка қўшиш

JSON'даги `indicators` массивига объект қўшилади:

```json
{
  "no": 1,
  "slide": 1,
  "slide_no": "1",
  "name": "Карточка номи",
  "desc": "Қисқа тавсиф",
  "value": "Жами: ... | Кўрсаткич 1: ... | Кўрсаткич 2: ...",
  "found": true,
  "source_org": "stat.uz",
  "ai_insight": "СИ тавсияси матни"
}
```

### Слайдлар:
- 1 — Иқтисодий фаоллик
- 2 — Инфратузилма
- 3 — Аҳоли ва бандлик
- 4 — Маҳалла тадбиркорлиги ва банк
- 5 — Имкониятлар
- 6 — Хулоса ва режа

### Value турлари:
- **Матн** — `"Жами: ... | Факт 1: ... | Факт 2: ..."` → hero_facts карточка
- **Timeseries** — `"2021: 100 | 2022: 120 | 2023: 150 (млрд сўм)"` → чизиқли чарт
- **yearly_credits** — `{"type":"yearly_credits", "years":[...], "values":[...], "total":..., "unit":"млрд сўм"}` → вертикал бар чарт
- **multi_series_forecast** — `{"type":"multi_series_forecast", ...}` → 2+ чизиқли чарт
- **Оддий рақам** — `"68 та"` → single_metric

### Махсус полялар:
- `"no_forecast": true` — чартда прогноз чизиғини ўчиради
- `"kpi_count": 5165, "kpi_pct": 4.5` — Hero KPI да рақам + фоиз кўрсатади
- `"source_org"` — манба (stat.uz, SQB, Хокимият, Марказий банк, Mehnat.uz ва ҳ.к.)

## 4. Нумерация текшириш ва тўғрилаш

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

## 5. Git push

```bash
cd /tmp/sqb-buxoro-dashboard
rsync -a --delete --exclude=.git --exclude=advisor --exclude=.vercel \
  "📦 Эски сайт/🌐 Президент дашборд/" ./
perl -i -pe 's/sk-proj-[A-Za-z0-9_\-]+/REDACTED_OPENAI_KEY/g' "gluon_advisor_uz (1).html"
git add -A
git commit -m "feat: ..."
git push origin main
```

## 6. Деплой (фақат фойдаланувчи айтганда)

```bash
cd /tmp/sqb-buxoro-dashboard
vercel --prod --yes
vercel alias set sqb-dashboard-git-main-u-specters-projects.vercel.app sqb-dashboard.vercel.app
```

## 7. Муҳим маълумотлар

- **GitHub**: https://github.com/u-specter/sqb-buxoro-dashboard
- **Vercel**: https://sqb-dashboard.vercel.app
- **API key REDACT** — push дан олдин `gluon_advisor_uz (1).html` да `sk-proj-...` ўчирилади
- **SSO Protection** ўчирилган — ҳамма кўра олади
- **Бошланғич туман** `STATE` да: `region:"fergana", district:"qoqon"` (app.js)
- **Vercel бепул лимит**: 100 та деплой/кун

## 8. Hero KPI қандай ишлайди

Hero KPI маълумотларни 3 жойдан излайди (кетма-кет):
1. `hero_kpis` — JSON root даражасида (Аҳоли, Маҳалла, Оила, Хонадон)
2. `kpi_data` — карточкалардаги объект (бирлаштирилган карточкалар учун)
3. `kpi_count`/`kpi_pct` — алоҳида полялар (Ишсизлик, Камбағаллик)
4. `namePattern` бўйича карточка номидан излаш
5. `no` рақами бўйича fallback (эски туманлар учун)
