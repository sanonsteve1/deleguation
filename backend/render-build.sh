#!/bin/bash
set -e

echo "🔨 Building FieldTrack Pro Backend..."

# Aller dans le répertoire backend
cd backend

# Rendre gradlew exécutable
chmod +x ./gradlew

# Nettoyer et construire le projet (sans les tests pour accélérer le build)
./gradlew clean build -x test

echo "✅ Build terminé avec succès!"

# Vérifier que le JAR/WAR a été créé
if [ -f "build/libs/fieldtrack.jar" ]; then
    echo "✅ JAR trouvé: build/libs/fieldtrack.jar"
elif [ -f "build/libs/fieldtrack.war" ]; then
    echo "✅ WAR trouvé: build/libs/fieldtrack.war"
else
    echo "❌ Erreur: Aucun fichier JAR/WAR trouvé!"
    ls -la build/libs/
    exit 1
fi
