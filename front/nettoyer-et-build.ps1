# Script pour nettoyer et générer l'APK
Write-Host "🛑 Arrêt de tous les processus Java/Gradle..." -ForegroundColor Cyan
Get-Process | Where-Object {$_.ProcessName -like "*java*" -or $_.ProcessName -like "*gradle*"} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "🧹 Arrêt des daemons Gradle..." -ForegroundColor Cyan
cd android
.\gradlew --stop
cd ..

Write-Host "🧹 Nettoyage Flutter..." -ForegroundColor Cyan
flutter clean

Write-Host "⏳ Attente de 5 secondes pour libérer les fichiers..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "📦 Récupération des dépendances..." -ForegroundColor Cyan
flutter pub get

Write-Host "🔨 Génération de l'APK Release..." -ForegroundColor Cyan
flutter build apk --release

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ APK généré avec succès!" -ForegroundColor Green
    Write-Host "📱 Fichier: build/app/outputs/flutter-apk/app-release.apk" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de la génération" -ForegroundColor Red
    Write-Host "💡 Essayez de redémarrer votre ordinateur et réessayez" -ForegroundColor Yellow
}
