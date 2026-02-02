# Script PowerShell pour démarrer ngrok depuis le répertoire backend
# Usage: .\start-ngrok.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Démarrage de Ngrok pour le Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si ngrok est installé
$ngrokPath = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokPath) {
    Write-Host "ERREUR: ngrok n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "Téléchargez ngrok depuis: https://ngrok.com/download" -ForegroundColor Yellow
    Write-Host "Ou utilisez le chemin complet vers ngrok.exe" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative: Exécutez directement: ngrok http 8073" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Ngrok trouvé" -ForegroundColor Green
Write-Host ""
Write-Host "Démarrage du tunnel ngrok sur le port 8073..." -ForegroundColor Yellow
Write-Host "URL du backend local: http://localhost:8073" -ForegroundColor Gray
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Yellow
Write-Host "1. Notez l'URL ngrok qui s'affichera (ex: https://abc123.ngrok-free.app)" -ForegroundColor Yellow
Write-Host "2. Mettez à jour front/lib/config/api_config.dart avec cette URL" -ForegroundColor Yellow
Write-Host "3. Mettez à jour frontend/environments/environment.ts avec cette URL" -ForegroundColor Yellow
Write-Host "4. Mettez à jour backend/src/main/resources/application.properties:" -ForegroundColor Yellow
Write-Host "   client.base_url.ngrok=https://VOTRE_URL_NGROK.ngrok-free.app" -ForegroundColor Gray
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arreter ngrok" -ForegroundColor Gray
Write-Host ""

# Démarrer ngrok
ngrok http 8073
