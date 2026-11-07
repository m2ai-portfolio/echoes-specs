#!/bin/sh
# Usage: extract-leaf-log.sh <lens-studio-log> <byte-offset> <out-file>
# Writes reset markers, LEAF scenario-manager lines (RUNS/PASSED/FAILED and
# errors), lens error/warning lines from [Preview N], and ECHOES lines found
# after <byte-offset>. Source prefixes are stripped.
LOG="$1"; OFF="$2"; OUT="$3"
tail -c +"$((OFF + 1))" "$LOG" \
  | grep -E "Lens has been reset|DefaultLeafScenarioManager|MessageScenarioHandler|^[EWF] .*\[Preview [0-9]+\]|\[Preview [0-9]+\].* ECHOES " \
  | grep -v "Register scenario" \
  | sed -E 's/^([A-Z] [0-9:.]+) .*\] (ECHOES .*)$/\1 \2/; s/^([A-Z] [0-9:.]+) .*(Lens has been reset).*$/\1 \2/; s/^([A-Z] [0-9:.]+) .*Logger.ts:[0-9]+\] (.*)$/\1 LEAF \2/' > "$OUT"
wc -l < "$OUT"
