#!/bin/sh
# Usage: extract-echoes-log.sh <lens-studio-log> <byte-offset> <out-file> [from-time HH:MM:SS] [to-time HH:MM:SS]
# Writes reset markers and ECHOES lines (source prefixes stripped) found after
# <byte-offset>, optionally limited to a wall-clock window.
LOG="$1"; OFF="$2"; OUT="$3"; FROM="${4:-00:00:00}"; TO="${5:-99:99:99}"
tail -c +"$((OFF + 1))" "$LOG" \
  | grep -E "Lens has been reset|\[Preview [0-9]+\].* ECHOES " \
  | sed -E 's/^([A-Z] [0-9:.]+) .* (ECHOES .*)$/\1 \2/; s/^([A-Z] [0-9:.]+) .*(Lens has been reset).*$/\1 \2/' \
  | awk -v f="$FROM" -v t="$TO" '{ if ($2 >= f && $2 <= t) print }' > "$OUT"
wc -l < "$OUT"
