# Instructions de compilation pour Flutter Web (Mode Offline)

## ⚠️ IMPORTANT : Erreur en mode offline

Si vous voyez l'erreur :
```
"Use engineInitializer.initializeEngine(config) only. Using the (deprecated) window.flutterConfiguration and initializeEngine configuration simultaneously is not supported."
```

Cela signifie que vous devez compiler l'application avec le rendu HTML.

## Problème
En mode offline, Flutter Web essaie de charger CanvasKit depuis un CDN externe (gstatic.com), ce qui provoque une erreur. De plus, l'utilisation de `window.flutterConfiguration` est dépréciée et cause des conflits.

## Solution
Compiler l'application avec le rendu HTML au lieu de CanvasKit. **La configuration doit être faite au moment de la compilation, pas dans index.html.**

## Commande de compilation

### Pour la production
```bash
cd front
flutter build web --web-renderer html --release
```

### Pour le développement
```bash
cd front
flutter run -d chrome --web-renderer html
```

## Explication

- `--web-renderer html` : Force l'utilisation du rendu HTML au lieu de CanvasKit
- Le rendu HTML fonctionne complètement offline (pas de dépendances CDN)
- Le rendu HTML est plus léger mais peut être légèrement moins performant pour les animations complexes
- **Ne pas utiliser `window.flutterConfiguration` dans index.html** - cela cause des conflits avec la nouvelle API Flutter

## Alternative : Rendu CanvasKit local

Si vous préférez utiliser CanvasKit (meilleures performances), vous devez :
1. Télécharger CanvasKit localement
2. Configurer Flutter pour utiliser la version locale

Mais pour une application qui doit fonctionner offline, le rendu HTML est recommandé.

## Note sur le Service Worker

L'erreur "prepareServiceWorker took more than 4000ms" peut être ignorée en mode offline. Le service worker n'est pas nécessaire pour le fonctionnement de l'application en mode offline si vous utilisez le rendu HTML.
