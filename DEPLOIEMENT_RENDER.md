# Guide de Déploiement sur Render

Ce guide vous explique comment déployer le backend FieldTrack Pro sur Render.

## 📋 Prérequis

1. Un compte Render (gratuit) : https://render.com
2. Votre projet connecté à GitHub (déjà fait ✅)

## 🚀 Étapes de Déploiement

### Option 1 : Déploiement Automatique avec render.yaml (Recommandé)

1. **Créer d'abord la Base de Données PostgreSQL :**
   - Allez sur https://dashboard.render.com
   - Cliquez sur "New +" → "PostgreSQL"
   - Configurez :
     - **Name**: `fieldtrack-db`
     - **Database**: `fieldtrack`
     - **User**: `fieldtrack_user`
     - **Region**: `Frankfurt` (ou votre région préférée)
     - **Plan**: `Free` (pour commencer)
   - Notez les informations de connexion

2. **Connecter votre dépôt GitHub à Render :**
   - Cliquez sur "New +" → "Blueprint"
   - Connectez votre dépôt GitHub `sanonsteve1/deleguation`
   - Render détectera automatiquement le fichier `render.yaml` à la racine

3. **Lier la Base de Données au Service Web :**
   - Après la création du service web, allez dans ses paramètres
   - Allez dans "Environment" → "Link Database"
   - Sélectionnez votre base de données `fieldtrack-db`
   - Render ajoutera automatiquement la variable `DATABASE_URL`

4. **Attendre le déploiement :**
   - Le build prendra environ 5-10 minutes
   - Vous recevrez une URL pour votre API (ex: `https://fieldtrack-backend.onrender.com`)

### Option 2 : Déploiement Manuel

#### Étape 1 : Créer la Base de Données PostgreSQL

1. Dans Render Dashboard, cliquez sur "New +" → "PostgreSQL"
2. Configurez :
   - **Name**: `fieldtrack-db`
   - **Database**: `fieldtrack`
   - **User**: `fieldtrack_user`
   - **Region**: `Frankfurt` (ou votre région préférée)
   - **Plan**: `Free` (pour commencer)
3. Notez les informations de connexion (elles seront utilisées automatiquement)

#### Étape 2 : Créer le Service Web

1. Dans Render Dashboard, cliquez sur "New +" → "Web Service"
2. Connectez votre dépôt GitHub `sanonsteve1/deleguation`
3. Configurez :
   - **Name**: `fieldtrack-backend`
   - **Environment**: `Java`
   - **Region**: `Frankfurt`
   - **Branch**: `master` (ou votre branche principale)
   - **Root Directory**: `backend`
   - **Build Command**: 
     ```bash
     chmod +x render-build.sh && ./render-build.sh
     ```
   - **Start Command**: 
     ```bash
     chmod +x render-start.sh && ./render-start.sh
     ```

#### Étape 3 : Configurer les Variables d'Environnement

Dans les paramètres du service web, ajoutez ces variables :

| Clé | Valeur | Description |
|-----|--------|-------------|
| `SPRING_PROFILES_ACTIVE` | `prod` | Active le profil de production |
| `PORT` | `10000` | Port de l'application (Render le définit automatiquement) |
| `JWT_SECRET_KEY` | *(générer une clé aléatoire)* | Clé secrète pour JWT |
| `CLIENT_BASE_URL_ONLINE` | `https://votre-frontend.vercel.app` | URL de votre frontend déployé |
| `CLIENT_BASE_URL_LOCAL` | `http://localhost:4200` | URL locale pour le développement |
| `CLIENT_BASE_URL_FLUTTER` | `http://localhost:4300` | URL pour l'app Flutter |

**Variables de Base de Données** (ajoutées automatiquement si vous utilisez render.yaml) :
- `SPRING_DATASOURCE_URL` - URL de connexion PostgreSQL
- `SPRING_DATASOURCE_USERNAME` - Nom d'utilisateur
- `SPRING_DATASOURCE_PASSWORD` - Mot de passe

#### Étape 4 : Lier la Base de Données au Service Web

1. Dans les paramètres du service web, allez dans "Environment"
2. Cliquez sur "Link Database"
3. Sélectionnez votre base de données `fieldtrack-db`
4. Render ajoutera automatiquement les variables de connexion

## 🔧 Configuration Post-Déploiement

### 1. Mettre à jour les URLs CORS

Une fois déployé, mettez à jour `CLIENT_BASE_URL_ONLINE` avec l'URL réelle de votre frontend.

### 2. Générer une Clé JWT Sécurisée

Pour générer une clé JWT sécurisée, vous pouvez utiliser :

```bash
openssl rand -hex 32
```

Ou en ligne : https://generate-secret.vercel.app/32

### 3. Vérifier les Logs

Dans Render Dashboard, allez dans "Logs" pour voir les logs de votre application.

## 📝 Notes Importantes

### Port Dynamique
Render fournit automatiquement un port via la variable `PORT`. L'application est configurée pour l'utiliser.

### Base de Données
- La base de données PostgreSQL est créée automatiquement
- Flyway exécutera les migrations au démarrage
- Les données sont persistantes même si le service redémarre

### Fichiers Temporaires
Les fichiers uploadés sont stockés dans `/tmp/fieldtrack/`. Ces fichiers seront supprimés lors des redémarrages. Pour une solution permanente, considérez utiliser un service de stockage comme AWS S3.

### Plan Gratuit
- Le service peut s'endormir après 15 minutes d'inactivité
- Le premier démarrage après l'endormissement peut prendre 30-60 secondes
- Pour éviter cela, utilisez un plan payant ou un service de "ping" externe

## 🔍 Vérification du Déploiement

1. **Vérifier que l'API répond :**
   ```bash
   curl https://votre-app.onrender.com/actuator/health
   ```

2. **Vérifier la documentation Swagger :**
   ```
   https://votre-app.onrender.com/swagger-ui.html
   ```

3. **Vérifier les logs dans Render Dashboard**

## 🐛 Dépannage

### L'application ne démarre pas
- Vérifiez les logs dans Render Dashboard
- Assurez-vous que toutes les variables d'environnement sont définies
- Vérifiez que la base de données est bien liée

### Erreur de connexion à la base de données
- Vérifiez que la base de données est créée et liée
- Vérifiez les variables `SPRING_DATASOURCE_*`

### Build échoue
- Vérifiez que Java 17 est disponible (Render le fournit automatiquement)
- Vérifiez les logs de build pour plus de détails

## 📚 Ressources

- Documentation Render : https://render.com/docs
- Documentation Spring Boot : https://spring.io/projects/spring-boot
- Support Render : support@render.com
