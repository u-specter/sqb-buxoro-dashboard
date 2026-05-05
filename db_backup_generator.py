#!/usr/bin/env python3
"""SQB Dashboard — PostgreSQL backup generator (DDL + data + audit cols + comments)."""
import json
from pathlib import Path

DATA_DIR = Path("assets/data")
OUTPUT = Path("sqb_dashboard_backup.sql")

# All rows in this batch share the same audit metadata.
LOAD_NO     = 1                         # batch identifier — first load of the dataset
FINAL_FLAG  = True                      # data for this load is final
DATE_MODIFY = "2026-04-28 12:00:00+05"  # taken from our working session timestamp


# Reflects REGIONS array from assets/js/app.js
REGIONS = [
    {"slug": "bukhara", "uz": "Бухоро вилояти", "ru": "Бухарская область", "en": "Bukhara Region",
     "districts": [
         {"slug": "gijduvon", "uz": "Ғиждувон", "ru": "Гиждуван", "en": "Gijduvon", "file": "gijduvon.json", "has_data": True, "type": None},
         {"slug": "shofirkon", "uz": "Шофиркон", "ru": "Шафиркан", "en": "Shofirkon", "file": "shofirkon.json", "has_data": True, "type": None},
     ]},
    {"slug": "fergana", "uz": "Фарғона вилояти", "ru": "Ферганская область", "en": "Fergana Region",
     "districts": [
         {"slug": "qoqon", "uz": "Қўқон", "ru": "Коканд", "en": "Kokand", "file": "qoqon.json", "has_data": True, "type": "shahar"},
         {"slug": "qoshtepa", "uz": "Қўштепа", "ru": "Куштепа", "en": "Qoshtepa", "file": "qoshtepa.json", "has_data": True, "type": None},
     ]},
    {"slug": "surkhandarya", "uz": "Сурхондарё вилояти", "ru": "Сурхандарьинская область", "en": "Surkhandarya Region",
     "districts": [
         {"slug": "surkhandarya_vil", "uz": "Сурхондарё вилояти", "ru": "Сурхандарьинская область", "en": "Surkhandarya Region", "file": "boysun.json", "has_data": True, "type": "viloyat"},
         {"slug": "boysun", "uz": "Бойсун", "ru": "Байсун", "en": "Boysun", "file": "boysun_tuman.json", "has_data": True, "type": None},
         {"slug": "sariosiyo", "uz": "Сариосиё", "ru": "Сариасия", "en": "Sariosiyo", "file": "sariosiyo.json", "has_data": True, "type": None},
         {"slug": "termiz", "uz": "Термиз", "ru": "Термез", "en": "Termez", "file": "termiz.json", "has_data": True, "type": None},
     ]},
    {"slug": "karakalpakstan", "uz": "Қорақалпоғистон Республикаси", "ru": "Республика Каракалпакстан", "en": "Republic of Karakalpakstan",
     "districts": [
         {"slug": "karakalpakstan_resp", "uz": "Қорақалпоғистон Республикаси", "ru": "Республика Каракалпакстан", "en": "Republic of Karakalpakstan", "file": "karakalpakstan.json", "has_data": True, "type": "respublika"},
         {"slug": "qongirot", "uz": "Қўнғирот", "ru": "Кунград", "en": "Qongirot", "file": "qongirot.json", "has_data": True, "type": None},
         {"slug": "qonlikol", "uz": "Қонлиқўл", "ru": "Канлыкуль", "en": "Qonlikol", "file": "qonlikol.json", "has_data": True, "type": None},
         {"slug": "toxiatosh", "uz": "Тахиатош", "ru": "Тахиаташ", "en": "Taxiatosh", "file": "toxiatosh.json", "has_data": False, "type": None},
     ]},
    {"slug": "sirdaryo", "uz": "Сирдарё вилояти", "ru": "Сырдарьинская область", "en": "Syrdarya Region",
     "districts": [
         {"slug": "guliston", "uz": "Гулистон", "ru": "Гулистан", "en": "Guliston", "file": "guliston.json", "has_data": True, "type": None},
     ]},
    {"slug": "tashkent", "uz": "Тошкент шаҳри", "ru": "Город Ташкент", "en": "Tashkent City",
     "districts": [
         {"slug": "mirzoulgbek", "uz": "Мирзо Улуғбек", "ru": "Мирзо-Улугбек", "en": "Mirzo Ulugbek", "file": "mirzoulgbek.json", "has_data": True, "type": None},
         {"slug": "uchtepa", "uz": "Учтепа", "ru": "Учтепа", "en": "Uchtepa", "file": "uchtepa.json", "has_data": True, "type": None},
     ]},
    {"slug": "andijan", "uz": "Андижон вилояти", "ru": "Андижанская область", "en": "Andijan Region",
     "districts": [
         {"slug": "xonobod", "uz": "Хонобод", "ru": "Ханабад", "en": "Xonobod", "file": "xonobod.json", "has_data": True, "type": "shahar"},
         {"slug": "andijan_vil", "uz": "Андижон вилояти", "ru": "Андижанская область", "en": "Andijan Region", "file": "andijan.json", "has_data": False, "type": "viloyat"},
         {"slug": "shahrixon", "uz": "Шаҳрихон", "ru": "Шахрихан", "en": "Shahrixon", "file": "shahrixon.json", "has_data": True, "type": None},
     ]},
    {"slug": "namangan", "uz": "Наманган вилояти", "ru": "Наманганская область", "en": "Namangan Region",
     "districts": [
         {"slug": "yangiqorgon", "uz": "Янгиқўрғон", "ru": "Янгикурган", "en": "Yangiqorgon", "file": "yangiqorgon.json", "has_data": True, "type": None},
     ]},
    {"slug": "jizzax", "uz": "Жиззах вилояти", "ru": "Джизакская область", "en": "Jizzakh Region",
     "districts": [
         {"slug": "forish", "uz": "Фориш", "ru": "Фариш", "en": "Forish", "file": "forish.json", "has_data": True, "type": None},
     ]},
    {"slug": "samarqand", "uz": "Самарқанд вилояти", "ru": "Самаркандская область", "en": "Samarkand Region",
     "districts": [
         {"slug": "payariq", "uz": "Пайариқ", "ru": "Пайарык", "en": "Payariq", "file": "payariq.json", "has_data": True, "type": None},
     ]},
    {"slug": "navoiy", "uz": "Навоий вилояти", "ru": "Навоийская область", "en": "Navoiy Region",
     "districts": [
         {"slug": "karmana", "uz": "Кармана", "ru": "Кармана", "en": "Karmana", "file": "karmana.json", "has_data": True, "type": None},
     ]},
]


def q(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"


def num(v):
    if v is None or v == "":
        return "NULL"
    try:
        return str(float(v)) if "." in str(v) else str(int(v))
    except (ValueError, TypeError):
        return "NULL"


def boolsql(v):
    return "TRUE" if v else "FALSE"


# Audit suffix appended to every INSERT — keeps the columns in one place.
AUDIT_COLS  = "load_no, final_flag, date_modify"
AUDIT_VALS  = f"{LOAD_NO}, {boolsql(FINAL_FLAG)}, '{DATE_MODIFY}'::TIMESTAMPTZ"


def main():
    lines = []
    out = lines.append

    out("-- ============================================================")
    out("-- SQB Президент дашборди — PostgreSQL backup")
    out("-- Generated from JSON data files in assets/data/")
    out("-- Encoding: UTF-8 | Schema: public")
    out(f"-- Batch: load_no={LOAD_NO} | final_flag={FINAL_FLAG} | date_modify={DATE_MODIFY}")
    out("-- ============================================================")
    out("")
    out("BEGIN;")
    out("")
    out("-- DROP existing schema (clean slate)")
    out("DROP TABLE IF EXISTS indicators CASCADE;")
    out("DROP TABLE IF EXISTS hero_kpis CASCADE;")
    out("DROP TABLE IF EXISTS districts CASCADE;")
    out("DROP TABLE IF EXISTS regions CASCADE;")
    out("")

    # ============================================================
    # DDL
    # ============================================================
    out("-- ============================================================")
    out("-- DDL: Schema definition")
    out("-- ============================================================")
    out("")

    # ---------- regions ----------
    out("""CREATE TABLE regions (
    region_id   INT         PRIMARY KEY,
    slug        VARCHAR(64) UNIQUE NOT NULL,
    name_uz     TEXT        NOT NULL,
    name_ru     TEXT,
    name_en     TEXT,
    sort_order  INT         DEFAULT 0,
    load_no     INT         NOT NULL DEFAULT 1,
    final_flag  BOOLEAN     NOT NULL DEFAULT TRUE,
    date_modify TIMESTAMPTZ NOT NULL DEFAULT NOW()
);""")
    out("CREATE INDEX idx_regions_slug ON regions(slug);")
    out("CREATE INDEX idx_regions_load ON regions(load_no);")
    out("")
    out("COMMENT ON TABLE  regions             IS 'Top-level administrative regions of Uzbekistan covered by the SQB dashboard';")
    out("COMMENT ON COLUMN regions.region_id   IS 'Surrogate primary key for the region';")
    out("COMMENT ON COLUMN regions.slug        IS 'URL-safe unique identifier (e.g. bukhara, fergana) used in app.js';")
    out("COMMENT ON COLUMN regions.name_uz     IS 'Region name in Uzbek (Cyrillic) — primary display language';")
    out("COMMENT ON COLUMN regions.name_ru     IS 'Region name in Russian';")
    out("COMMENT ON COLUMN regions.name_en     IS 'Region name in English';")
    out("COMMENT ON COLUMN regions.sort_order  IS 'Display order in the landing page region grid (alphabetical by Uzbek name)';")
    out("COMMENT ON COLUMN regions.load_no     IS 'Batch / load number this row arrived in. 1 = initial dataset migration from JSON';")
    out("COMMENT ON COLUMN regions.final_flag  IS 'TRUE when load is closed and data is considered final';")
    out("COMMENT ON COLUMN regions.date_modify IS 'Timestamp of the most recent modification (defaults to NOW() on insert/update)';")
    out("")

    # ---------- districts ----------
    out("""CREATE TABLE districts (
    district_id   INT         PRIMARY KEY,
    region_id     INT         NOT NULL REFERENCES regions(region_id) ON DELETE CASCADE ON UPDATE CASCADE,
    slug          VARCHAR(64) UNIQUE NOT NULL,
    name_uz       TEXT        NOT NULL,
    name_ru       TEXT,
    name_en       TEXT,
    district_name TEXT,
    json_file     VARCHAR(128),
    has_data      BOOLEAN     NOT NULL DEFAULT FALSE,
    type          VARCHAR(32),
    year          INT,
    total_cards   INT         NOT NULL DEFAULT 0,
    load_no       INT         NOT NULL DEFAULT 1,
    final_flag    BOOLEAN     NOT NULL DEFAULT TRUE,
    date_modify   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);""")
    out("CREATE INDEX idx_districts_region ON districts(region_id);")
    out("CREATE INDEX idx_districts_slug   ON districts(slug);")
    out("CREATE INDEX idx_districts_load   ON districts(load_no);")
    out("")
    out("COMMENT ON TABLE  districts               IS 'Districts (tuman), cities (shahar) and republic-level entities under each region';")
    out("COMMENT ON COLUMN districts.district_id   IS 'Surrogate primary key for the district';")
    out("COMMENT ON COLUMN districts.region_id     IS 'FK -> regions.region_id; cascades on delete/update';")
    out("COMMENT ON COLUMN districts.slug          IS 'URL-safe unique identifier used in app.js (e.g. termiz, shahrixon)';")
    out("COMMENT ON COLUMN districts.name_uz       IS 'District display name in Uzbek (Cyrillic)';")
    out("COMMENT ON COLUMN districts.name_ru       IS 'District display name in Russian';")
    out("COMMENT ON COLUMN districts.name_en       IS 'District display name in English';")
    out("COMMENT ON COLUMN districts.district_name IS 'Full official name from the source JSON (e.g. \"Бойсун тумани\")';")
    out("COMMENT ON COLUMN districts.json_file     IS 'Source JSON file under assets/data/';")
    out("COMMENT ON COLUMN districts.has_data      IS 'TRUE if the district has populated indicators (visible to end users)';")
    out("COMMENT ON COLUMN districts.type          IS 'Administrative type: shahar (city), viloyat (region-level), respublika (republic), NULL = ordinary tuman';")
    out("COMMENT ON COLUMN districts.year          IS 'Reporting year of the JSON snapshot';")
    out("COMMENT ON COLUMN districts.total_cards   IS 'Number of indicator cards loaded for this district';")
    out("COMMENT ON COLUMN districts.load_no       IS 'Batch / load number';")
    out("COMMENT ON COLUMN districts.final_flag    IS 'TRUE when load is final';")
    out("COMMENT ON COLUMN districts.date_modify   IS 'Timestamp of the most recent modification';")
    out("")

    # ---------- hero_kpis ----------
    out("""CREATE TABLE hero_kpis (
    hero_kpi_id  INT         PRIMARY KEY,
    district_id  INT         NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE ON UPDATE CASCADE,
    metric_name  VARCHAR(64) NOT NULL,
    metric_value NUMERIC(14, 2),
    metric_unit  VARCHAR(32),
    load_no      INT         NOT NULL DEFAULT 1,
    final_flag   BOOLEAN     NOT NULL DEFAULT TRUE,
    date_modify  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (district_id, metric_name)
);""")
    out("CREATE INDEX idx_hero_kpis_district ON hero_kpis(district_id);")
    out("CREATE INDEX idx_hero_kpis_load     ON hero_kpis(load_no);")
    out("")
    out("COMMENT ON TABLE  hero_kpis              IS 'Hero KPI metrics shown on the landing tile of each district (population, mahallas, families, households)';")
    out("COMMENT ON COLUMN hero_kpis.hero_kpi_id  IS 'Surrogate primary key';")
    out("COMMENT ON COLUMN hero_kpis.district_id  IS 'FK -> districts.district_id; cascades on delete/update';")
    out("COMMENT ON COLUMN hero_kpis.metric_name  IS 'Metric label in Uzbek: Аҳоли, Маҳалла, Оила, Хонадон';")
    out("COMMENT ON COLUMN hero_kpis.metric_value IS 'Numeric value of the metric';")
    out("COMMENT ON COLUMN hero_kpis.metric_unit  IS 'Unit of measurement (e.g. \"минг киши\", \"та\")';")
    out("COMMENT ON COLUMN hero_kpis.load_no      IS 'Batch / load number';")
    out("COMMENT ON COLUMN hero_kpis.final_flag   IS 'TRUE when load is final';")
    out("COMMENT ON COLUMN hero_kpis.date_modify  IS 'Timestamp of the most recent modification';")
    out("")

    # ---------- indicators ----------
    out("""CREATE TABLE indicators (
    indicator_id  INT         PRIMARY KEY,
    district_id   INT         NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE ON UPDATE CASCADE,
    no            INT         NOT NULL,
    slide         INT         NOT NULL,
    slide_no      VARCHAR(8),
    name          TEXT        NOT NULL,
    description   TEXT,
    value         TEXT,
    found         BOOLEAN     NOT NULL DEFAULT TRUE,
    source_org    TEXT,
    ai_insight    TEXT,
    kpi_count     NUMERIC(14, 2),
    kpi_pct       NUMERIC(6, 2),
    load_no       INT         NOT NULL DEFAULT 1,
    final_flag    BOOLEAN     NOT NULL DEFAULT TRUE,
    date_modify   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (district_id, no)
);""")
    out("CREATE INDEX idx_indicators_district ON indicators(district_id);")
    out("CREATE INDEX idx_indicators_slide    ON indicators(district_id, slide);")
    out("CREATE INDEX idx_indicators_load     ON indicators(load_no);")
    out("")
    out("COMMENT ON TABLE  indicators              IS 'Card-level economic / social indicators displayed across the 6 dashboard slides for each district';")
    out("COMMENT ON COLUMN indicators.indicator_id IS 'Surrogate primary key';")
    out("COMMENT ON COLUMN indicators.district_id  IS 'FK -> districts.district_id; cascades on delete/update';")
    out("COMMENT ON COLUMN indicators.no           IS 'Card number within the district (1..N), unique per district';")
    out("COMMENT ON COLUMN indicators.slide        IS 'Slide section: 1=Iqtisodiy faollik, 2=Infratuzilma, 3=Aholi va bandlik, 4=Mahalla tadbirkorligi va bank, 5=Imkoniyatlar, 6=Xulosa va reja';")
    out("COMMENT ON COLUMN indicators.slide_no     IS 'String form of slide number, kept for compatibility with the front-end JSON';")
    out("COMMENT ON COLUMN indicators.name         IS 'Card title (e.g. \"Ишсизлик кўрсаткичлари\")';")
    out("COMMENT ON COLUMN indicators.description  IS 'Short description / subtitle shown under the title';")
    out("COMMENT ON COLUMN indicators.value        IS 'Pipe-separated raw facts string parsed by app.js (e.g. \"Жами: ... | 2021: ... | 2025: ...\")';")
    out("COMMENT ON COLUMN indicators.found        IS 'TRUE if data is available; FALSE shows \"Маълумот мавжуд эмас\" (data not yet collected)';")
    out("COMMENT ON COLUMN indicators.source_org   IS 'Source organization (e.g. \"Бандлик бошқармаси\", \"Марказий банк\")';")
    out("COMMENT ON COLUMN indicators.ai_insight   IS 'AI-generated recommendation shown in the \"СИ ТАВСИЯСИ\" panel';")
    out("COMMENT ON COLUMN indicators.kpi_count    IS 'Numeric KPI shown on landing hero (e.g. number of unemployed). Only set on cards mapped to landing KPIs';")
    out("COMMENT ON COLUMN indicators.kpi_pct      IS 'Percentage shown next to kpi_count (e.g. unemployment rate)';")
    out("COMMENT ON COLUMN indicators.load_no      IS 'Batch / load number';")
    out("COMMENT ON COLUMN indicators.final_flag   IS 'TRUE when load is final';")
    out("COMMENT ON COLUMN indicators.date_modify  IS 'Timestamp of the most recent modification';")
    out("")

    # ============================================================
    # DATA
    # ============================================================
    out("-- ============================================================")
    out("-- DATA")
    out("-- ============================================================")
    out("")

    # regions
    out("-- regions")
    for i, r in enumerate(REGIONS, 1):
        out(f"INSERT INTO regions (region_id, slug, name_uz, name_ru, name_en, sort_order, {AUDIT_COLS}) "
            f"VALUES ({i}, {q(r['slug'])}, {q(r['uz'])}, {q(r['ru'])}, {q(r['en'])}, {i}, {AUDIT_VALS});")
    out("")

    # districts + hero_kpis + indicators
    district_id = 0
    indicator_id = 0
    hero_kpi_id = 0

    for region_idx, r in enumerate(REGIONS, 1):
        out(f"-- districts for region: {r['slug']}")
        for d in r["districts"]:
            district_id += 1
            slug = d["slug"]
            file_name = d["file"]

            json_path = DATA_DIR / file_name
            data = {}
            if json_path.exists() and d["has_data"]:
                try:
                    data = json.loads(json_path.read_text(encoding="utf-8"))
                except Exception as e:
                    print(f"  ! cannot parse {file_name}: {e}")

            district_name = data.get("district_name", "")
            year = data.get("year")
            total = data.get("total", 0)

            out(f"INSERT INTO districts (district_id, region_id, slug, name_uz, name_ru, name_en, "
                f"district_name, json_file, has_data, type, year, total_cards, {AUDIT_COLS}) VALUES "
                f"({district_id}, {region_idx}, {q(slug)}, {q(d['uz'])}, {q(d['ru'])}, {q(d['en'])}, "
                f"{q(district_name)}, {q(file_name)}, {boolsql(d['has_data'])}, "
                f"{q(d['type'])}, {num(year)}, {num(total)}, {AUDIT_VALS});")

            for metric_name, kpi in (data.get("hero_kpis") or {}).items():
                hero_kpi_id += 1
                out(f"INSERT INTO hero_kpis (hero_kpi_id, district_id, metric_name, metric_value, metric_unit, {AUDIT_COLS}) "
                    f"VALUES ({hero_kpi_id}, {district_id}, {q(metric_name)}, "
                    f"{num(kpi.get('value'))}, {q(kpi.get('unit'))}, {AUDIT_VALS});")

            for ind in data.get("indicators", []):
                indicator_id += 1
                out(f"INSERT INTO indicators (indicator_id, district_id, no, slide, slide_no, name, "
                    f"description, value, found, source_org, ai_insight, kpi_count, kpi_pct, {AUDIT_COLS}) VALUES "
                    f"({indicator_id}, {district_id}, "
                    f"{num(ind.get('no'))}, {num(ind.get('slide'))}, "
                    f"{q(ind.get('slide_no'))}, {q(ind.get('name'))}, "
                    f"{q(ind.get('desc'))}, {q(ind.get('value'))}, "
                    f"{boolsql(ind.get('found', True))}, "
                    f"{q(ind.get('source_org', ind.get('source')))}, "
                    f"{q(ind.get('ai_insight'))}, "
                    f"{num(ind.get('kpi_count'))}, {num(ind.get('kpi_pct'))}, {AUDIT_VALS});")

        out("")

    out("COMMIT;")
    out("")
    out(f"-- Backup complete: {len(REGIONS)} regions, {district_id} districts, "
        f"{hero_kpi_id} hero_kpis, {indicator_id} indicators")
    out(f"-- Audit: load_no={LOAD_NO}, final_flag={FINAL_FLAG}, date_modify={DATE_MODIFY}")

    OUTPUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"\n✅ Backup written: {OUTPUT}")
    print(f"   Regions:    {len(REGIONS)}")
    print(f"   Districts:  {district_id}")
    print(f"   Hero KPIs:  {hero_kpi_id}")
    print(f"   Indicators: {indicator_id}")
    print(f"   File size:  {OUTPUT.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
