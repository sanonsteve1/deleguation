# Diagnostic sans ADB

## ✅ Solution 1 : Utiliser Flutter directement (Recommandé)

Flutter peut afficher les logs directement sans avoir besoin d'ADB installé.

### Étape 1 : Préparer votre téléphone
1. Activer le **Débogage USB** :
   - Paramètres → À propos du téléphone
   - Appuyer 7 fois sur "Numéro de build" pour activer les options développeur
   - Paramètres → Options développeur → Activer "Débogage USB"
2. Connecter votre téléphone en USB
3. Autoriser le débogage USB quand demandé sur le téléphone

### Étape 2 : Lancer avec Flutter
```powershell
cd E:\suivi-activite-delegation\front
.\voir-logs-flutter.ps1
```

Ou manuellement :
```powershell
cd E:\suivi-activite-delegation\front
flutter run --release
```

Flutter affichera tous les logs en temps réel, y compris les erreurs.

## ✅ Solution 2 : Installer ADB

Si vous préférez utiliser ADB directement :

### Option A : Installer Android Studio (Complet)
1. Télécharger Android Studio : https://developer.android.com/studio
2. Installer Android Studio
3. ADB sera installé automatiquement dans :
   ```
   C:\Users\VotreNom\AppData\Local\Android\Sdk\platform-tools
   ```
4. Ajouter ce dossier au PATH système :
   - Paramètres → Système → À propos → Paramètres système avancés
   - Variables d'environnement → Path → Modifier
   - Ajouter : `C:\Users\VotreNom\AppData\Local\Android\Sdk\platform-tools`

### Option B : Installer uniquement Platform Tools
1. Télécharger Platform Tools : https://developer.android.com/tools/releases/platform-tools
2. Extraire dans un dossier (ex: `C:\platform-tools`)
3. Ajouter au PATH système (voir Option A)

### Utiliser ADB après installation
```powershell
# Vérifier que le téléphone est connecté
adb devices

# Voir les logs
adb logcat | Select-String -Pattern "flutter|error|exception|MainActivity|FATAL"
```

## ✅ Solution 3 : Utiliser Android Studio

Si vous avez Android Studio installé :

1. Ouvrir Android Studio
2. Ouvrir le projet : `E:\suivi-activite-delegation\front\android`
3. Connecter votre téléphone
4. Exécuter l'application depuis Android Studio
5. Les logs s'afficheront dans la console "Logcat"

## 🔍 Que chercher dans les logs

### Erreurs courantes :

1. **"FATAL EXCEPTION"** - Crash de l'application
   - Notez le message d'erreur complet
   - Notez la classe et la ligne où ça crash

2. **"Permission denied"** - Problème de permissions
   - Vérifier les permissions dans AndroidManifest.xml

3. **"ClassNotFoundException"** - Classe manquante
   - Problème avec ProGuard ou dépendances

4. **"UnsatisfiedLinkError"** - Bibliothèque native manquante
   - Problème avec un plugin natif

5. **"FlutterException"** - Erreur Flutter
   - Erreur dans le code Dart

## 📝 Exemple de logs à capturer

Quand vous lancez l'application, cherchez :
```
MainActivity onCreate - Démarrage
MainActivity onCreate - Succès
MainActivity onStart
[Main] Démarrage de l'application...
[FlutterError] ...
[PlatformError] ...
```

Si vous ne voyez pas ces logs, l'application crash avant même d'arriver à Flutter.

## 🐛 Problèmes spécifiques

### L'app ne s'ouvre pas du tout
- Vérifier les logs avec `flutter run --release`
- Chercher "FATAL EXCEPTION" dans les logs
- Vérifier que MainActivity s'exécute (chercher "MainActivity onCreate")

### L'app s'ouvre puis se ferme immédiatement
- Vérifier les logs Flutter (chercher "[FlutterError]")
- Vérifier les permissions Android
- Vérifier la configuration réseau

### Erreur de permission
- Vérifier AndroidManifest.xml
- Vérifier que les permissions sont demandées au runtime si nécessaire

## 💡 Astuce

Pour capturer les logs dans un fichier :
```powershell
flutter run --release 2>&1 | Tee-Object -FilePath logs.txt
```

Ensuite, ouvrez `logs.txt` pour analyser les erreurs.
