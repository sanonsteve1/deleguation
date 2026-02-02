# 🎯 Étapes de Correction APK - Suivi

## ✅ Étape 1 : Fixer les versions SDK Android

**STATUS** : ✅ **TERMINÉ**

Les versions SDK ont été fixées dans `android/app/build.gradle` :

```gradle
compileSdk = 34
minSdk = 21
targetSdk = 34
```

**Avant** :
- `compileSdk = flutter.compileSdkVersion` (variable)
- `minSdk = flutter.minSdkVersion` (variable)
- `targetSdk = flutter.targetSdkVersion` (variable)

**Après** :
- `compileSdk = 34` (fixe)
- `minSdk = 21` (fixe - Android 5.0)
- `targetSdk = 34` (fixe - Android 14)

---

## 🔄 Étape 2 : Générer une APK universelle debug

**STATUS** : ⏳ **À EXÉCUTER**

### Commandes à exécuter :

```powershell
cd E:\suivi-activite-delegation\front

# 1. Nettoyer (déjà fait)
flutter clean

# 2. Récupérer les dépendances (déjà fait)
flutter pub get

# 3. Générer l'APK universelle debug
flutter build apk --debug --target-platform android-arm,android-arm64,android-x64
```

### Résultat attendu :

L'APK sera générée dans :
```
front/build/app/outputs/flutter-apk/app-debug.apk
```

### Tester l'APK :

1. **Désinstaller** complètement l'ancienne version de l'application
2. **Installer** le nouvel APK : `app-debug.apk`
3. **Lancer** l'application
4. **Vérifier** si l'application s'ouvre correctement

### Si l'APK fonctionne :

✅ Passer à l'étape suivante : générer l'APK release

### Si l'APK ne fonctionne toujours pas :

➡️ Passer à l'**Étape 3** : Tester sans workmanager

---

## 🔄 Étape 3 : Tester sans workmanager (si toujours KO)

**STATUS** : ⏳ **EN ATTENTE** (si Étape 2 échoue)

### Modifications à faire :

#### Option A : Désactiver workmanager dans main.dart (temporaire)

Le code est déjà commenté dans `main.dart`, mais vérifier qu'il n'y a pas d'autres références.

#### Option B : Retirer workmanager du pubspec.yaml (temporaire)

1. **Commenter** workmanager dans `pubspec.yaml` :
```yaml
dependencies:
  # workmanager: ^0.9.0  # Désactivé temporairement pour test
```

2. **Exécuter** :
```powershell
flutter pub get
flutter clean
flutter build apk --debug --target-platform android-arm,android-arm64,android-x64
```

3. **Tester** l'APK

4. **Si ça fonctionne** : workmanager cause le problème
5. **Si ça ne fonctionne pas** : le problème vient d'ailleurs

### Vérifier les autres plugins problématiques :

Si workmanager n'est pas le problème, tester en désactivant d'autres plugins un par un :

1. `geolocator` (si pas utilisé au démarrage)
2. `connectivity_plus` (si pas utilisé au démarrage)
3. `shared_preferences` (si pas utilisé au démarrage)

---

## 📋 Checklist de Diagnostic

### Après chaque étape, vérifier :

- [ ] L'APK se génère sans erreur
- [ ] L'APK s'installe sur le téléphone
- [ ] L'application s'ouvre (pas de crash immédiat)
- [ ] L'écran de connexion s'affiche
- [ ] Pas d'erreur dans les logs (`adb logcat`)

### Si l'application crash toujours :

1. **Voir les logs** :
```powershell
adb logcat | Select-String -Pattern "flutter|error|exception|fatal|MainActivity"
```

2. **Chercher** :
   - `FATAL EXCEPTION`
   - `MainActivity onCreate`
   - `[Main] Démarrage de l'application...`
   - `[FlutterError]`

3. **Copier** le stacktrace complet

---

## 🔧 Commandes Utiles

### Vérifier les logs en temps réel :
```powershell
adb logcat | Select-String -Pattern "flutter|error|exception|fatal|MainActivity" -CaseSensitive:$false
```

### Voir uniquement les erreurs :
```powershell
adb logcat *:E
```

### Tester avec Flutter directement :
```powershell
flutter run --release
```

### Générer APK release (après que debug fonctionne) :
```powershell
flutter build apk --release --target-platform android-arm,android-arm64,android-x64
```

---

## 📝 Notes

- Les versions SDK sont maintenant **fixées** (pas de variables Flutter)
- L'APK debug est plus facile à déboguer que l'APK release
- Workmanager est déjà désactivé au démarrage dans `main.dart`
- Si workmanager cause toujours des problèmes, le retirer complètement du `pubspec.yaml`

---

## ✅ Prochaines Actions

1. **Exécuter** l'Étape 2 : Générer l'APK universelle debug
2. **Tester** l'APK sur le téléphone
3. **Si KO** : Passer à l'Étape 3 (tester sans workmanager)
4. **Si OK** : Générer l'APK release avec les mêmes paramètres
