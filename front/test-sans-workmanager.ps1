# Script pour tester l'APK sans workmanager
# Usage: .\test-sans-workmanager.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST SANS WORKMANAGER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Sauvegarder le pubspec.yaml original
Write-Host "1. Sauvegarde de pubspec.yaml..." -ForegroundColor Yellow
Copy-Item "pubspec.yaml" "pubspec.yaml.backup"
Write-Host "✅ Sauvegarde créée: pubspec.yaml.backup" -ForegroundColor Green
Write-Host ""

# Commenter workmanager dans pubspec.yaml
Write-Host "2. Désactivation de workmanager dans pubspec.yaml..." -ForegroundColor Yellow
$pubspecContent = Get-Content "pubspec.yaml" -Raw
$pubspecContent = $pubspecContent -replace '  workmanager: \^0\.9\.0', '  # workmanager: ^0.9.0  # Désactivé temporairement pour test'
Set-Content "pubspec.yaml" -Value $pubspecContent
Write-Host "✅ workmanager désactivé" -ForegroundColor Green
Write-Host ""

# Récupérer les dépendances
Write-Host "3. Récupération des dépendances..." -ForegroundColor Yellow
flutter pub get
Write-Host "✅ Dépendances récupérées" -ForegroundColor Green
Write-Host ""

# Nettoyer
Write-Host "4. Nettoyage du projet..." -ForegroundColor Yellow
flutter clean
Write-Host "✅ Projet nettoyé" -ForegroundColor Green
Write-Host ""

# Générer l'APK debug universelle
Write-Host "5. Génération de l'APK debug universelle..." -ForegroundColor Yellow
Write-Host "   (Cela peut prendre plusieurs minutes)" -ForegroundColor Gray
flutter build apk --debug --target-platform android-arm,android-arm64,android-x64
Write-Host ""

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ APK générée avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 APK disponible dans:" -ForegroundColor Cyan
    Write-Host "   build/app/outputs/flutter-apk/app-debug.apk" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "   1. Installer l'APK sur votre téléphone" -ForegroundColor White
    Write-Host "   2. Tester si l'application s'ouvre" -ForegroundColor White
    Write-Host "   3. Si ça fonctionne: workmanager était le problème" -ForegroundColor White
    Write-Host "   4. Si ça ne fonctionne pas: le problème vient d'ailleurs" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  Pour restaurer workmanager:" -ForegroundColor Yellow
    Write-Host "   .\restaurer-workmanager.ps1" -ForegroundColor White
} else {
    Write-Host "❌ Erreur lors de la génération de l'APK" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pour restaurer le pubspec.yaml original:" -ForegroundColor Yellow
    Write-Host "   Copy-Item pubspec.yaml.backup pubspec.yaml" -ForegroundColor White
}
