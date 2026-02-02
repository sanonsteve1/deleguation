#!/bin/bash
# Script bash pour générer l'APK
# Usage: ./generer-apk.sh [release|debug|split]

MODE=${1:-release}

echo "========================================"
echo "  Génération de l'APK FieldTrack Pro"
echo "========================================"
echo ""

# Vérifier que Flutter est installé
if ! command -v flutter &> /dev/null; then
    echo "ERREUR: Flutter n'est pas installé ou n'est pas dans le PATH"
    exit 1
fi

echo "✓ Flutter trouvé"
echo ""

# Nettoyer le projet
echo "Nettoyage du projet..."
flutter clean
echo ""

# Récupérer les dépendances
echo "Récupération des dépendances..."
flutter pub get
echo ""

# Générer l'APK selon le mode
echo "Génération de l'APK en mode $MODE..."
echo ""

case $MODE in
    release)
        flutter build apk --release
        APK_PATH="build/app/outputs/flutter-apk/app-release.apk"
        ;;
    debug)
        flutter build apk --debug
        APK_PATH="build/app/outputs/flutter-apk/app-debug.apk"
        ;;
    split)
        flutter build apk --split-per-abi --release
        APK_PATH="build/app/outputs/flutter-apk/"
        echo ""
        echo "APK générés par architecture:"
        echo "  - app-armeabi-v7a-release.apk (32-bit)"
        echo "  - app-arm64-v8a-release.apk (64-bit) - RECOMMANDÉ"
        echo "  - app-x86_64-release.apk (x86_64)"
        ;;
    *)
        echo "Mode invalide. Utilisez: release, debug, ou split"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "  APK généré avec succès !"
    echo "========================================"
    echo ""
    echo "Emplacement: $APK_PATH"
    echo ""
    
    if [ "$MODE" != "split" ]; then
        if [ -f "$APK_PATH" ]; then
            SIZE=$(du -h "$APK_PATH" | cut -f1)
            echo "Taille: $SIZE"
        fi
    fi
    
    echo ""
    echo "Pour installer sur un appareil:"
    echo "  1. Connectez votre téléphone via USB"
    echo "  2. Activez le débogage USB dans les paramètres développeur"
    echo "  3. Exécutez: flutter install"
    echo ""
else
    echo ""
    echo "ERREUR lors de la génération de l'APK"
    echo "Consultez les messages d'erreur ci-dessus"
    exit 1
fi
