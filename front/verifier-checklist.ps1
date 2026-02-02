# Script de vérification de la checklist APK
# Usage: .\verifier-checklist.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VÉRIFICATION CHECKLIST APK FLUTTER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Flutter Doctor
Write-Host "1️⃣ Flutter Doctor..." -ForegroundColor Yellow
flutter doctor
Write-Host ""

# 2. Nettoyage
Write-Host "2️⃣ Nettoyage du projet..." -ForegroundColor Yellow
flutter clean
Write-Host "✅ Nettoyage terminé" -ForegroundColor Green
Write-Host ""

# 3. Récupération des dépendances
Write-Host "3️⃣ Récupération des dépendances..." -ForegroundColor Yellow
flutter pub get
Write-Host "✅ Dépendances récupérées" -ForegroundColor Green
Write-Host ""

# 4. Vérification des versions
Write-Host "4️⃣ Vérification des versions de plugins..." -ForegroundColor Yellow
flutter pub outdated
Write-Host ""

# 5. Vérification des conflits
Write-Host "5️⃣ Vérification des conflits de dépendances..." -ForegroundColor Yellow
flutter pub deps
Write-Host ""

# 6. Analyse du code
Write-Host "6️⃣ Analyse du code..." -ForegroundColor Yellow
flutter analyze
Write-Host ""

# 7. Vérification AndroidManifest
Write-Host "7️⃣ Vérification AndroidManifest.xml..." -ForegroundColor Yellow
$manifestPath = "android\app\src\main\AndroidManifest.xml"
if (Test-Path $manifestPath) {
    $manifest = Get-Content $manifestPath -Raw
    if ($manifest -match 'android:exported="true"') {
        Write-Host "✅ android:exported='true' présent" -ForegroundColor Green
    } else {
        Write-Host "❌ android:exported='true' manquant" -ForegroundColor Red
    }
    if ($manifest -match 'android.permission.INTERNET') {
        Write-Host "✅ Permission INTERNET présente" -ForegroundColor Green
    } else {
        Write-Host "❌ Permission INTERNET manquante" -ForegroundColor Red
    }
} else {
    Write-Host "❌ AndroidManifest.xml introuvable" -ForegroundColor Red
}
Write-Host ""

# 8. Vérification MainActivity
Write-Host "8️⃣ Vérification MainActivity..." -ForegroundColor Yellow
$mainActivityPath = "android\app\src\main\java\com\example\social_media\MainActivity.java"
if (Test-Path $mainActivityPath) {
    $mainActivity = Get-Content $mainActivityPath -Raw
    if ($mainActivity -match 'extends FlutterActivity') {
        Write-Host "✅ MainActivity hérite de FlutterActivity" -ForegroundColor Green
    } else {
        Write-Host "❌ MainActivity n'hérite pas de FlutterActivity" -ForegroundColor Red
    }
} else {
    Write-Host "❌ MainActivity.java introuvable" -ForegroundColor Red
}
Write-Host ""

# 9. Vérification build.gradle
Write-Host "9️⃣ Vérification build.gradle..." -ForegroundColor Yellow
$buildGradlePath = "android\app\build.gradle"
if (Test-Path $buildGradlePath) {
    $buildGradle = Get-Content $buildGradlePath -Raw
    if ($buildGradle -match 'minifyEnabled = false') {
        Write-Host "✅ minifyEnabled = false (ProGuard désactivé)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  minifyEnabled peut être activé" -ForegroundColor Yellow
    }
    if ($buildGradle -match 'shrinkResources = false') {
        Write-Host "✅ shrinkResources = false" -ForegroundColor Green
    } else {
        Write-Host "⚠️  shrinkResources peut être activé" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ build.gradle introuvable" -ForegroundColor Red
}
Write-Host ""

# 10. Vérification main.dart
Write-Host "🔟 Vérification main.dart..." -ForegroundColor Yellow
$mainDartPath = "lib\main.dart"
if (Test-Path $mainDartPath) {
    $mainDart = Get-Content $mainDartPath -Raw
    if ($mainDart -match 'WidgetsFlutterBinding.ensureInitialized') {
        Write-Host "✅ WidgetsFlutterBinding.ensureInitialized() présent" -ForegroundColor Green
    } else {
        Write-Host "❌ WidgetsFlutterBinding.ensureInitialized() manquant" -ForegroundColor Red
    }
} else {
    Write-Host "❌ main.dart introuvable" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ VÉRIFICATION TERMINÉE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Tester avec: flutter run" -ForegroundColor White
Write-Host "2. Générer APK debug: flutter build apk --debug" -ForegroundColor White
Write-Host "3. Générer APK release: flutter build apk --release" -ForegroundColor White
Write-Host "4. Voir les logs: adb logcat" -ForegroundColor White
Write-Host ""
