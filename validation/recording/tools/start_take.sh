#!/bin/sh
# Start the gdigrab recorder in the interactive session; return once the output file is being written.
# Usage: start_take.sh <file-name-in-Echoes-recording> <seconds>
NAME="$1"; SECS="$2"
DIR=$HOME/Echoes-recording
rm -f "$DIR/$NAME" "$DIR/$NAME.log"
cat > "$DIR/plan/run-task.ps1" <<EOF
schtasks /Create /TN EchoesRec /TR "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File %USERPROFILE%\\Echoes-recording\\record.ps1 -Seconds $SECS -Out %USERPROFILE%\\Echoes-recording\\$NAME" /SC ONCE /ST 23:59 /IT /RU matth /F | Out-Null
schtasks /Run /TN EchoesRec | Out-Null
EOF
powershell -NoProfile -ExecutionPolicy Bypass -File '%USERPROFILE%\Echoes-recording\plan\run-task.ps1'
i=0; until [ -s "$DIR/$NAME" ] || [ $i -gt 60 ]; do sleep 0.5; i=$((i+1)); done
sleep 1; date +%T.%N | cut -c1-12; ls -l "$DIR/$NAME"
