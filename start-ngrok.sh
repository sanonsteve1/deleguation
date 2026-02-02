#!/bin/bash
# Script bash pour démarrer ngrok
# Usage: ./start-ngrok.sh

echo "========================================"
echo "  Démarrage de Ngrok pour le Backend"
echo "========================================"
echo ""

# Vérifier si ngrok est installé
if ! command -v ngrok &> /dev/null; then
    echo "ERREUR: ngrok n'est pas installé ou n'est pas dans le PATH"
    echo "Téléchargez ngrok depuis: https://ngrok.com/download"
    exit 1
fi

echo "✓ Ngrok trouvé"
echo ""
echo "Démarrage du tunnel ngrok sur le port 8073..."
echo "URL du backend local: http://localhost:8073"
echo ""
echo "IMPORTANT:"
echo "1. Notez l'URL ngrok qui s'affichera (ex: https://abc123.ngrok-free.app)"
echo "2. Mettez à jour front/lib/config/api_config.dart avec cette URL"
echo "3. Mettez à jour frontend/environments/environment.ts avec cette URL"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter ngrok"
echo ""

# Démarrer ngrok
ngrok http 8073
