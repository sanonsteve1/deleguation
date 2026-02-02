# Diagnostic - Problème de Suivi d'Itinéraire

## Problème
L'itinéraire de l'agent n'est pas suivi correctement - les positions GPS ne sont pas enregistrées ou affichées.

## Solutions Appliquées

### 1. Amélioration des Logs de Débogage
- ✅ Ajout de logs détaillés dans `LocationService` pour tracer les permissions GPS
- ✅ Ajout de logs dans `SessionService` pour suivre l'enregistrement des positions
- ✅ Ajout de logs dans le service Angular pour le chargement des positions

### 2. Amélioration de la Gestion des Permissions GPS
- ✅ Amélioration de la demande de permissions GPS
- ✅ Gestion des erreurs de précision GPS (fallback sur précision moyenne)
- ✅ Ajout de timeouts pour éviter les blocages

### 3. Amélioration du Timer GPS
- ✅ Enregistrement immédiat d'une première position au démarrage
- ✅ Meilleure gestion des erreurs (le timer continue même en cas d'erreur temporaire)
- ✅ Logs détaillés pour chaque tentative d'enregistrement

## Vérifications à Effectuer

### 1. Vérifier les Permissions GPS
1. Ouvrir les paramètres de l'application Android
2. Vérifier que les permissions de localisation sont accordées
3. Pour Android 10+, vérifier aussi la permission "Localisation en arrière-plan"

### 2. Vérifier les Logs
Dans l'application Flutter, vérifier les logs avec :
```bash
flutter logs
```

Vous devriez voir des messages comme :
- `[LocationService] Permission accordée`
- `[SessionService] Enregistrement position GPS pour session: X`
- `[SessionService] Position enregistrée avec succès sur le serveur`

### 3. Vérifier la Base de Données
Vérifier dans la base de données que les positions sont bien enregistrées :
```sql
SELECT COUNT(*) FROM position_gps WHERE id_session = [ID_SESSION];
```

### 4. Vérifier le Backend
Vérifier les logs du backend pour voir si les requêtes arrivent :
- Endpoint: `POST /ws/positions`
- Vérifier les logs Spring Boot

### 5. Vérifier le Frontend Angular
Dans la console du navigateur (F12), vérifier :
- Les appels API vers `/ws/positions/session/{sessionId}`
- Les erreurs éventuelles dans la console
- Le nombre de positions chargées

## Problèmes Connus et Solutions

### Problème 1: Le Timer ne fonctionne pas en arrière-plan
**Symptôme**: Les positions ne sont pas enregistrées quand l'application est en arrière-plan.

**Solution**: 
- Pour Android, le timer Flutter ne fonctionne pas en arrière-plan par défaut
- **Solution temporaire**: Garder l'application ouverte pendant la session
- **Solution future**: Utiliser un plugin de background location comme `workmanager` ou `geolocator` avec background mode

### Problème 2: Permissions GPS refusées
**Symptôme**: Erreur "Permission de localisation refusée"

**Solution**:
1. Aller dans les paramètres Android
2. Applications > FieldTrack Pro > Permissions
3. Activer "Localisation" et "Localisation en arrière-plan" (Android 10+)

### Problème 3: Positions non synchronisées
**Symptôme**: Les positions sont enregistrées localement mais pas sur le serveur

**Solution**:
- Vérifier la connexion Internet
- Le service de synchronisation devrait synchroniser automatiquement toutes les 30 secondes
- Vérifier les logs pour voir les erreurs de synchronisation

### Problème 4: Aucune position affichée sur la carte
**Symptôme**: La carte s'affiche mais aucun itinéraire n'est visible

**Vérifications**:
1. Vérifier que la session a bien des positions dans la base de données
2. Vérifier la console du navigateur pour les erreurs
3. Vérifier que les filtres (agent, date) ne masquent pas les sessions

## Tests à Effectuer

### Test 1: Démarrage de Session
1. Démarrer une session depuis l'application Flutter
2. Vérifier les logs: `[SessionService] Session démarrée avec succès`
3. Vérifier les logs: `[SessionService] Timer GPS démarré`
4. Attendre 1-2 minutes et vérifier qu'une position est enregistrée

### Test 2: Enregistrement de Positions
1. Laisser la session active pendant au moins 5 minutes
2. Vérifier les logs toutes les 5 minutes: `[SessionService] Enregistrement position GPS`
3. Vérifier dans la base de données que les positions sont enregistrées

### Test 3: Affichage sur la Carte
1. Aller sur la page de visualisation de carte dans le frontend Angular
2. Sélectionner une session avec des positions
3. Vérifier que l'itinéraire s'affiche sur la carte
4. Vérifier la console du navigateur pour les logs

## Commandes Utiles

### Voir les logs Flutter
```bash
cd front
flutter logs
```

### Voir les logs du backend
```bash
cd backend
./gradlew bootRun
# Les logs apparaissent dans la console
```

### Vérifier la base de données
```sql
-- Voir toutes les positions d'une session
SELECT * FROM position_gps WHERE id_session = [ID_SESSION] ORDER BY timestamp;

-- Compter les positions par session
SELECT id_session, COUNT(*) as nb_positions 
FROM position_gps 
GROUP BY id_session;
```

## Prochaines Améliorations

1. **Background Location Tracking**: Implémenter un vrai suivi en arrière-plan avec `workmanager`
2. **Notifications**: Notifier l'utilisateur si le GPS est désactivé
3. **Optimisation**: Réduire la fréquence d'enregistrement si l'agent est immobile
4. **Geofencing**: Détecter quand l'agent entre/sort d'une zone
