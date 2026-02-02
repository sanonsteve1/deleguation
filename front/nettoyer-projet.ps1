# Script PowerShell pour nettoyer completement le projet Flutter
# Utilisez ce script si vous rencontrez des erreurs de compilation

Write-Host "Nettoyage du projet Flutter..." -ForegroundColor Yellow

# Aller dans le dossier front
Set-Location $PSScriptRoot

# Nettoyer Flutter
Write-Host ""
Write-Host "1. Nettoyage Flutter..." -ForegroundColor Cyan
flutter clean

# Arreter tous les daemons Gradle
Write-Host ""
Write-Host "2. Arret des daemons Gradle..." -ForegroundColor Cyan
Set-Location android
if (Test-Path "gradlew.bat") {
    .\gradlew.bat --stop 2>$null
}
Set-Location ..

# Supprimer les dossiers de build et cache
Write-Host ""
Write-Host "3. Suppression des dossiers de build..." -ForegroundColor Cyan
$foldersToRemove = @(".dart_tool", "build", "android\.gradle", "android\build", "android\app\build")

foreach ($folder in $foldersToRemove) {
    if (Test-Path $folder) {
        Write-Host "  Suppression de $folder..." -ForegroundColor Gray
        Remove-Item -Recurse -Force $folder -ErrorAction SilentlyContinue
    }
}

# Reinstaller les dependances
Write-Host ""
Write-Host "4. Reinstallation des dependances..." -ForegroundColor Cyan
flutter pub get

Write-Host ""
Write-Host "Nettoyage termine !" -ForegroundColor Green
Write-Host ""
Write-Host "Vous pouvez maintenant essayer de generer l'APK avec :" -ForegroundColor Yellow
Write-Host "  flutter build apk --release" -ForegroundColor White
