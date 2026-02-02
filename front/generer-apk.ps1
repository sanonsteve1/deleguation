# Script PowerShell pour générer l'APK
# Usage: .\generer-apk.ps1 [--release|--debug|--split]

param(
    [string]$Mode = "release"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Génération de l'APK FieldTrack Pro" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Flutter est installé
$flutterPath = Get-Command flutter -ErrorAction SilentlyContinue
if (-not $flutterPath) {
    Write-Host "ERREUR: Flutter n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Flutter trouvé" -ForegroundColor Green
Write-Host ""

# Nettoyer le projet
Write-Host "Nettoyage du projet..." -ForegroundColor Yellow
flutter clean
Write-Host ""

# Récupérer les dépendances
Write-Host "Récupération des dépendances..." -ForegroundColor Yellow
flutter pub get
Write-Host ""

# Générer l'APK selon le mode
Write-Host "Génération de l'APK en mode $Mode..." -ForegroundColor Yellow
Write-Host ""

switch ($Mode.ToLower()) {
    "release" {
        flutter build apk --release
        $apkPath = "build\app\outputs\flutter-apk\app-release.apk"
    }
    "debug" {
        flutter build apk --debug
        $apkPath = "build\app\outputs\flutter-apk\app-debug.apk"
    }
    "split" {
        flutter build apk --split-per-abi --release
        $apkPath = "build\app\outputs\flutter-apk\"
        Write-Host ""
        Write-Host "APK générés par architecture:" -ForegroundColor Green
        Write-Host "  - app-armeabi-v7a-release.apk (32-bit)" -ForegroundColor Gray
        Write-Host "  - app-arm64-v8a-release.apk (64-bit) - RECOMMANDÉ" -ForegroundColor Gray
        Write-Host "  - app-x86_64-release.apk (x86_64)" -ForegroundColor Gray
    }
    default {
        Write-Host "Mode invalide. Utilisez: release, debug, ou split" -ForegroundColor Red
        exit 1
    }
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  APK généré avec succès !" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Emplacement: $apkPath" -ForegroundColor Cyan
    Write-Host ""
    
    if ($Mode -ne "split") {
        $fullPath = Join-Path $PWD $apkPath
        if (Test-Path $fullPath) {
            $fileInfo = Get-Item $fullPath
            Write-Host "Taille: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "Pour installer sur un appareil:" -ForegroundColor Yellow
    Write-Host "  1. Connectez votre téléphone via USB" -ForegroundColor Gray
    Write-Host "  2. Activez le débogage USB dans les paramètres développeur" -ForegroundColor Gray
    Write-Host "  3. Exécutez: flutter install" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERREUR lors de la génération de l'APK" -ForegroundColor Red
    Write-Host "Consultez les messages d'erreur ci-dessus" -ForegroundColor Yellow
    exit 1
}
