# Composes docs/hero.png from two real Lens Studio Preview captures.
# No AI image generation: none was available on the build machine (Increment 21).
# Run from the repo root: powershell -ExecutionPolicy Bypass -File docs/make-hero.ps1
Add-Type -AssemblyName System.Drawing
$root = (Get-Location).Path
$W = 1600; $H = 900
$bmp = New-Object System.Drawing.Bitmap $W, $H
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'; $g.InterpolationMode = 'HighQualityBicubic'; $g.TextRenderingHint = 'AntiAliasGridFit'

$slate = [System.Drawing.Color]::FromArgb(255, 28, 35, 40)
$mint  = [System.Drawing.Color]::FromArgb(255, 150, 222, 200)
$soft  = [System.Drawing.Color]::FromArgb(255, 205, 215, 220)
$dim   = [System.Drawing.Color]::FromArgb(255, 140, 155, 162)
$g.Clear($slate)

# Title band
$band = New-Object System.Drawing.Drawing2D.LinearGradientBrush (New-Object System.Drawing.Rectangle 0, 0, $W, 230), ([System.Drawing.Color]::FromArgb(255, 34, 48, 52)), $slate, 90
$g.FillRectangle($band, 0, 0, $W, 230)
$g.FillRectangle((New-Object System.Drawing.SolidBrush $mint), 60, 222, 120, 3)

$fTitle = New-Object System.Drawing.Font 'Segoe UI Light', 72
$fSub   = New-Object System.Drawing.Font 'Segoe UI', 22
$fCap   = New-Object System.Drawing.Font 'Segoe UI', 15
$g.DrawString('E C H O E S', $fTitle, (New-Object System.Drawing.SolidBrush $mint), 52, 38)
$g.DrawString(('Guided virtual brick build  ' + [char]0x00B7 + '  SPECS Lens in Lens Studio Preview'), $fSub, (New-Object System.Drawing.SolidBrush $soft), 62, 160)

function Put($path, $x, $y, $h, $label) {
  $img = [System.Drawing.Image]::FromFile((Join-Path $root $path))
  $w = [int]($h * $img.Width / $img.Height)
  $g.DrawImage($img, $x, $y, $w, $h)
  $g.DrawRectangle((New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 70, 95, 100)), 2), $x, $y, $w, $h)
  $g.DrawString($label, $fCap, (New-Object System.Drawing.SolidBrush $dim), $x, $y + $h + 10)
  $img.Dispose()
  return $w
}
$h = 560; $y = 262
$w1 = Put 'validation/increment-4/captures/a9-01-front-90cm.jpg' 60 $y $h 'Step 1 of 5 - guidance beside the build (Preview capture)'
$x2 = 60 + $w1 + 50
$null = Put 'validation/increment-2/captures/07-run2-completion-5-of-5.jpg' $x2 $y $h 'Complete - 5 of 5 placed, virtual check only (Preview capture)'

$g.Dispose()
New-Item -ItemType Directory -Force (Join-Path $root 'docs') | Out-Null
$bmp.Save((Join-Path $root 'docs/hero.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
"wrote docs/hero.png"
