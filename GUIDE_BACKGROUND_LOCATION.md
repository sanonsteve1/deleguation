# Guide d'Utilisation - Suivi GPS en Arrière-Plan

## ✅ Implémentation Complétée

Le suivi GPS en arrière-plan a été implémenté avec succès en utilisant :
- **geolocator** avec `getPositionStream` pour le suivi continu
- **workmanager** pour les tâches périodiques (optionnel)

## 📱 Configuration des Permissions

### Android

Les permissions sont déjà configurées dans `AndroidManifest.xml` :
- ✅ `ACCESS_FINE_LOCATION` - Localisation précise
- ✅ `ACCESS_COARSE_LOCATION` - Localisation approximative
- ✅ `ACCESS_BACKGROUND_LOCATION` - Localisation en arrière-plan (Android 10+)
- ✅ `FOREGROUND_SERVICE` - Service en avant-plan
- ✅ `FOREGROUND_SERVICE_LOCATION` - Service de localisation en avant-plan

**Important pour Android 10+** :
1. L'utilisateur doit activer manuellement la permission "Localisation en arrière-plan" dans les paramètres
2. Paramètres > Applications > FieldTrack Pro > Permissions > Localisation > "Autoriser tout le temps"

### iOS

Les permissions sont déjà configurées dans `Info.plist` :
- ✅ `NSLocationWhenInUseUsageDescription` - Localisation en cours d'utilisation
- ✅ `NSLocationAlwaysAndWhenInUseUsageDescription` - Localisation toujours (avec utilisation)
- ✅ `NSLocationAlwaysUsageDescription` - Localisation toujours

**Important pour iOS** :
1. L'utilisateur doit autoriser "Toujours" lors de la demande de permission
2. Paramètres > Confidentialité > Localisation > FieldTrack Pro > "Toujours"

## 🔧 Fonctionnement

### Comment ça marche

1. **Démarrage de session** : Quand l'agent démarre une session, le service de background location démarre automatiquement
2. **Suivi continu** : Le service utilise `getPositionStream` de geolocator pour recevoir les positions en continu
3. **Enregistrement** : Chaque position est automatiquement enregistrée sur le serveur (ou en local si offline)
4. **Arrière-plan** : Le suivi continue même quand l'application est en arrière-plan ou fermée (si permissions accordées)

### Paramètres de suivi

- **Intervalle** : Position enregistrée toutes les 5 minutes (ou si déplacement de 10m minimum)
- **Précision** : Haute précision (GPS)
- **Distance minimale** : 10 mètres (évite d'enregistrer si l'agent est immobile)

## 🧪 Tests

### Test 1 : Vérifier le démarrage du suivi

1. Démarrer une session depuis l'application
2. Vérifier les logs :
   ```
   [SessionService] Démarrage du suivi GPS en arrière-plan pour la session: X
   [BackgroundLocationService] Démarrage du suivi GPS en arrière-plan
   [BackgroundLocationService] Stream GPS démarré avec succès
   ```

### Test 2 : Vérifier le suivi en arrière-plan

1. Démarrer une session
2. Mettre l'application en arrière-plan (bouton Home)
3. Attendre 5-10 minutes
4. Vérifier dans la base de données que les positions sont enregistrées :
   ```sql
   SELECT * FROM position_gps 
   WHERE id_session = [ID_SESSION] 
   ORDER BY timestamp DESC;
   ```

### Test 3 : Vérifier les permissions

1. Aller dans les paramètres Android/iOS
2. Vérifier que les permissions de localisation sont accordées
3. Pour Android 10+, vérifier que "Localisation en arrière-plan" est activée

## 🐛 Dépannage

### Problème : Le suivi ne fonctionne pas en arrière-plan

**Solutions** :
1. Vérifier les permissions dans les paramètres système
2. Pour Android 10+, activer manuellement "Localisation en arrière-plan"
3. Vérifier que le GPS est activé sur le téléphone
4. Vérifier les logs pour voir les erreurs

### Problème : Les positions ne sont pas enregistrées

**Vérifications** :
1. Vérifier la connexion Internet
2. Vérifier que la session est toujours active
3. Vérifier les logs du backend
4. Vérifier la base de données

### Problème : Permission refusée

**Solutions** :
1. Aller dans les paramètres de l'application
2. Réinitialiser les permissions
3. Redémarrer l'application
4. Réessayer de démarrer une session

## 📊 Logs Utiles

### Logs Flutter

```bash
cd front
flutter logs
```

Rechercher :
- `[BackgroundLocationService]` - Logs du service de background
- `[SessionService]` - Logs du service de session
- `[LocationService]` - Logs du service de localisation

### Logs Backend

Vérifier les logs Spring Boot pour voir les requêtes POST vers `/ws/positions`

## 🔄 Fallback

Si le suivi en arrière-plan ne fonctionne pas (permissions refusées), le système bascule automatiquement sur un timer périodique qui fonctionne quand l'application est ouverte.

## 📝 Notes Importantes

1. **Batterie** : Le suivi GPS en arrière-plan consomme de la batterie. C'est normal.
2. **Android 10+** : La permission "Localisation en arrière-plan" doit être activée manuellement par l'utilisateur dans les paramètres.
3. **iOS** : L'utilisateur doit choisir "Toujours" lors de la demande de permission.
4. **Précision** : La précision peut varier selon l'environnement (intérieur/extérieur, conditions météo, etc.)

## 🚀 Prochaines Améliorations

- [ ] Notification persistante pour indiquer que le suivi est actif
- [ ] Optimisation de la consommation de batterie (réduire la fréquence si immobile)
- [ ] Geofencing pour détecter les zones d'intérêt
- [ ] Statistiques de précision GPS
