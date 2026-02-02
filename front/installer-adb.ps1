# Script pour installer ADB (Android SDK Platform Tools)
Write-Host "=== Installation d'ADB (Android Debug Bridge) ===" -ForegroundColor Cyan
Write-Host ""

# Vérifier si ADB est déjà installé
$adbPath = Get-Command adb -ErrorAction SilentlyContinue
if ($adbPath) {
    Write-Host "ADB est déjà installé à : $($adbPath.Source)" -ForegroundColor Green
    Write-Host "Version :" -ForegroundColor Yellow
    adb version
    exit 0
}

Write-Host "ADB n'est pas installé. Voici les options :" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1 : Installer Android Studio (Recommandé)" -ForegroundColor Cyan
Write-Host "  - Télécharger depuis : https://developer.android.com/studio" -ForegroundColor White
Write-Host "  - Installer Android Studio" -ForegroundColor White
Write-Host "  - ADB sera installé automatiquement dans :" -ForegroundColor White
Write-Host "    C:\Users\$env:USERNAME\AppData\Local\Android\Sdk\platform-tools" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 2 : Installer uniquement Platform Tools" -ForegroundColor Cyan
Write-Host "  - Télécharger depuis : https://developer.android.com/tools/releases/platform-tools" -ForegroundColor White
Write-Host "  - Extraire dans un dossier (ex: C:\platform-tools)" -ForegroundColor White
Write-Host "  - Ajouter au PATH système" -ForegroundColor White
Write-Host ""
Write-Host "Option 3 : Utiliser Flutter directement (Plus simple)" -ForegroundColor Cyan
Write-Host "  - Exécuter : .\voir-logs-flutter.ps1" -ForegroundColor White
Write-Host "  - Flutter affichera les logs automatiquement" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Voulez-vous ouvrir la page de téléchargement d'Android Studio ? (O/N)"
if ($choice -eq "O" -or $choice -eq "o") {
    Start-Process "https://developer.android.com/studio"
}

Write-Host "`nPour utiliser Flutter directement (sans ADB), exécutez :" -ForegroundColor Green
Write-Host "  .\voir-logs-flutter.ps1" -ForegroundColor Yellow
