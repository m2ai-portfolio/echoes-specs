# Recorder used for the Increment 18 take. Region = Preview render area measured from a probe frame.
param([int]$Seconds = 5, [string]$Out = "$env:USERPROFILE\Echoes-recording\test5s.mp4")
$log = "$Out.log"
$p = Get-Process "Lens Studio" | Where-Object { $_.MainWindowTitle -like "*Lens Studio*" } | Select-Object -First 1
$h = $p.MainWindowHandle
"start $(Get-Date -Format HH:mm:ss.fff) hwnd=$h title=$($p.MainWindowTitle)" | Out-File $log -Encoding ascii
& $env:USERPROFILE\tools\ffmpeg\bin\ffmpeg.exe -y -hide_banner -f gdigrab -framerate 30 -draw_mouse 0 -offset_x 1914 -offset_y 123 -video_size 1520x1192 -i "hwnd=$h" -t $Seconds -an -c:v libx264 -preset veryfast -crf 16 -pix_fmt yuv420p -movflags +faststart $Out 2>&1 | Out-File $log -Append -Encoding ascii
"end $(Get-Date -Format HH:mm:ss.fff) exit=$LASTEXITCODE" | Out-File $log -Append -Encoding ascii
