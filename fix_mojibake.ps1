$ErrorActionPreference = "Stop"
$path = "D:\RAHAL"
$bk = "$path\_backups\fix_mojibake_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $bk -Force | Out-Null
Copy-Item "$path\src\App.jsx" -Destination $bk
Write-Host "BACKUP_OK: $bk"

$f = "$path\src\App.jsx"
$c = Get-Content $f -Raw

$c = $c.Replace('aria-label="ÙƒØªÙ…"', 'aria-label="\u0643\u062A\u0645"')
$c = $c.Replace('aria-label="Ø¥ÙŠÙ‚Ø§Ù"', 'aria-label="\u0625\u064A\u0642\u0627\u0641"')
$c = $c.Replace('>ÙƒÙ…/Ø³<', '>{''\u0643\u0645/\u0633''}<')
$c = $c.Replace('aria-label="Ø¥Ø¨Ù„Ø§Øº"', 'aria-label="\u0625\u0628\u0644\u0627\u063A"')
$c = $c.Replace('>Ø±Ø¬ÙˆØ¹ Ù„Ù„Ù…Ù„Ø§ØØ©</button>', '>{''\u0631\u062C\u0648\u0639 \u0644\u0644\u0645\u0644\u0627\u062D\u0629''}</button>')

Set-Content $f -Value $c -Encoding UTF8
Write-Host "MOJIBAKE_FIXED"

Write-Host "--- REMAINING MOJIBAKE ---"
$left = Select-String -Path $f -Pattern "Ø|Ù" -Encoding UTF8
if ($left) { $left | Select-Object LineNumber | Format-Table -AutoSize } else { Write-Host "CLEAN" }

Write-Host "--- UNICODE STRINGS FOUND ---"
(Select-String -Path $f -Pattern "\\u0643\\u062A\\u0645|\\u0625\\u064A\\u0642\\u0627\\u0641|\\u0625\\u0628\\u0644\\u0627\\u063A|\\u0631\\u062C\\u0648\\u0639").Count

Write-Host "--- LINT ---"
npm --prefix 'D:\RAHAL' run lint
Write-Host "--- BUILD ---"
npm --prefix 'D:\RAHAL' run build
