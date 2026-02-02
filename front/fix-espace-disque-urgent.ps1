# Script URGENT pour fixer le problème d'espace disque
# Usage: .\fix-espace-disque-urgent.ps1

Write-Host "========================================" -ForegroundColor Red
Write-Host "  FIX URGENT : ESPACE DISQUE" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Vérifier l'espace disque C:
Write-Host "📊 Vérification de l'espace disque C:..." -ForegroundColor Yellow
$driveC = Get-PSDrive C
$freeGB = [math]::Round($driveC.Free/1GB, 2)
Write-Host "   Espace libre sur C:: $freeGB GB" -ForegroundColor $(if ($freeGB -lt 1) { "Red" } else { "Green" })

if ($freeGB -lt 1) {
    Write-Host ""
    Write-Host "⚠️  ATTENTION: Moins de 1 GB libre sur C:!" -ForegroundColor Red
    Write-Host "   Le cache Gradle DOIT être déplacé vers E:" -ForegroundColor Yellow
    Write-Host ""
}

# Étape 1 : Arrêter Gradle
Write-Host "1. Arrêt des processus Gradle..." -ForegroundColor Yellow
try {
    Get-Process | Where-Object {$_.Path -like "*gradle*" -or $_.ProcessName -like "*gradle*"} | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Processus Gradle arrêtés" -ForegroundColor Green
} catch {
    Write-Host "   ℹ️  Aucun processus Gradle en cours" -ForegroundColor Gray
}

if (Test-Path "android\gradlew.bat") {
    Push-Location "android"
    .\gradlew.bat --stop 2>&1 | Out-Null
    Pop-Location
}
Write-Host ""

# Étape 2 : Supprimer le cache Gradle sur C:
Write-Host "2. Suppression du cache Gradle sur C:..." -ForegroundColor Yellow
$gradleCachePath = "$env:USERPROFILE\.gradle"

if (Test-Path $gradleCachePath) {
    $cacheSize = (Get-ChildItem $gradleCachePath -Recurse -ErrorAction SilentlyContinue | 
        Measure-Object -Property Length -Sum).Sum
    $cacheSizeGB = [math]::Round($cacheSize/1GB, 2)
    Write-Host "   Taille du cache à supprimer: $cacheSizeGB GB" -ForegroundColor White
    
    Write-Host "   ⚠️  Suppression en cours..." -ForegroundColor Yellow
    try {
        Remove-Item -Path $gradleCachePath -Recurse -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        
        if (-not (Test-Path $gradleCachePath)) {
            Write-Host "   ✅ Cache Gradle supprimé de C: ($cacheSizeGB GB libérés)" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Le cache n'a pas été complètement supprimé" -ForegroundColor Yellow
            Write-Host "   → Essayez de supprimer manuellement: $gradleCachePath" -ForegroundColor White
        }
    } catch {
        Write-Host "   ❌ Erreur lors de la suppression: $_" -ForegroundColor Red
        Write-Host "   → Supprimez manuellement: $gradleCachePath" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ℹ️  Cache Gradle déjà supprimé ou inexistant" -ForegroundColor Gray
}
Write-Host ""

# Étape 3 : Vérifier la configuration
Write-Host "3. Vérification de la configuration..." -ForegroundColor Yellow
$gradleProps = "android\gradle.properties"
if (Test-Path $gradleProps) {
    $content = Get-Content $gradleProps -Raw
    if ($content -match "org\.gradle\.user\.home=E:/.gradle") {
        Write-Host "   ✅ Cache Gradle configuré pour E:/.gradle" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Configuration manquante dans gradle.properties" -ForegroundColor Red
        Write-Host "   → Ajoutez: org.gradle.user.home=E:/.gradle" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Fichier gradle.properties introuvable" -ForegroundColor Red
}
Write-Host ""

# Étape 4 : Créer le dossier sur E:
Write-Host "4. Création du dossier .gradle sur E:..." -ForegroundColor Yellow
$gradleHomeE = "E:\.gradle"
if (-not (Test-Path $gradleHomeE)) {
    try {
        New-Item -ItemType Directory -Path $gradleHomeE -Force | Out-Null
        Write-Host "   ✅ Dossier E:\.gradle créé" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Erreur lors de la création: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   ℹ️  Dossier E:\.gradle existe déjà" -ForegroundColor Gray
}
Write-Host ""

# Étape 5 : Vérifier l'espace sur E:
Write-Host "5. Vérification de l'espace disque E:..." -ForegroundColor Yellow
if (Test-Path "E:\") {
    $driveE = Get-PSDrive E -ErrorAction SilentlyContinue
    if ($driveE) {
        $freeGBE = [math]::Round($driveE.Free/1GB, 2)
        Write-Host "   Espace libre sur E:: $freeGBE GB" -ForegroundColor $(if ($freeGBE -gt 5) { "Green" } else { "Yellow" })
        
        if ($freeGBE -lt 5) {
            Write-Host "   ⚠️  Moins de 5 GB libre sur E: (recommandé: 10+ GB)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠️  Impossible de vérifier l'espace sur E:" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ERREUR: Le disque E: n'existe pas" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ PRÉPARATION TERMINÉE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. cd E:\suivi-activite-delegation\front" -ForegroundColor White
Write-Host "2. flutter clean" -ForegroundColor White
Write-Host "3. flutter pub get" -ForegroundColor White
Write-Host "4. flutter build apk --debug --target-platform android-arm,android-arm64,android-x64" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Si le cache est toujours sur C:, supprimez-le manuellement:" -ForegroundColor Yellow
Write-Host "   Remove-Item -Path `"$env:USERPROFILE\.gradle`" -Recurse -Force" -ForegroundColor White
Write-Host ""
