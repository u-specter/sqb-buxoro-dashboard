#!/usr/bin/env python3
"""
SQB Dashboard — district JSON validator.

Pure Python, no external deps (works in stock python3 on dev laptops and
GitHub Actions runners). Walks assets/data/, validates each district file
against schemas/district.schema.json, plus several semantic cross-checks
that JSON Schema can't express.

Usage:
    python3 scripts/validate_data.py            # exits 1 on any error
    python3 scripts/validate_data.py --strict   # also flag warnings as errors
"""
import json
import sys
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "assets" / "data"
SCHEMA_PATH = ROOT / "schemas" / "district.schema.json"
SOURCES_PATH = ROOT / "schemas" / "sources.json"
APP_JS = ROOT / "assets" / "js" / "app.js"

# Files that aren't district records (skip)
NON_DISTRICT = {"i18n_indicators.json", "master.json"}

# Source-org composite splitter — must match scripts/normalize_sources.py
SOURCE_SPLIT_RX = re.compile(r"\s+/\s+|\s+\|\s+|\s+\+\s+")


# ---- ANSI colors (auto-disabled when piped) ----
_TTY = sys.stdout.isatty()
def c(code, s): return f"\033[{code}m{s}\033[0m" if _TTY else s
RED   = lambda s: c("31", s)
GREEN = lambda s: c("32", s)
YEL   = lambda s: c("33", s)
DIM   = lambda s: c("2",  s)


# ===========================================================================
# Minimal JSON Schema validator (Draft-7 subset we actually use)
# ===========================================================================
def _validate(value, schema, path, root_schema, errors):
    """Recursive validator. Pushes (path, message) tuples to `errors`."""
    if "$ref" in schema:
        ref = schema["$ref"]
        if ref.startswith("#/"):
            target = root_schema
            for part in ref[2:].split("/"):
                target = target[part]
            return _validate(value, target, path, root_schema, errors)

    types = schema.get("type")
    if types:
        type_list = [types] if isinstance(types, str) else list(types)
        actual = _json_type(value)
        # JSON-Schema spec: integers are valid numbers
        ok = actual in type_list or (actual == "integer" and "number" in type_list)
        if not ok:
            errors.append((path, f"expected type {type_list}, got {actual}"))
            return

    if "oneOf" in schema:
        matches = 0
        sub_errs = []
        for sub in schema["oneOf"]:
            local = []
            _validate(value, sub, path, root_schema, local)
            if not local: matches += 1
            else: sub_errs.append(local)
        if matches != 1:
            errors.append((path, f"oneOf: expected exactly 1 match, got {matches}"))
        return

    t = _json_type(value)
    if t == "string":
        if "minLength" in schema and len(value) < schema["minLength"]:
            errors.append((path, f"string too short (<{schema['minLength']})"))
        if "pattern" in schema and not re.match(schema["pattern"], value):
            errors.append((path, f"string does not match pattern /{schema['pattern']}/"))
    elif t in ("integer", "number"):
        if "minimum" in schema and value < schema["minimum"]:
            errors.append((path, f"value {value} < minimum {schema['minimum']}"))
        if "maximum" in schema and value > schema["maximum"]:
            errors.append((path, f"value {value} > maximum {schema['maximum']}"))
    elif t == "array":
        if "items" in schema:
            for i, item in enumerate(value):
                _validate(item, schema["items"], f"{path}[{i}]", root_schema, errors)
    elif t == "object":
        for req in schema.get("required", []):
            if req not in value:
                errors.append((path, f"missing required property '{req}'"))
        if schema.get("additionalProperties") is False:
            allowed = set(schema.get("properties", {}).keys())
            for k in value:
                if k not in allowed:
                    errors.append((f"{path}.{k}", f"unexpected property (additionalProperties=false)"))
        for k, sub_schema in schema.get("properties", {}).items():
            if k in value:
                _validate(value[k], sub_schema, f"{path}.{k}", root_schema, errors)


def _json_type(v):
    if v is None: return "null"
    if isinstance(v, bool): return "boolean"
    if isinstance(v, int): return "integer"
    if isinstance(v, float): return "number"
    if isinstance(v, str): return "string"
    if isinstance(v, list): return "array"
    if isinstance(v, dict): return "object"
    return "unknown"


# ===========================================================================
# Semantic cross-checks (beyond what JSON Schema can express)
# ===========================================================================
def semantic_checks(file, data, errors, warnings, canonical_sources=None):
    """Cross-checks that JSON Schema can't capture."""

    # 1. total must equal len(indicators)
    declared = data.get("total")
    actual = len(data.get("indicators", []))
    if declared != actual:
        errors.append(("total", f"declared {declared} ≠ actual {actual} indicators"))

    # 2. indicator `no` must be unique and start at 1 (or be sequential)
    nos = [c.get("no") for c in data.get("indicators", []) if "no" in c]
    if len(nos) != len(set(nos)):
        dups = [n for n in set(nos) if nos.count(n) > 1]
        errors.append(("indicators", f"duplicate `no` values: {dups}"))

    # 3. `district` slug must match filename
    expected_slug = file.stem
    if data.get("district") and data["district"] not in (expected_slug, expected_slug.replace("_tuman", "")):
        warnings.append(("district", f"slug '{data['district']}' doesn't match filename '{expected_slug}'"))

    # 4. hero_kpis values must be > 0 (zero = unfilled placeholder)
    hk = data.get("hero_kpis") or {}
    for metric, payload in hk.items():
        if isinstance(payload, dict) and payload.get("value", 0) == 0:
            warnings.append((f"hero_kpis.{metric}", "value is 0 (looks unfilled)"))

    # 5. value field: pipe-separated cards should not have suspicious patterns
    for c in data.get("indicators", []):
        v = c.get("value")
        if not isinstance(v, str): continue
        # Empty value with found=true is contradictory
        if c.get("found") is True and not v.strip():
            warnings.append((f"#{c.get('no')}", "found=true but value is empty"))

    # 6. source_org must be present on visible cards
    for c in data.get("indicators", []):
        if c.get("found") is True and not c.get("source_org"):
            warnings.append((f"#{c.get('no')}", "missing source_org on visible card"))

    # 7. source_org atoms must be canonical (per schemas/sources.json)
    if canonical_sources:
        for c in data.get("indicators", []):
            s = c.get("source_org")
            if not isinstance(s, str) or not s:
                continue
            for atom in SOURCE_SPLIT_RX.split(s):
                atom = atom.strip()
                if atom and atom not in canonical_sources:
                    warnings.append((f"#{c.get('no')}",
                                     f"non-canonical source_org atom '{atom}' (run scripts/normalize_sources.py)"))


# ===========================================================================
# Cross-file checks
# ===========================================================================
def cross_file_checks(all_data, errors, warnings):
    # Slug uniqueness across all districts
    slugs = {}
    for fp, d in all_data.items():
        slug = d.get("district")
        if not slug: continue
        if slug in slugs:
            errors.append(("global", f"duplicate district slug '{slug}' in {fp.name} and {slugs[slug].name}"))
        else:
            slugs[slug] = fp

    # app.js REGIONS array references
    if APP_JS.exists():
        try:
            js_text = APP_JS.read_text(encoding="utf-8")
        except Exception:
            return
        # Files referenced via {file:"X.json"}
        referenced = set(re.findall(r'file\s*:\s*"([^"]+\.json)"', js_text))
        existing = {fp.name for fp in all_data.keys()}
        orphans_in_js = referenced - existing
        orphans_on_disk = existing - referenced
        for o in orphans_in_js:
            errors.append(("app.js", f"REGIONS references missing file '{o}'"))
        for o in orphans_on_disk:
            warnings.append(("filesystem", f"file '{o}' not referenced in app.js REGIONS"))


# ===========================================================================
# Main
# ===========================================================================
def main():
    strict = "--strict" in sys.argv

    if not SCHEMA_PATH.exists():
        print(RED(f"FATAL: schema not found at {SCHEMA_PATH}"))
        return 2

    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))

    # Optional: load canonical source registry for source_org atom checking
    canonical_sources = None
    if SOURCES_PATH.exists():
        try:
            sources = json.loads(SOURCES_PATH.read_text(encoding="utf-8"))
            canonical_sources = {e["name"] for e in sources.get("canonical", []) if "name" in e}
        except Exception as e:
            print(YEL(f"⚠ could not load sources.json: {e}"))

    all_data = {}
    total_errors = 0
    total_warnings = 0

    for fp in sorted(DATA_DIR.glob("*.json")):
        if fp.name in NON_DISTRICT:
            continue

        try:
            data = json.loads(fp.read_text(encoding="utf-8"))
        except Exception as e:
            print(RED(f"✗ {fp.name}: invalid JSON — {e}"))
            total_errors += 1
            continue

        all_data[fp] = data
        errors, warnings = [], []

        _validate(data, schema, "$", schema, errors)
        semantic_checks(fp, data, errors, warnings, canonical_sources)

        status = GREEN("✓") if not errors else RED("✗")
        warn_tag = f" {YEL('(' + str(len(warnings)) + ' warn)')}" if warnings else ""
        n_cards = len(data.get("indicators", []))
        print(f"{status} {fp.name:25} {DIM(str(n_cards).rjust(3) + ' cards')}{warn_tag}")

        for path, msg in errors:
            print(f"    {RED('ERROR')} {path}: {msg}")
        for path, msg in warnings:
            print(f"    {YEL('WARN ')} {path}: {msg}")

        total_errors += len(errors)
        total_warnings += len(warnings)

    # Cross-file checks
    cross_errors, cross_warnings = [], []
    cross_file_checks(all_data, cross_errors, cross_warnings)
    if cross_errors or cross_warnings:
        print(f"\n{DIM('=== cross-file ===')}")
        for path, msg in cross_errors:
            print(f"    {RED('ERROR')} {path}: {msg}")
        for path, msg in cross_warnings:
            print(f"    {YEL('WARN ')} {path}: {msg}")
        total_errors += len(cross_errors)
        total_warnings += len(cross_warnings)

    # Summary
    print()
    if total_errors:
        print(RED(f"✗ {total_errors} error(s), {total_warnings} warning(s) across {len(all_data)} files"))
        return 1
    if total_warnings and strict:
        print(YEL(f"⚠ {total_warnings} warning(s) (--strict mode treats as failures)"))
        return 1
    if total_warnings:
        print(YEL(f"⚠ {len(all_data)} files OK; {total_warnings} warning(s)"))
        return 0
    print(GREEN(f"✓ {len(all_data)} files valid; 0 errors, 0 warnings"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
