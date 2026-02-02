# Script pour voir les logs Android en temps réel
Write-Host "📱 Vérification de la connexion ADB..." -ForegroundColor Cyan

# Vérifier si ADB est disponible
$adbPath = Get-Command adb -ErrorAction SilentlyContinue
if (-not $adbPath) {
    Write-Host "❌ ADB n'est pas trouvé dans le PATH" -ForegroundColor Red
    Write-Host "💡 Installez Android SDK Platform Tools" -ForegroundColor Yellow
    exit 1
}

# Vérifier si un appareil est connecté
$devices = adb devices
if ($devices -notmatch "device$") {
    Write-Host "❌ Aucun appareil Android connecté" -ForegroundColor Red
    Write-Host "💡 Connectez votre téléphone en USB avec le débogage activé" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Appareil connecté" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Affichage des logs Flutter/FieldTrack..." -ForegroundColor Cyan
Write-Host "💡 Lancez l'application sur votre téléphone pour voir les logs" -ForegroundColor Yellow
Write-Host ""

# Afficher les logs filtrés
adb logcat -c  # Nettoyer les logs
adb logcat | Select-String -Pattern "Flutter|FieldTrack|Error|Exception|Fatal|Dart" -CaseSensitive:$false
