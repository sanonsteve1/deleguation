# Script pour restaurer workmanager
# Usage: .\restaurer-workmanager.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESTAURATION DE WORKMANAGER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path "pubspec.yaml.backup") {
    Write-Host "Restauration de pubspec.yaml..." -ForegroundColor Yellow
    Copy-Item "pubspec.yaml.backup" "pubspec.yaml" -Force
    Write-Host "✅ pubspec.yaml restauré" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Récupération des dépendances..." -ForegroundColor Yellow
    flutter pub get
    Write-Host "✅ Dépendances récupérées" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "✅ Workmanager restauré avec succès!" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier de sauvegarde introuvable (pubspec.yaml.backup)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Décommentez manuellement workmanager dans pubspec.yaml:" -ForegroundColor Yellow
    Write-Host "   # workmanager: ^0.9.0" -ForegroundColor White
    Write-Host "   workmanager: ^0.9.0" -ForegroundColor White
}
