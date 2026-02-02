# Script pour voir les logs Flutter directement
# Alternative à adb logcat si ADB n'est pas installé

Write-Host "=== Diagnostic avec Flutter ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ce script va lancer l'application en mode release et afficher les logs." -ForegroundColor Yellow
Write-Host "Assurez-vous que votre téléphone est connecté en USB avec le débogage activé." -ForegroundColor Yellow
Write-Host ""
Write-Host "Appuyez sur Entrée pour continuer..." -ForegroundColor Green
Read-Host

cd E:\suivi-activite-delegation\front

Write-Host "`nLancement de l'application avec logs..." -ForegroundColor Cyan
Write-Host "Les erreurs s'afficheront ici en temps réel." -ForegroundColor Yellow
Write-Host "Appuyez sur Ctrl+C pour arrêter.`n" -ForegroundColor Yellow

# Lancer avec Flutter qui affichera les logs
flutter run --release
