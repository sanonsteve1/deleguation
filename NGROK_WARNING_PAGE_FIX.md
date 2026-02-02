# Solution : Erreur "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" avec Ngrok

## 🔍 Problème

Quand vous utilisez ngrok gratuit, vous recevez cette erreur :
```
FormatException: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

## 💡 Cause

Ngrok gratuit affiche une **page d'avertissement** (warning page) en HTML avant de rediriger vers votre API. Cette page HTML est retournée au lieu du JSON attendu, ce qui cause l'erreur.

## ✅ Solution

Ajoutez le header `ngrok-skip-browser-warning: true` à toutes vos requêtes HTTP pour contourner cette page d'avertissement.

### 1. Application Flutter (Mobile)

Le header a été ajouté automatiquement dans `front/lib/services/api_service.dart` :

```dart
Map<String, String> get _headers => {
  'Content-Type': 'application/json',
  if (_token != null) 'Authorization': 'Bearer $_token',
  // Header pour contourner la page d'avertissement ngrok
  'ngrok-skip-browser-warning': 'true',
};
```

### 2. Frontend Angular

Le header a été ajouté dans `frontend/src/interceptors/api.interceptor.ts` :

```typescript
setHeaders: {
    Authorization: token ? `Bearer ${token}` : '',
    // ...
    'ngrok-skip-browser-warning': 'true'
}
```

## 🧪 Test

Après avoir ajouté le header, testez à nouveau votre application. Les requêtes devraient maintenant fonctionner correctement avec ngrok.

## 📝 Alternative : Compte Ngrok Payant

Avec un compte ngrok payant, vous pouvez :
1. Désactiver complètement la page d'avertissement
2. Avoir une URL fixe qui ne change pas
3. Plus de limites de requêtes

## ⚠️ Note

Le header `ngrok-skip-browser-warning` fonctionne uniquement avec les requêtes HTTP programmatiques (API). Si vous ouvrez l'URL ngrok dans un navigateur, vous verrez toujours la page d'avertissement (c'est normal et sécurisé).
