# Utiliser une image Java 17
FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /app

# Copier les fichiers de configuration Gradle
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Copier le code source
COPY src src

# Rendre gradlew exécutable et construire l'application
RUN chmod +x ./gradlew && ./gradlew clean build -x test

# Image de production
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copier le JAR/WAR depuis l'étape de build
# Essayer d'abord le JAR, puis le WAR
COPY --from=build /app/build/libs/fieldtrack.jar* app.jar

# Exposer le port (Render définira le port via $PORT)
EXPOSE 10000

# Commande de démarrage avec support du port dynamique
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-10000}"]
