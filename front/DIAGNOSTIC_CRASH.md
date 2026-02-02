# Diagnostic : Application qui crash au démarrage

## ✅ Corrections appliquées

1. **Suppression de SyncService au démarrage** - Évite les problèmes de connectivité
2. **Suppression de la vérification d'authentification au démarrage** - Affiche directement l'écran de connexion
3. **Désactivation de Workmanager** - Évite les crashes liés aux services en arrière-plan
4. **Désactivation du formatage des dates** - Évite les problèmes de locale
5. **Gestion d'erreur renforcée** - Toutes les erreurs sont capturées

## 🔍 Prochaines étapes de diagnostic

### Si l'application crash toujours :

1. **Vérifier les logs Android** (si possible avec ADB) :
   ```bash
   adb logcat | grep -i "flutter\|error\|exception\|fatal"
   ```

2. **Tester avec Flutter directement** :
   ```bash
   cd front
   flutter run --release
   ```
   Cela affichera les erreurs en temps réel.

3. **Vérifier les permissions Android** :
   - Aller dans **Paramètres** → **Applications** → **FieldTrack Pro**
   - Vérifier que toutes les permissions sont accordées

4. **Tester avec la version minimale** :
   - Renommer `main_test.dart` en `main.dart` temporairement
   - Cette version affiche uniquement l'écran de connexion sans aucune initialisation

## 🐛 Causes possibles

### 1. Problème avec SharedPreferences
- **Symptôme** : Crash immédiat au démarrage
- **Solution** : Vérifier les permissions de stockage

### 2. Problème avec la configuration réseau
- **Symptôme** : Crash lors de la connexion au backend
- **Solution** : Vérifier `network_security_config.xml`

### 3. Problème avec les permissions Android
- **Symptôme** : Crash lors de l'accès aux services système
- **Solution** : Vérifier `AndroidManifest.xml` et les permissions

### 4. Problème avec les dépendances natives
- **Symptôme** : Crash au chargement des plugins
- **Solution** : Vérifier que tous les plugins sont compatibles

## 📝 Version actuelle

- **main.dart** : Version simplifiée qui affiche directement LoginScreen
- **SyncService** : Désactivé au démarrage
- **Workmanager** : Désactivé
- **Formatage dates** : Désactivé

## 🔄 Pour réactiver les fonctionnalités

Une fois que l'application démarre correctement :

1. Réactiver la vérification d'authentification dans `main.dart`
2. Réactiver SyncService progressivement
3. Réactiver Workmanager si nécessaire
4. Réactiver le formatage des dates
