#!/usr/bin/env python3
"""
SQB Dashboard — source organization normalizer.

Loads schemas/sources.json (canonical names + alias map) and rewrites
source_org strings across all assets/data/*.json files. Supports:

* Atomic alias replacement (e.g. "Хокимият" → "Ҳокимият") inside
  composite source strings like "SQB / Хокимият / Марказий банк".
* Whole-string aliases for legacy names like "Халқ таълими".

Usage:
    python3 scripts/normalize_sources.py --dry-run     # preview only
    python3 scripts/normalize_sources.py               # apply changes
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "assets" / "data"
SOURCES_PATH = ROOT / "schemas" / "sources.json"
NON_DISTRICT = {"i18n_indicators.json", "master.json"}

# Splitters that separate atomic sources inside a composite string.
# We require spaces around '/' so that abbreviations like "Қ/х" remain intact.
SPLIT_RX = re.compile(r"\s+/\s+|\s+\|\s+|\s+\+\s+")


def normalize_source(raw, aliases):
    """Apply alias map to a composite source_org string atom-by-atom."""
    if not raw or not isinstance(raw, str):
        return raw
    # 1) Whole-string alias takes priority
    if raw in aliases:
        return aliases[raw]
    # 2) Split into atoms, normalize each, rejoin with " / "
    atoms = SPLIT_RX.split(raw)
    if len(atoms) == 1:
        return aliases.get(raw, raw)
    new_atoms = [aliases.get(a.strip(), a.strip()) for a in atoms]
    return " / ".join(new_atoms)


def main():
    dry = "--dry-run" in sys.argv

    sources = json.loads(SOURCES_PATH.read_text(encoding="utf-8"))
    aliases = sources.get("aliases", {})
    aliases = {k: v for k, v in aliases.items() if not k.startswith("$")}
    canonical_names = {entry["name"] for entry in sources.get("canonical", [])}

    total_changes = 0
    files_touched = 0
    unknown_sources = {}  # name → count

    for fp in sorted(DATA_DIR.glob("*.json")):
        if fp.name in NON_DISTRICT:
            continue
        data = json.loads(fp.read_text(encoding="utf-8"))
        changes = []
        for ind in data.get("indicators", []):
            old = ind.get("source_org")
            if not old:
                continue
            new = normalize_source(old, aliases)
            if new != old:
                changes.append((ind.get("no"), old, new))
                ind["source_org"] = new
            # Track unknown atoms (post-normalization)
            for atom in SPLIT_RX.split(ind.get("source_org") or ""):
                atom = atom.strip()
                if atom and atom not in canonical_names:
                    unknown_sources[atom] = unknown_sources.get(atom, 0) + 1

        if changes:
            files_touched += 1
            total_changes += len(changes)
            print(f"  {fp.name}  ({len(changes)} change{'s' if len(changes) != 1 else ''})")
            for no, old, new in changes:
                print(f"    #{no}: '{old}' → '{new}'")
            if not dry:
                fp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    print()
    if dry:
        print(f"DRY-RUN: {total_changes} change(s) across {files_touched} file(s)")
    else:
        print(f"APPLIED: {total_changes} change(s) across {files_touched} file(s)")

    if unknown_sources:
        print()
        print(f"Unknown sources ({len(unknown_sources)} distinct, not in schemas/sources.json):")
        for name, n in sorted(unknown_sources.items(), key=lambda kv: -kv[1])[:25]:
            print(f"  {n:3} | {name}")
        if len(unknown_sources) > 25:
            print(f"  ... and {len(unknown_sources) - 25} more")
        print()
        print("→ Add them to schemas/sources.json `canonical` array (as new entries)")
        print("  or to `aliases` (if they're typos / legacy names of existing canonicals).")

    return 0


if __name__ == "__main__":
    sys.exit(main())
