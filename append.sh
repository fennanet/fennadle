#!/usr/bin/env bash
set -euo pipefail

FILE="public/daily-words.json"

read -rp "Enter one or more words (space-separated): " input
read -ra words <<< "$input"

last_date=$(jq -r 'keys | max' "$FILE")

for word in "${words[@]}"; do
    word="${word^^}"
    next_date=$(date -d "$last_date + 1 day" +%Y-%m-%d)
    jq --arg d "$next_date" --arg w "$word" '.[$d] = $w' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"
    last_date="$next_date"
    echo "Added: $next_date → $word"
done

echo "Done. Current tail:"
jq -r 'to_entries | sort_by(.key) | .[-3:] | .[] | "\(.key): \(.value)"' "$FILE"

git add "$FILE"
git commit -m "update daily words"
git push