# Solution : APK ne s'ouvre pas après installation

## ✅ Corrections appliquées

### 1. Désactivation de ProGuard/R8
- **Problème** : La minification peut supprimer du code nécessaire
- **Solution** : `minifyEnabled = false` et `shrinkResources = false` dans `build.gradle`

### 2. Simplification des permissions
- **Problème** : `ACCESS_BACKGROUND_LOCATION` nécessite une demande runtime complexe
- **Solution** : Permission désactivée temporairement dans `AndroidManifest.xml`

### 3. Ajout de logs dans MainActivity
- **Problème** : Impossible de diagnostiquer les erreurs
- **Solution** : Logs ajoutés dans `onCreate()` et `onStart()` pour voir où ça bloque

### 4. Configuration ProGuard
- **Problème** : ProGuard peut supprimer des classes Flutter
- **Solution** : Règles ProGuard créées pour garder toutes les classes nécessaires

## 🔨 Régénérer l'APK

### Option 1 : Script PowerShell (Recommandé)
```powershell
cd E:\suivi-activite-delegation\front
.\regenerer-apk-fix.ps1
```

### Option 2 : Commandes manuelles
```powershell
cd E:\suivi-activite-delegation\front

# Nettoyer
flutter clean
cd android
.\gradlew clean
cd ..

# Récupérer les dépendances
flutter pub get

# Générer l'APK
flutter build apk --release
```

## 📱 Tester l'application

1. **Désinstaller complètement** l'ancienne version de l'application
2. **Installer le nouvel APK** : `front/build/app/outputs/flutter-apk/app-release.apk`
3. **Lancer l'application**

## 🔍 Si l'application ne s'ouvre toujours pas

### Méthode 1 : Voir les logs Android (Recommandé)

**Prérequis** : Installer Android SDK Platform Tools et activer le débogage USB sur votre téléphone

```bash
# Connecter votre téléphone en USB avec débogage activé
adb devices  # Vérifier que le téléphone est détecté
adb logcat | grep -i "flutter\|error\|exception\|MainActivity\|FATAL"
```

Les logs vous diront exactement où l'application crash.

### Méthode 2 : Tester avec Flutter directement

```bash
cd front
flutter run --release
```

Cela affichera les erreurs en temps réel dans le terminal.

### Méthode 3 : Vérifier les permissions Android

1. Aller dans **Paramètres** → **Applications** → **FieldTrack Pro**
2. Vérifier que toutes les permissions sont accordées :
   - Localisation
   - Internet
   - Stockage

### Méthode 4 : Vérifier la version Android

L'application nécessite au minimum Android 5.0 (API 21). Vérifiez que votre téléphone est compatible.

## 🐛 Problèmes courants

### L'app s'installe mais ne s'ouvre pas du tout

**Causes possibles** :
1. **Erreur dans MainActivity** - Vérifier les logs avec `adb logcat`
2. **Problème de signature** - L'APK est signé avec des clés de debug (normal pour le test)
3. **Problème avec les dépendances natives** - Un plugin natif peut causer un crash au démarrage
4. **Version Android incompatible** - Vérifier `minSdkVersion`

**Solutions** :
- Vérifier les logs avec `adb logcat`
- Tester avec `flutter run --release` pour voir les erreurs
- Vérifier que tous les plugins sont compatibles avec votre version Android

### L'app s'ouvre puis se ferme immédiatement

**Cause probable** : Erreur non gérée au démarrage de Flutter

**Solution** : 
- Vérifier les logs avec `adb logcat`
- L'application devrait maintenant afficher un écran d'erreur au lieu de se fermer

### Erreur "App not installed"

**Causes possibles** :
1. **Signature différente** - Désinstaller l'ancienne version complètement
2. **APK corrompu** - Régénérer l'APK
3. **Espace insuffisant** - Vérifier l'espace disponible

**Solution** :
- Désinstaller complètement l'application
- Vérifier l'espace disponible
- Régénérer l'APK

## 📝 Fichiers modifiés

- `front/android/app/build.gradle` - Désactivation de la minification
- `front/android/app/src/main/AndroidManifest.xml` - Simplification des permissions
- `front/android/app/src/main/java/com/example/social_media/MainActivity.java` - Ajout de logs
- `front/android/app/proguard-rules.pro` - Règles ProGuard pour Flutter

## 🔄 Prochaines étapes

Si l'application ne s'ouvre toujours pas après ces corrections :

1. **Capturer les logs** avec `adb logcat` pour identifier l'erreur exacte
2. **Tester avec Flutter directement** avec `flutter run --release`
3. **Vérifier les dépendances natives** - Certains plugins peuvent causer des problèmes
4. **Tester sur un autre appareil** - Pour vérifier si c'est spécifique à votre téléphone

## 💡 Astuce

Si vous avez accès à Android Studio :
1. Ouvrir le projet dans Android Studio
2. Connecter votre téléphone
3. Exécuter l'application depuis Android Studio
4. Les logs seront affichés dans la console avec plus de détails
