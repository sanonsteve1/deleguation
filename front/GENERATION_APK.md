# Guide de Génération de l'APK

Ce guide explique comment générer un fichier APK pour installer l'application FieldTrack Pro sur un appareil Android physique.

## Prérequis

1. **Flutter SDK** installé et configuré
2. **Android Studio** avec Android SDK installé
3. **Java JDK** (version 11 ou supérieure)
4. Connexion Internet pour télécharger les dépendances

## Vérification de l'environnement

Avant de générer l'APK, vérifiez que Flutter est correctement configuré :

```bash
cd front
flutter doctor
```

Assurez-vous que tous les composants nécessaires sont installés (Android toolchain, Android Studio, etc.).

## Génération de l'APK

### Option 1 : APK de débogage (Debug APK)

Pour générer un APK de débogage (plus rapide, mais plus volumineux) :

```bash
cd front
flutter build apk --debug
```

L'APK sera généré dans : `front/build/app/outputs/flutter-apk/app-debug.apk`

### Option 2 : APK de production (Release APK)

Pour générer un APK optimisé pour la production :

```bash
cd front
flutter build apk --release
```

L'APK sera généré dans : `front/build/app/outputs/flutter-apk/app-release.apk`

### Option 3 : APK divisé par architecture (Split APK)

Pour réduire la taille de l'APK en créant des fichiers séparés pour chaque architecture :

```bash
cd front
flutter build apk --split-per-abi
```

Cela génère trois APK séparés :
- `app-armeabi-v7a-release.apk` (32-bit)
- `app-arm64-v8a-release.apk` (64-bit)
- `app-x86_64-release.apk` (x86_64)

**Note** : Utilisez `app-arm64-v8a-release.apk` pour la plupart des appareils Android modernes.

## Installation sur un appareil Android

### Méthode 1 : Via USB (ADB)

1. Activez le **mode développeur** sur votre téléphone Android :
   - Allez dans **Paramètres** > **À propos du téléphone**
   - Appuyez 7 fois sur **Numéro de build**
   - Retournez aux **Paramètres** > **Options pour les développeurs**
   - Activez **Débogage USB**

2. Connectez votre téléphone à l'ordinateur via USB

3. Vérifiez que l'appareil est détecté :
   ```bash
   flutter devices
   ```

4. Installez l'APK directement :
   ```bash
   flutter install
   ```

   Ou installez manuellement :
   ```bash
   adb install front/build/app/outputs/flutter-apk/app-release.apk
   ```

### Méthode 2 : Transfert manuel

1. Copiez l'APK sur votre téléphone (via USB, email, cloud, etc.)

2. Sur votre téléphone :
   - Ouvrez le gestionnaire de fichiers
   - Localisez l'APK
   - Appuyez sur l'APK pour l'installer
   - Autorisez l'installation depuis des sources inconnues si demandé

## Configuration de l'URL du Backend

Avant de générer l'APK, assurez-vous que l'URL du backend est correctement configurée dans `lib/services/api_service.dart` :

```dart
static const String baseUrl = 'http://192.168.11.111:8073/ws';
```

## Signer l'APK pour la production

Pour distribuer l'APK sur le Play Store ou pour une installation en production, vous devez signer l'APK :

### 1. Générer une clé de signature

```bash
keytool -genkey -v -keystore ~/fieldtrack-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias fieldtrack
```

### 2. Configurer la signature dans `android/app/build.gradle`

Ajoutez la configuration de signature dans la section `android` :

```gradle
android {
    ...
    signingConfigs {
        release {
            keyAlias 'fieldtrack'
            keyPassword 'VOTRE_MOT_DE_PASSE'
            storeFile file('~/fieldtrack-key.jks')
            storePassword 'VOTRE_MOT_DE_PASSE'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### 3. Générer l'APK signé

```bash
flutter build apk --release
```

## Optimisations supplémentaires

### Réduire la taille de l'APK

1. **Utiliser des APK divisés par architecture** :
   ```bash
   flutter build apk --split-per-abi --release
   ```

2. **Activer la compression** dans `android/app/build.gradle` :
   ```gradle
   android {
       buildTypes {
           release {
               shrinkResources true
               minifyEnabled true
           }
       }
   }
   ```

### Générer un App Bundle (AAB) pour le Play Store

Pour publier sur Google Play Store, utilisez plutôt un App Bundle :

```bash
flutter build appbundle --release
```

L'AAB sera généré dans : `front/build/app/outputs/bundle/release/app-release.aab`

## Dépannage

### Erreur : "Gradle build failed"

1. Nettoyez le projet :
   ```bash
   cd front
   flutter clean
   flutter pub get
   ```

2. Vérifiez la configuration dans `android/app/build.gradle`

### Erreur : "Your project path contains non-ASCII characters"

Si votre chemin de projet contient des caractères non-ASCII (comme des accents), ajoutez cette ligne dans `android/gradle.properties` :

```properties
android.overridePathCheck=true
```

Cette configuration désactive la vérification des caractères non-ASCII dans le chemin du projet.

### Erreur : "Failed to transform core-for-system-modules.jar" ou incompatibilité AGP avec Java 21

Si vous utilisez Java 21 ou supérieur avec Android Gradle Plugin (AGP) version inférieure à 8.2.1, vous devez mettre à jour AGP :

1. Dans `android/settings.gradle`, mettez à jour la version d'AGP :
   ```gradle
   id "com.android.application" version "8.3.0" apply false
   ```

2. Mettez également à jour la version Java dans `android/app/build.gradle` :
   ```gradle
   compileOptions {
       sourceCompatibility = JavaVersion.VERSION_11
       targetCompatibility = JavaVersion.VERSION_11
   }
   kotlinOptions {
       jvmTarget = '11'
   }
   ```

3. Mettez à jour la version de Gradle dans `android/gradle/wrapper/gradle-wrapper.properties` :
   ```properties
   distributionUrl=https\://services.gradle.org/distributions/gradle-8.4-all.zip
   ```

### Erreur : "Minimum supported Gradle version is 8.4. Current version is 8.3"

Si vous avez mis à jour AGP vers 8.3.0 ou supérieur, vous devez également mettre à jour Gradle vers 8.4 ou supérieur :

Dans `android/gradle/wrapper/gradle-wrapper.properties`, modifiez :
```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.4-all.zip
```

### Erreur : "SDK location not found"

Configurez le SDK Android :
```bash
export ANDROID_HOME=/path/to/Android/Sdk
```

Ou ajoutez dans `android/local.properties` :
```
sdk.dir=/path/to/Android/Sdk
```

### L'APK ne s'installe pas

1. Désinstallez l'ancienne version de l'application
2. Vérifiez que l'APK n'est pas corrompu
3. Assurez-vous que votre téléphone autorise l'installation depuis des sources inconnues

### L'application ne se connecte pas au backend

1. Vérifiez que le téléphone et le serveur sont sur le même réseau WiFi
2. Vérifiez l'URL du backend dans `api_service.dart`
3. Testez la connexion avec `ping 192.168.11.111` depuis le téléphone

### Erreur : "Could not write file" ou "Unable to read file" avec des chemins contenant des accents

Si votre chemin de projet contient des caractères non-ASCII (comme "délégation"), Flutter peut avoir des problèmes pour lire/écrire des fichiers.

**Solution recommandée** : Déplacer le projet vers un chemin sans accents.

**Solutions alternatives** :

1. **Nettoyer complètement le projet et les daemons** :
   ```bash
   cd front
   flutter clean
   # Arrêter tous les daemons Gradle
   cd android
   ./gradlew --stop
   cd ..
   # Supprimer les dossiers de build
   Remove-Item -Recurse -Force .dart_tool
   Remove-Item -Recurse -Force build
   Remove-Item -Recurse -Force android\.gradle
   # Réessayer
   flutter pub get
   flutter build apk --release
   ```

2. **Utiliser un chemin court Windows** :
   ```powershell
   # Obtenir le chemin court (8.3)
   cmd /c dir /x "E:\suivi activité délégation"
   # Utiliser ce chemin court pour la compilation
   ```

3. **Créer un lien symbolique vers un chemin sans accents** :
   ```powershell
   # Créer un lien symbolique
   New-Item -ItemType SymbolicLink -Path "E:\suivi-activite-delegation" -Target "E:\suivi activité délégation"
   # Utiliser le nouveau chemin pour la compilation
   cd E:\suivi-activite-delegation\front
   flutter build apk --release
   ```

## Commandes utiles

```bash
# Nettoyer le projet
flutter clean

# Obtenir les dépendances
flutter pub get

# Vérifier les appareils connectés
flutter devices

# Construire et installer directement
flutter run --release

# Voir les logs de l'application
flutter logs
```

## Emplacement des fichiers générés

- **APK Debug** : `front/build/app/outputs/flutter-apk/app-debug.apk`
- **APK Release** : `front/build/app/outputs/flutter-apk/app-release.apk`
- **APK par architecture** : `front/build/app/outputs/flutter-apk/`
- **App Bundle** : `front/build/app/outputs/bundle/release/app-release.aab`
