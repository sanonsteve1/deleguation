# Guide de Diagnostic : APK ne s'ouvre pas après installation

## 🔍 Diagnostic étape par étape

### Étape 1 : Vérifier les logs Android (Méthode recommandée)

**Prérequis** : Installer [Android SDK Platform Tools](https://developer.android.com/studio/releases/platform-tools) et activer le débogage USB sur votre téléphone.

```powershell
# 1. Connecter votre téléphone en USB avec débogage activé
# 2. Vérifier que le téléphone est détecté
adb devices

# 3. Filtrer les logs pour voir les erreurs
adb logcat | Select-String -Pattern "flutter|error|exception|fatal|MainActivity" -CaseSensitive:$false
```

**Ce que vous devez chercher** :
- `MainActivity onCreate - Démarrage` → L'activité démarre
- `MainActivity onCreate - Succès` → L'activité s'est initialisée
- `[Main] Démarrage de l'application...` → Flutter démarre
- `FATAL EXCEPTION` → Crash de l'application (notez le message complet)
- `Permission denied` → Problème de permissions
- `ClassNotFoundException` → Classe manquante (ProGuard ou dépendance)

### Étape 2 : Tester avec Flutter directement

```powershell
cd E:\suivi-activite-delegation\front
flutter run --release
```

Cette commande affichera les erreurs en temps réel dans le terminal.

### Étape 3 : Vérifier les permissions Android

1. Aller dans **Paramètres** → **Applications** → **FieldTrack Pro**
2. Vérifier que toutes les permissions sont accordées :
   - Localisation
   - Internet
   - Stockage (si nécessaire)

### Étape 4 : Vérifier la version Android

L'application nécessite au minimum **Android 5.0 (API 21)**. Vérifiez que votre téléphone est compatible.

## 🐛 Problèmes courants et solutions

### Problème 1 : L'app ne s'ouvre pas du tout (écran noir ou retour immédiat)

**Causes possibles** :
1. **Crash silencieux dans MainActivity**
   - ✅ **Corrigé** : Gestion d'erreur améliorée dans MainActivity.java
   - Vérifier les logs avec `adb logcat`

2. **Erreur dans le code Flutter au démarrage**
   - ✅ **Corrigé** : Gestion d'erreur globale dans main.dart
   - L'application devrait maintenant afficher un écran d'erreur au lieu de se fermer

3. **Ressource manquante (logo, icône, etc.)**
   - Le logo a un `errorBuilder` qui affiche une icône par défaut
   - Vérifier que `ic_launcher` existe dans `android/app/src/main/res/mipmap/`

4. **Problème avec les plugins natifs**
   - Vérifier les logs pour voir quel plugin cause le problème
   - Les plugins `geolocator` et `workmanager` sont désactivés au démarrage

### Problème 2 : L'app s'ouvre puis se ferme immédiatement

**Causes possibles** :
1. **Erreur non gérée dans LoginScreen**
   - Vérifier les logs Flutter
   - L'application devrait maintenant capturer toutes les erreurs

2. **Problème de connexion réseau**
   - Vérifier que l'URL du backend est correcte dans `lib/config/api_config.dart`
   - Vérifier que le téléphone a une connexion Internet

3. **Problème avec SharedPreferences**
   - Vérifier les permissions de stockage
   - L'application devrait continuer même si SharedPreferences échoue

### Problème 3 : Erreur "App not installed"

**Causes possibles** :
1. **Signature différente** - Désinstaller complètement l'ancienne version
2. **APK corrompu** - Régénérer l'APK
3. **Espace insuffisant** - Vérifier l'espace disponible

## ✅ Corrections appliquées

1. **Gestion d'erreur améliorée dans MainActivity**
   - Capture des exceptions et erreurs
   - Logs détaillés pour le diagnostic
   - Ne crash plus silencieusement

2. **Gestion d'erreur globale dans main.dart**
   - Capture de toutes les erreurs Flutter
   - Affichage d'un écran d'erreur au lieu d'un crash
   - Logs détaillés pour le diagnostic

3. **Désactivation des fonctionnalités problématiques**
   - Workmanager désactivé au démarrage
   - Formatage des dates désactivé
   - Synchronisation désactivée au démarrage

## 🔨 Régénérer l'APK avec les corrections

### Option 1 : Script PowerShell (Recommandé)

```powershell
cd E:\suivi-activite-delegation\front
.\nettoyer-et-build.ps1
```

### Option 2 : Commandes manuelles

```powershell
cd E:\suivi-activite-delegation\front

# Nettoyer complètement
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
4. **Vérifier les logs** si l'application ne s'ouvre toujours pas

## 📝 Logs à capturer

Quand vous lancez l'application, vous devriez voir dans les logs :

```
MainActivity onCreate - Démarrage
MainActivity onCreate - Succès
MainActivity onStart
MainActivity onStart - Succès
MainActivity onResume
MainActivity onResume - Succès
[Main] Initialisation de Flutter...
[Main] Flutter initialisé avec succès
[Main] Démarrage de l'application...
[Main] Application démarrée avec succès
```

Si vous ne voyez pas ces logs, l'application crash avant même d'arriver à Flutter.

## 💡 Astuce : Capturer les logs dans un fichier

```powershell
# Avec ADB
adb logcat > logs.txt

# Avec Flutter
flutter run --release 2>&1 | Tee-Object -FilePath logs.txt
```

Ensuite, ouvrez `logs.txt` pour analyser les erreurs.

## 🔗 Ressources utiles

- [Android Debug Bridge (ADB)](https://developer.android.com/studio/command-line/adb)
- [Flutter Debugging](https://docs.flutter.dev/testing/debugging)
- [Android Logcat](https://developer.android.com/studio/command-line/logcat)
