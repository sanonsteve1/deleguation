# Script pour régénérer l'APK avec les corrections
Write-Host "=== Régénération de l'APK avec corrections ===" -ForegroundColor Cyan

# Nettoyer
Write-Host "`n1. Nettoyage..." -ForegroundColor Yellow
cd E:\suivi-activite-delegation\front
flutter clean
cd android
.\gradlew clean
cd ..

# Récupérer les dépendances
Write-Host "`n2. Récupération des dépendances..." -ForegroundColor Yellow
flutter pub get

# Générer l'APK
Write-Host "`n3. Génération de l'APK (release)..." -ForegroundColor Yellow
flutter build apk --release

Write-Host "`n=== APK généré ===" -ForegroundColor Green
Write-Host "Emplacement: front\build\app\outputs\flutter-apk\app-release.apk" -ForegroundColor Green

Write-Host "`n=== Instructions ===" -ForegroundColor Cyan
Write-Host "1. Désinstallez complètement l'ancienne version de l'application" -ForegroundColor White
Write-Host "2. Installez le nouvel APK" -ForegroundColor White
Write-Host "3. Si l'app ne s'ouvre toujours pas, connectez votre téléphone et exécutez:" -ForegroundColor White
Write-Host "   adb logcat | grep -i 'flutter\|error\|exception\|MainActivity'" -ForegroundColor Yellow
