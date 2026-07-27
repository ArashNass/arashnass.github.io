#!/usr/bin/env bash
# Push URLs to IndexNow (Bing, Yandex, Seznam, Naver, Yep) in one request.
#
# Setup, once:
#   1. Generate a key in Bing Webmaster Tools -> IndexNow
#   2. Save it below as KEY
#   3. Commit <KEY>.txt to your repo root, containing only the key
#
# Usage:
#   ./indexnow.sh                          # submit every page in the sitemap
#   ./indexnow.sh /design-spectrum/        # submit just one or more paths

set -euo pipefail

KEY="216bbb09bce249e1b48dd3d2826a7836"
HOST="arashnassirpour.com"

if [ "$KEY" = "PASTE_YOUR_32_CHAR_KEY_HERE" ]; then
  echo "Edit this script and set KEY first." >&2
  exit 1
fi

# All indexable pages. Keep in sync with sitemap.xml.
ALL_PATHS=(
  "/"
  "/earthquake-rupture/"
  "/world-faults/"
  "/earthquake-dashboard/"
  "/hazus/"
  "/hazard-sequence-simulator/"
  "/slope-seismic-vulnerability/"
  "/rc-section-designer/"
  "/modal-analysis/"
  "/design-spectrum/"
  "/performance-point-evaluator/"
  "/ground-motion/"
  "/building-response/"
  "/material-behaviour-explorer/"
  "/about/"
  "/contact/"
)

if [ "$#" -gt 0 ]; then
  PATHS=("$@")
else
  PATHS=("${ALL_PATHS[@]}")
fi

# Build the JSON url list
URLS=""
for p in "${PATHS[@]}"; do
  [ -n "$URLS" ] && URLS="$URLS,"
  URLS="$URLS\"https://$HOST$p\""
done

PAYLOAD=$(cat <<JSON
{
  "host": "$HOST",
  "key": "$KEY",
  "keyLocation": "https://$HOST/$KEY.txt",
  "urlList": [$URLS]
}
JSON
)

echo "Submitting ${#PATHS[@]} URL(s) to IndexNow..."

CODE=$(curl -s -o /tmp/indexnow_body -w "%{http_code}" \
  -X POST "https://api.indexnow.org/IndexNow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$PAYLOAD")

case "$CODE" in
  200) echo "200 OK - accepted." ;;
  202) echo "202 Accepted - received, key validation pending." ;;
  400) echo "400 - bad request, check the JSON." ;;
  403) echo "403 - key not valid. Is https://$HOST/$KEY.txt live and does it contain exactly the key?" ;;
  422) echo "422 - URLs do not belong to the host, or the key does not match." ;;
  429) echo "429 - too many requests, slow down." ;;
  *)   echo "Unexpected response: $CODE" ;;
esac

[ -s /tmp/indexnow_body ] && cat /tmp/indexnow_body
echo
