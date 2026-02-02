# Guide Rapide : Lancer Ngrok

## 🚀 Méthodes pour Lancer Ngrok

### Méthode 1 : Depuis la Racine du Projet (Recommandé)

```powershell
# Depuis E:\suivi-activite-delegation
.\start-ngrok.ps1
```

### Méthode 2 : Depuis le Répertoire Backend

```powershell
# Depuis E:\suivi-activite-delegation\backend
.\start-ngrok.ps1
```

### Méthode 3 : Commande Directe (Plus Simple)

```powershell
# Depuis n'importe où
ngrok http 8073
```

### Méthode 4 : Si le Script ne Fonctionne Pas

```powershell
# Forcer l'exécution avec la politique Bypass
powershell -ExecutionPolicy Bypass -File .\start-ngrok.ps1
```

## 📝 Après le Lancement

1. **Notez l'URL ngrok** qui s'affiche (ex: `https://abc123.ngrok-free.app`)

2. **Mettez à jour la configuration Flutter** :
   - Ouvrez `front/lib/config/api_config.dart`
   - Modifiez :
     ```dart
     static const String ngrokBaseUrl = 'https://abc123.ngrok-free.app/ws';
     static const bool useNgrok = true;
     ```

3. **Mettez à jour la configuration Angular** :
   - Ouvrez `frontend/environments/environment.ts`
   - Modifiez :
     ```typescript
     apiUrl: 'https://abc123.ngrok-free.app',
     ```

4. **Mettez à jour la configuration Backend** :
   - Ouvrez `backend/src/main/resources/application.properties`
   - Modifiez :
     ```properties
     client.base_url.ngrok=https://abc123.ngrok-free.app
     ```
   - Redémarrez le backend

## ⚠️ Notes Importantes

- L'URL ngrok change à chaque redémarrage (plan gratuit)
- Gardez ngrok ouvert pendant que vous testez
- Pour une URL fixe, utilisez un compte ngrok payant

## 🔍 Vérification

Testez que ngrok fonctionne :
```bash
curl https://VOTRE_URL_NGROK.ngrok-free.app/ws/securite/auth
```
