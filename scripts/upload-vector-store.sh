#!/usr/bin/env bash
# Uploads every JSON in assets/openai-data/ to OpenAI Files API,
# creates a vector store, attaches the files, and writes the
# resulting IDs to api/vector-store.json so the chat proxy can use it.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DATA_DIR="$ROOT/assets/openai-data"
OUT_FILE="$ROOT/api/vector-store.json"
ENV_FILE="$ROOT/.env"
STORE_NAME="${VECTOR_STORE_NAME:-sqb-tumanlar-knowledge}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found" >&2
  exit 1
fi

OPENAI_API_KEY="$(grep -E '^OPENAI_API_KEY=' "$ENV_FILE" | head -1 | cut -d= -f2-)"
OPENAI_API_KEY="${OPENAI_API_KEY%\"}"; OPENAI_API_KEY="${OPENAI_API_KEY#\"}"

if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo "ERROR: OPENAI_API_KEY missing from .env" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUT_FILE")"

echo ">> Uploading files from $DATA_DIR ..."
file_ids=()
for f in "$DATA_DIR"/*.json; do
  name="$(basename "$f")"
  echo "   - $name"
  resp="$(curl -sS https://api.openai.com/v1/files \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -F purpose="assistants" \
    -F file="@$f")"
  fid="$(printf '%s' "$resp" | python -c "import sys,json;print(json.load(sys.stdin)['id'])" 2>/dev/null || true)"
  if [[ -z "$fid" ]]; then
    echo "ERROR uploading $name: $resp" >&2
    exit 1
  fi
  file_ids+=("$fid")
done

echo ">> Creating vector store '$STORE_NAME' ..."
vs_resp="$(curl -sS https://api.openai.com/v1/vector_stores \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$STORE_NAME\"}")"
vs_id="$(printf '%s' "$vs_resp" | python -c "import sys,json;print(json.load(sys.stdin)['id'])")"
echo "   vector_store_id = $vs_id"

echo ">> Attaching files via file_batch ..."
ids_json="$(printf '%s\n' "${file_ids[@]}" | python -c "import sys,json;print(json.dumps([l.strip() for l in sys.stdin if l.strip()]))")"
batch_resp="$(curl -sS "https://api.openai.com/v1/vector_stores/$vs_id/file_batches" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"file_ids\":$ids_json}")"
batch_id="$(printf '%s' "$batch_resp" | python -c "import sys,json;print(json.load(sys.stdin)['id'])")"
echo "   batch_id = $batch_id"

echo ">> Waiting for indexing ..."
while :; do
  s="$(curl -sS "https://api.openai.com/v1/vector_stores/$vs_id/file_batches/$batch_id" \
    -H "Authorization: Bearer $OPENAI_API_KEY")"
  status="$(printf '%s' "$s" | python -c "import sys,json;print(json.load(sys.stdin)['status'])")"
  echo "   batch status: $status"
  [[ "$status" == "completed" || "$status" == "failed" || "$status" == "cancelled" ]] && break
  sleep 2
done

python - <<PY > "$OUT_FILE"
import json
print(json.dumps({
    "vector_store_id": "$vs_id",
    "name": "$STORE_NAME",
    "file_ids": $ids_json,
}, indent=2, ensure_ascii=False))
PY

echo ">> Wrote $OUT_FILE"
echo "Done."
