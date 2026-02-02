# Configuration Ngrok pour le Backend

Ce guide explique comment configurer ngrok pour exposer votre backend local et configurer l'application mobile et le frontend pour l'utiliser.

## 📋 Prérequis

1. Installer ngrok : https://ngrok.com/download
2. Créer un compte ngrok (gratuit) : https://dashboard.ngrok.com/signup
3. Obtenir votre authtoken depuis le dashboard ngrok

## 🚀 Installation de Ngrok

### Windows
1. Télécharger ngrok depuis https://ngrok.com/download
2. Extraire l'archive dans un dossier (ex: `C:\ngrok`)
3. Ajouter ngrok au PATH ou utiliser le chemin complet

### Configuration de l'authtoken
```bash
ngrok config add-authtoken VOTRE_AUTHTOKEN
```

## 🔧 Configuration

### 1. Script de Lancement Ngrok

Créez un fichier `start-ngrok.ps1` (Windows PowerShell) ou `start-ngrok.sh` (Linux/Mac) :

**Windows (start-ngrok.ps1)** :
```powershell
# Démarrer ngrok sur le port 8073
ngrok http 8073
```

**Linux/Mac (start-ngrok.sh)** :
```bash
#!/bin/bash
# Démarrer ngrok sur le port 8073
ngrok http 8073
```

### 2. Obtenir l'URL Ngrok

Après avoir lancé ngrok, vous obtiendrez une URL comme :
```
https://abc123.ngrok-free.app
```

**Important** : Notez cette URL, vous devrez la configurer dans l'application mobile et le frontend.

## 📱 Configuration de l'Application Mobile (Flutter)

### Option 1 : Configuration Manuelle

Modifiez `front/lib/services/api_service.dart` :

```dart
class ApiService {
  // URL du backend via ngrok
  static const String baseUrl = 'https://VOTRE_URL_NGROK.ngrok-free.app/ws';
  // ...
}
```

### Option 2 : Configuration Dynamique (Recommandé)

Créez un fichier de configuration `front/lib/config/api_config.dart` :

```dart
class ApiConfig {
  // URL par défaut (local)
  static const String defaultBaseUrl = 'http://192.168.11.111:8073/ws';
  
  // URL ngrok (à modifier selon votre tunnel)
  static const String ngrokBaseUrl = 'https://VOTRE_URL_NGROK.ngrok-free.app/ws';
  
  // Utiliser ngrok ou local
  static const bool useNgrok = true;
  
  static String get baseUrl => useNgrok ? ngrokBaseUrl : defaultBaseUrl;
}
```

Puis modifiez `api_service.dart` :
```dart
import 'config/api_config.dart';

class ApiService {
  static String get baseUrl => ApiConfig.baseUrl;
  // ...
}
```

## 🌐 Configuration du Frontend Angular

### 1. Modifier environment.ts

Modifiez `frontend/environments/environment.ts` :

```typescript
export const environment = {
    production: false,
    apiUrl: 'https://VOTRE_URL_NGROK.ngrok-free.app',
    url: 'http://localhost:4200'
};
```

### 2. Modifier api-urls.ts (si utilisé)

Si vous utilisez `api-urls.ts`, modifiez-le également.

## ⚙️ Configuration CORS du Backend

Le backend doit autoriser les requêtes depuis l'URL ngrok. Vérifiez `WebConfig.java` pour s'assurer que CORS est bien configuré.

## 🧪 Test de la Configuration

### 1. Démarrer le Backend
```bash
cd backend
./gradlew bootRun
```

### 2. Démarrer Ngrok
```bash
ngrok http 8073
```

### 3. Tester l'URL Ngrok
```bash
curl https://VOTRE_URL_NGROK.ngrok-free.app/ws/securite/auth
```

### 4. Tester depuis l'Application Mobile
- Démarrer l'application Flutter
- Essayer de se connecter
- Vérifier les logs pour confirmer que les requêtes passent par ngrok

## 🔄 Workflow Quotidien

1. **Démarrer le backend** :
   ```bash
   cd backend
   ./gradlew bootRun
   ```

2. **Démarrer ngrok** (dans un autre terminal) :
   ```bash
   ngrok http 8073
   ```

3. **Copier l'URL ngrok** (ex: `https://abc123.ngrok-free.app`)

4. **Mettre à jour les configurations** :
   - `front/lib/services/api_service.dart` ou `front/lib/config/api_config.dart`
   - `frontend/environments/environment.ts`

5. **Redémarrer les applications** :
   - Application mobile Flutter
   - Frontend Angular

## ⚠️ Notes Importantes

1. **URL Ngrok Change** : L'URL ngrok change à chaque redémarrage (sauf avec un compte payant). Vous devrez mettre à jour les configurations.

2. **Ngrok Free** : Avec le plan gratuit, l'URL change à chaque redémarrage. Pour une URL fixe, utilisez un compte payant.

3. **Limite de Requêtes** : Le plan gratuit de ngrok a des limites. Surveillez votre utilisation.

4. **Sécurité** : Ngrok expose votre backend local sur Internet. Assurez-vous que votre backend est sécurisé.

5. **Headers Ngrok** : Ngrok ajoute des headers spéciaux. Vérifiez que votre backend les gère correctement.

## 🎯 Alternative : Ngrok avec URL Fixe (Compte Payant)

Avec un compte ngrok payant, vous pouvez avoir une URL fixe :

```bash
ngrok http 8073 --domain=votre-domaine.ngrok.app
```

Cela évite de devoir mettre à jour les configurations à chaque redémarrage.
