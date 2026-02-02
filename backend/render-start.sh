#!/bin/bash
set -e

echo "🚀 Démarrage de FieldTrack Pro Backend..."

cd backend

# Convertir DATABASE_URL en format JDBC si nécessaire
if [ -n "$DATABASE_URL" ] && [ -z "$SPRING_DATASOURCE_URL" ]; then
    # Convertir postgresql:// en jdbc:postgresql://
    if [[ $DATABASE_URL == postgresql://* ]]; then
        export SPRING_DATASOURCE_URL=$(echo $DATABASE_URL | sed 's|postgresql://|jdbc:postgresql://|')
        echo "✅ URL de base de données convertie en format JDBC"
    fi
fi

# Utiliser le port fourni par Render
export SERVER_PORT=${PORT:-10000}

echo "🌐 Port: $PORT"
echo "🗄️  Base de données: ${SPRING_DATASOURCE_URL:-$DATABASE_URL}"

# Démarrer l'application
if [ -f "build/libs/fieldtrack.jar" ]; then
    echo "📦 Démarrage avec JAR..."
    java -jar build/libs/fieldtrack.jar --server.port=$PORT
elif [ -f "build/libs/fieldtrack.war" ]; then
    echo "📦 Démarrage avec WAR..."
    java -jar build/libs/fieldtrack.war --server.port=$PORT
else
    echo "❌ Erreur: Aucun fichier JAR/WAR trouvé!"
    ls -la build/libs/
    exit 1
fi
