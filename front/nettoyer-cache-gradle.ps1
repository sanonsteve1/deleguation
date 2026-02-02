# Script pour nettoyer le cache Gradle et libérer de l'espace
# Usage: .\nettoyer-cache-gradle.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NETTOYAGE DU CACHE GRADLE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier l'espace disque avant
Write-Host "📊 Espace disque avant nettoyage:" -ForegroundColor Yellow
$driveBefore = Get-PSDrive C
Write-Host "   Utilisé: $([math]::Round($driveBefore.Used/1GB, 2)) GB" -ForegroundColor White
Write-Host "   Libre: $([math]::Round($driveBefore.Free/1GB, 2)) GB" -ForegroundColor White
Write-Host ""

# Arrêter les daemons Gradle
Write-Host "1. Arrêt des daemons Gradle..." -ForegroundColor Yellow
try {
    if (Test-Path "android\gradlew.bat") {
        Push-Location "android"
        .\gradlew.bat --stop 2>&1 | Out-Null
        Pop-Location
        Write-Host "   ✅ Daemons Gradle arrêtés" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  gradlew.bat introuvable, passage à l'étape suivante" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Impossible d'arrêter Gradle (peut-être déjà arrêté)" -ForegroundColor Yellow
}
Write-Host ""

# Calculer la taille du cache avant suppression
Write-Host "2. Calcul de la taille du cache Gradle..." -ForegroundColor Yellow
$gradleCachePath = "$env:USERPROFILE\.gradle"
if (Test-Path $gradleCachePath) {
    $cacheSize = (Get-ChildItem $gradleCachePath -Recurse -ErrorAction SilentlyContinue | 
        Measure-Object -Property Length -Sum).Sum
    $cacheSizeGB = [math]::Round($cacheSize/1GB, 2)
    Write-Host "   Taille du cache: $cacheSizeGB GB" -ForegroundColor White
} else {
    Write-Host "   ⚠️  Cache Gradle introuvable" -ForegroundColor Yellow
    $cacheSizeGB = 0
}
Write-Host ""

# Demander confirmation
Write-Host "⚠️  ATTENTION: Cette opération va supprimer TOUT le cache Gradle!" -ForegroundColor Red
Write-Host "   Cela va libérer environ $cacheSizeGB GB d'espace." -ForegroundColor Yellow
Write-Host "   Le cache sera reconstruit lors du prochain build (plus lent)." -ForegroundColor Yellow
Write-Host ""
$confirmation = Read-Host "   Continuer? (O/N)"

if ($confirmation -ne "O" -and $confirmation -ne "o") {
    Write-Host ""
    Write-Host "❌ Opération annulée" -ForegroundColor Red
    exit
}

Write-Host ""

# Nettoyer le cache Gradle
Write-Host "3. Suppression du cache Gradle..." -ForegroundColor Yellow
try {
    if (Test-Path "$env:USERPROFILE\.gradle\caches") {
        Remove-Item -Path "$env:USERPROFILE\.gradle\caches" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ Cache Gradle supprimé" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  Cache déjà supprimé ou inexistant" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Erreur lors de la suppression: $_" -ForegroundColor Red
}

try {
    if (Test-Path "$env:USERPROFILE\.gradle\daemon") {
        Remove-Item -Path "$env:USERPROFILE\.gradle\daemon" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ Daemons Gradle supprimés" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Erreur lors de la suppression des daemons: $_" -ForegroundColor Yellow
}
Write-Host ""

# Nettoyer le build Flutter
Write-Host "4. Nettoyage du build Flutter..." -ForegroundColor Yellow
try {
    Push-Location $PSScriptRoot
    flutter clean 2>&1 | Out-Null
    Write-Host "   ✅ Build Flutter nettoyé" -ForegroundColor Green
    Pop-Location
} catch {
    Write-Host "   ⚠️  Erreur lors du nettoyage Flutter: $_" -ForegroundColor Yellow
}
Write-Host ""

# Vérifier l'espace disque après
Write-Host "📊 Espace disque après nettoyage:" -ForegroundColor Yellow
$driveAfter = Get-PSDrive C
Write-Host "   Utilisé: $([math]::Round($driveAfter.Used/1GB, 2)) GB" -ForegroundColor White
Write-Host "   Libre: $([math]::Round($driveAfter.Free/1GB, 2)) GB" -ForegroundColor White
$freed = $driveAfter.Free - $driveBefore.Free
Write-Host "   Espace libéré: $([math]::Round($freed/1GB, 2)) GB" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ NETTOYAGE TERMINÉ" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. flutter pub get" -ForegroundColor White
Write-Host "2. flutter build apk --debug --target-platform android-arm,android-arm64,android-x64" -ForegroundColor White
Write-Host ""
