# Script pour diagnostiquer l'application avec Flutter
# Flutter affichera les logs directement sans besoin d'ADB

Write-Host "=== Diagnostic de l'application ===" -ForegroundColor Cyan
Write-Host ""

# Vérifier que le téléphone est connecté
Write-Host "Vérification des appareils connectés..." -ForegroundColor Yellow
$devices = flutter devices 2>&1
Write-Host $devices

if ($devices -notmatch "mobile") {
    Write-Host "`nERREUR : Aucun téléphone Android détecté !" -ForegroundColor Red
    Write-Host "Assurez-vous que :" -ForegroundColor Yellow
    Write-Host "  1. Votre téléphone est connecté en USB" -ForegroundColor White
    Write-Host "  2. Le débogage USB est activé" -ForegroundColor White
    Write-Host "  3. Vous avez autorisé le débogage sur le téléphone" -ForegroundColor White
    exit 1
}

Write-Host "`nTéléphone détecté !" -ForegroundColor Green
Write-Host ""
Write-Host "Lancement de l'application en mode release avec logs..." -ForegroundColor Cyan
Write-Host "Les erreurs s'afficheront ici en temps réel." -ForegroundColor Yellow
Write-Host "Appuyez sur 'q' puis Entrée pour quitter.`n" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Gray

cd E:\suivi-activite-delegation\front

# Lancer avec Flutter qui affichera tous les logs
flutter run --release
