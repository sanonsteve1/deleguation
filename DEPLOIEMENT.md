# Guide de Déploiement du Backend

## Configuration pour déploiement sur réseau local

Ce guide explique comment déployer le backend sur une machine avec l'adresse IP `192.168.11.111` pour permettre l'accès depuis l'application mobile.

## Étapes de configuration

### 1. Configuration du Backend

Le fichier `backend/src/main/resources/application.properties` a été configuré pour :
- Écouter sur toutes les interfaces réseau (`server.address=0.0.0.0`)
- Autoriser les requêtes CORS depuis l'application mobile

### 2. Configuration de l'Application Mobile

L'URL du backend dans `front/lib/services/api_service.dart` est configurée pour pointer vers :
```dart
static const String baseUrl = 'http://192.168.11.111:8073/ws';
```

**Pour changer l'URL du backend**, modifiez la ligne suivante dans `front/lib/services/api_service.dart` :
```dart
static const String baseUrl = 'http://VOTRE_IP:8073/ws';
```

### 3. Vérification de la connexion réseau

Assurez-vous que :
- La machine serveur (192.168.11.111) et le téléphone mobile sont sur le même réseau
- Le port 8073 est ouvert dans le firewall de la machine serveur
- La base de données PostgreSQL est accessible depuis la machine serveur

### 4. Démarrage du Backend

Sur la machine serveur (192.168.11.111) :

```bash
cd backend
./gradlew bootRun
# ou
java -jar build/libs/abproject-*.jar
```

Le backend sera accessible à l'adresse : `http://192.168.11.111:8073`

### 5. Vérification

Pour vérifier que le backend est accessible :

```bash
curl http://192.168.11.111:8073/ws/securite/auth
```

Vous devriez recevoir une réponse (même si c'est une erreur d'authentification, cela confirme que le serveur répond).

### 6. Configuration du Firewall (Windows)

Si vous utilisez Windows, vous devez autoriser le port 8073 :

1. Ouvrez le **Pare-feu Windows Defender**
2. Cliquez sur **Paramètres avancés**
3. Cliquez sur **Règles de trafic entrant** > **Nouvelle règle**
4. Sélectionnez **Port** > **TCP** > **Ports spécifiques locaux : 8073**
5. Autorisez la connexion
6. Appliquez à tous les profils

### 7. Configuration du Firewall (Linux)

```bash
# Pour Ubuntu/Debian
sudo ufw allow 8073/tcp
sudo ufw reload

# Pour CentOS/RHEL
sudo firewall-cmd --permanent --add-port=8073/tcp
sudo firewall-cmd --reload
```

## Retour à la configuration locale

Pour revenir à une configuration locale (localhost), modifiez :

1. **Backend** (`application.properties`) :
   ```properties
   server.address=localhost
   ```

2. **Application Mobile** (`api_service.dart`) :
   ```dart
   static const String baseUrl = 'http://localhost:8073/ws';
   ```

## Dépannage

### L'application mobile ne peut pas se connecter

1. Vérifiez que le backend est démarré sur la machine serveur
2. Vérifiez que le téléphone et le serveur sont sur le même réseau WiFi
3. Testez la connexion avec `ping 192.168.11.111` depuis le téléphone
4. Vérifiez que le firewall autorise le port 8073

### Erreur CORS

Si vous obtenez des erreurs CORS, vérifiez que l'URL mobile est bien ajoutée dans `WebConfig.java` :
```java
.allowedOrigins(clientLocal, clientOnline, clientFlutter, clientMobile)
```

### Erreur de connexion à la base de données

Assurez-vous que PostgreSQL est configuré pour accepter les connexions depuis la machine serveur et que les identifiants dans `application.properties` sont corrects.

## Génération de l'APK pour l'application mobile

Pour générer l'APK de l'application Flutter et l'installer sur un appareil Android physique, consultez le guide détaillé :

📱 **[Guide de Génération de l'APK](front/GENERATION_APK.md)**

### Génération rapide

```bash
cd front
flutter build apk --release
```

L'APK sera généré dans : `front/build/app/outputs/flutter-apk/app-release.apk`

Vous pouvez ensuite transférer cet APK sur votre téléphone Android et l'installer.
