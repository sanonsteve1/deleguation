# Guide de Génération d'APK - Solutions aux Problèmes

## ✅ Configuration Actuelle

L'URL du backend est configurée pour Render :
- **URL Production** : `https://fieldtrack-backend.onrender.com/ws`
- **Fichier de configuration** : `lib/config/api_config.dart`
- **Mode activé** : `useRender = true`

## 🔧 Solutions aux Problèmes de Build

### Problème 1 : Fichiers verrouillés dans le cache Gradle

**Symptôme** : `Unable to delete directory` dans `C:\Users\steve\.gradle\caches\transforms-3\`

**Solutions** :

#### Solution A : Utiliser le script de nettoyage
```powershell
cd E:\suivi-activite-delegation\front
.\nettoyer-et-build.ps1
```

#### Solution B : Nettoyer manuellement le cache Gradle
```powershell
# Arrêter tous les processus Java
Get-Process | Where-Object {$_.ProcessName -like "*java*"} | Stop-Process -Force

# Supprimer le cache transforms-3 (ATTENTION : cela supprimera tout le cache Gradle)
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\caches\transforms-3" -ErrorAction SilentlyContinue

# Réessayer
flutter clean
flutter pub get
flutter build apk --release
```

#### Solution C : Redémarrer l'ordinateur
Parfois, un redémarrage libère tous les fichiers verrouillés.

### Problème 2 : Crash JVM du daemon Gradle

**Symptôme** : `JVM crash log found` ou `Could not dispatch a message to the daemon`

**Solutions** :

1. **Arrêter tous les daemons** :
```powershell
cd front\android
.\gradlew --stop
```

2. **Vérifier la mémoire** dans `android/gradle.properties` :
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

3. **Générer un APK de debug** (moins exigeant) :
```powershell
flutter build apk --debug
```

### Problème 3 : Erreur AAPT (Android Asset Packaging Tool)

**Symptôme** : `AAPT: error: failed to open`

**Solutions** :

1. **Nettoyer complètement** :
```powershell
flutter clean
cd android
.\gradlew clean
cd ..
Remove-Item -Recurse -Force "build" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "android\build" -ErrorAction SilentlyContinue
```

2. **Générer sans tree-shake** :
```powershell
flutter build apk --release --no-tree-shake-icons
```

## 🎯 Méthodes Alternatives de Génération

### Méthode 1 : Android Studio (Recommandé si disponible)

1. Ouvrir Android Studio
2. File → Open → Sélectionner le dossier `front`
3. Attendre la synchronisation Gradle
4. Build → Build Bundle(s) / APK(s) → Build APK(s)
5. L'APK sera dans `front/build/app/outputs/flutter-apk/`

### Méthode 2 : Via Gradle directement

```powershell
cd front\android
.\gradlew assembleRelease
```

L'APK sera dans : `front\build\app\outputs\flutter-apk\app-release.apk`

### Méthode 3 : APK Split (plus léger)

```powershell
flutter build apk --split-per-abi --release
```

Cela génère 3 APK séparés (armeabi-v7a, arm64-v8a, x86_64)

## 📱 Après la Génération

Une fois l'APK généré :

1. **Localiser l'APK** :
   - Release : `front/build/app/outputs/flutter-apk/app-release.apk`
   - Debug : `front/build/app/outputs/flutter-apk/app-debug.apk`

2. **Installer sur un appareil Android** :
   - Transférer l'APK sur le téléphone
   - Autoriser l'installation depuis des sources inconnues
   - Installer l'APK

3. **Vérifier la connexion** :
   - L'application utilisera automatiquement `https://fieldtrack-backend.onrender.com/ws`
   - Vérifier dans les logs de l'application que la connexion fonctionne

## 🔍 Vérification de la Configuration

Pour vérifier que l'URL est correctement configurée :

1. Ouvrir `front/lib/config/api_config.dart`
2. Vérifier que `useRender = true`
3. Vérifier que `renderBaseUrl = 'https://fieldtrack-backend.onrender.com/ws'`

## 💡 Conseils

- **Si le build échoue toujours** : Redémarrer l'ordinateur et réessayer
- **Pour un build plus rapide** : Utiliser `--debug` au lieu de `--release`
- **Pour tester rapidement** : Utiliser `flutter run` sur un appareil connecté
- **Si Android Studio est installé** : C'est souvent plus fiable que la ligne de commande

## 📞 Support

Si les problèmes persistent :
1. Vérifier les logs détaillés : `flutter build apk --release --verbose`
2. Vérifier les logs Gradle : `front/android/.gradle/daemon/*.log`
3. Vérifier l'espace disque disponible
4. Vérifier que Java JDK est correctement installé
