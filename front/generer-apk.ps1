# Script de génération d'APK avec nettoyage préalable
Write-Host "🧹 Nettoyage du projet..." -ForegroundColor Cyan
flutter clean

Write-Host "🛑 Arrêt des daemons Gradle..." -ForegroundColor Cyan
cd android
.\gradlew --stop
cd ..

Write-Host "📦 Récupération des dépendances..." -ForegroundColor Cyan
flutter pub get

Write-Host "🔨 Génération de l'APK Release..." -ForegroundColor Cyan
flutter build apk --release

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ APK généré avec succès!" -ForegroundColor Green
    Write-Host "📱 Fichier: build/app/outputs/flutter-apk/app-release.apk" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de la génération" -ForegroundColor Red
    Write-Host "💡 Essayez: flutter build apk --debug" -ForegroundColor Yellow
}
