# Installation et Configuration du Suivi GPS en Arrière-plan

## ✅ Modifications Apportées

### 1. Plugin Workmanager
Le plugin `workmanager` a été ajouté au projet pour permettre le suivi GPS même quand l'application est fermée.

### 2. Nouveau Service
- **`background_location_worker.dart`** : Callback qui s'exécute en arrière-plan toutes les 5 minutes pour enregistrer la position GPS

### 3. Modifications du SessionService
- Utilisation de `workmanager` pour le suivi en arrière-plan
- Conservation du suivi continu (`getPositionStream`) quand l'app est ouverte pour une meilleure précision
- Arrêt automatique de `workmanager` quand la session se termine

## 📋 Étapes d'Installation

### 1. Installer les Dépendances
```bash
cd front
flutter pub get
```

### 2. Configuration Android

Les permissions sont déjà configurées dans `AndroidManifest.xml` :
- ✅ `ACCESS_FINE_LOCATION`
- ✅ `ACCESS_COARSE_LOCATION`
- ✅ `ACCESS_BACKGROUND_LOCATION`
- ✅ `FOREGROUND_SERVICE`
- ✅ `FOREGROUND_SERVICE_LOCATION`
- ✅ `WAKE_LOCK`

### 3. Configuration iOS (si nécessaire)

Pour iOS, ajouter dans `ios/Runner/Info.plist` :
```xml
<key>UIBackgroundModes</key>
<array>
    <string>location</string>
</array>
```

### 4. Permissions Utilisateur

**IMPORTANT** : Pour Android 10+, l'utilisateur doit activer manuellement la permission "Localisation en arrière-plan" :

1. Aller dans **Paramètres** > **Applications** > **FieldTrack Pro** > **Permissions**
2. Activer **"Localisation"**
3. Activer **"Localisation en arrière-plan"** (si disponible)

## 🔧 Comment ça Fonctionne

### Quand l'Application est Ouverte
- Le service `BackgroundLocationService` utilise `getPositionStream` pour un suivi continu
- Les positions sont enregistrées en temps réel

### Quand l'Application est en Arrière-plan ou Fermée
- `workmanager` exécute une tâche toutes les 5 minutes
- La tâche récupère la position GPS et l'enregistre sur le serveur
- Si le serveur n'est pas accessible, la position est sauvegardée localement pour synchronisation ultérieure

## 🧪 Tests

### Test 1: Vérifier que Workmanager est Initialisé
1. Démarrer une session
2. Vérifier les logs : `[SessionService] Workmanager configuré pour le suivi en arrière-plan`

### Test 2: Tester le Suivi en Arrière-plan
1. Démarrer une session
2. Mettre l'application en arrière-plan (bouton Home)
3. Attendre 5-10 minutes
4. Vérifier dans la base de données que les positions sont enregistrées

### Test 3: Tester avec l'Application Fermée
1. Démarrer une session
2. Fermer complètement l'application (swipe dans le gestionnaire de tâches)
3. Attendre 5-10 minutes
4. Rouvrir l'application
5. Vérifier dans la base de données que les positions ont été enregistrées

## 📊 Logs de Débogage

Les logs suivants vous aideront à diagnostiquer les problèmes :

```
[SessionService] Démarrage du suivi GPS en arrière-plan pour la session: X
[SessionService] Workmanager configuré pour le suivi en arrière-plan
[BackgroundLocationWorker] Tâche exécutée: backgroundLocationTask
[BackgroundLocationWorker] Position obtenue: lat=X, lon=Y
[BackgroundLocationWorker] Position enregistrée avec succès sur le serveur
```

## ⚠️ Limitations

1. **Android 10+** : La permission "Localisation en arrière-plan" doit être activée manuellement par l'utilisateur
2. **Batterie** : Le suivi GPS consomme de la batterie. Android peut limiter les tâches en arrière-plan si la batterie est faible
3. **Optimisation de la Batterie** : L'utilisateur doit désactiver l'optimisation de la batterie pour FieldTrack Pro dans les paramètres Android

## 🔍 Dépannage

### Problème : Les positions ne sont pas enregistrées en arrière-plan

**Solutions** :
1. Vérifier que la permission "Localisation en arrière-plan" est activée
2. Désactiver l'optimisation de la batterie pour l'application
3. Vérifier les logs : `flutter logs`
4. Vérifier que `workmanager` est bien initialisé dans `main.dart`

### Problème : Workmanager ne s'exécute pas

**Solutions** :
1. Vérifier que `Workmanager().initialize()` est appelé dans `main.dart`
2. Vérifier que la tâche est bien enregistrée : `[SessionService] Workmanager configuré`
3. Redémarrer l'application après l'installation

### Problème : Permission refusée

**Solutions** :
1. Aller dans les paramètres Android
2. Applications > FieldTrack Pro > Permissions
3. Activer "Localisation" et "Localisation en arrière-plan"
4. Redémarrer l'application

## 📝 Notes Techniques

- **Fréquence** : Les positions sont enregistrées toutes les 5 minutes
- **Précision** : `LocationAccuracy.high` pour une précision maximale
- **Mode Offline** : Les positions sont sauvegardées localement si le serveur n'est pas accessible
- **Synchronisation** : Le `SyncService` synchronise automatiquement les positions en attente

## 🚀 Prochaines Améliorations

1. **Adaptive Frequency** : Ajuster la fréquence selon la vitesse de déplacement
2. **Geofencing** : Détecter les zones importantes
3. **Notifications** : Notifier l'utilisateur si le GPS est désactivé
4. **Optimisation Batterie** : Réduire la fréquence si l'agent est immobile
