# Guide de Débogage - Application qui ne s'ouvre pas

## 🔍 Comment diagnostiquer le problème

### Méthode 1 : Vérifier les logs Android (Recommandé)

1. **Connecter votre téléphone en USB** avec le débogage USB activé

2. **Ouvrir un terminal** et exécuter :
   ```bash
   adb logcat | grep -i "flutter\|fieldtrack\|error\|exception\|fatal"
   ```

3. **Lancer l'application** sur votre téléphone

4. **Observer les logs** pour identifier l'erreur

### Méthode 2 : Utiliser Flutter pour voir les logs

```bash
cd front
flutter run --release
```

Cela affichera les erreurs en temps réel.

### Méthode 3 : Vérifier les logs via ADB

```bash
# Voir tous les logs
adb logcat

# Filtrer les erreurs Flutter
adb logcat | grep -E "Flutter|Dart|Error|Exception"

# Voir les crashs
adb logcat *:E
```

## 🐛 Problèmes courants et solutions

### Problème 1 : Erreur de connexion réseau

**Symptôme** : L'app crash au démarrage lors de la connexion au backend

**Solution** : 
- Vérifier que l'URL du backend est correcte dans `lib/config/api_config.dart`
- Vérifier que le téléphone a une connexion Internet
- Vérifier que l'URL Render est accessible : `https://fieldtrack-backend.onrender.com/ws`

### Problème 2 : Erreur de permissions

**Symptôme** : L'app demande des permissions mais crash après

**Solution** :
- Vérifier que toutes les permissions sont dans `AndroidManifest.xml`
- Accorder manuellement les permissions dans Paramètres → Applications → FieldTrack Pro → Permissions

### Problème 3 : Erreur Workmanager

**Symptôme** : Crash lors de l'initialisation de Workmanager

**Solution** :
- L'application devrait continuer même si Workmanager échoue (gestion d'erreur ajoutée)
- Si le problème persiste, vérifier les logs

### Problème 4 : Erreur de formatage des dates

**Symptôme** : Crash lors de l'initialisation du formatage des dates

**Solution** :
- L'application devrait continuer même si le formatage échoue (gestion d'erreur ajoutée)

## 🔧 Corrections apportées

1. **Gestion globale des erreurs** : Toutes les erreurs sont maintenant capturées et loggées
2. **Gestion d'erreur dans l'authentification** : Try-catch ajouté
3. **Configuration réseau HTTPS** : Fichier `network_security_config.xml` créé
4. **Affichage d'erreur** : Si l'app crash, un écran d'erreur s'affiche au lieu de fermer

## 📱 Étapes de débogage

1. **Installer l'APK** sur votre téléphone
2. **Connecter le téléphone en USB** avec débogage activé
3. **Exécuter** : `adb logcat | grep -i "flutter\|error"`
4. **Lancer l'application**
5. **Copier les logs** et les analyser

## 💡 Solution rapide

Si l'application ne s'ouvre toujours pas après les corrections :

1. **Désinstaller complètement** l'application
2. **Réinstaller** l'APK
3. **Vérifier les permissions** dans les paramètres Android
4. **Vérifier la connexion Internet**

## 📞 Informations à fournir pour le support

Si le problème persiste, fournir :
- Les logs complets (`adb logcat`)
- La version d'Android
- Le modèle du téléphone
- L'erreur exacte affichée (si visible)
