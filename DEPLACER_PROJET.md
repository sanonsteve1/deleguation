# Guide pour Déplacer le Projet vers un Chemin sans Accents

## Problème

Le chemin actuel `E:\suivi activité délégation` contient des caractères accentués qui causent des erreurs lors de la compilation Flutter.

## Solution : Déplacer le Projet

### Option 1 : Copier le Projet (Recommandé)

1. **Créer un nouveau dossier sans accents** :
   ```powershell
   New-Item -ItemType Directory -Path "E:\suivi-activite-delegation"
   ```

2. **Copier tout le contenu** (sauf .git pour garder l'historique) :
   ```powershell
   Copy-Item -Recurse -Path "E:\suivi activité délégation\*" -Destination "E:\suivi-activite-delegation\" -Exclude ".git"
   ```

3. **Si vous utilisez Git, recréer le lien** :
   ```powershell
   cd E:\suivi-activite-delegation
   git remote -v  # Vérifier le remote
   # Si nécessaire, réinitialiser :
   git init
   git remote add origin [URL_DE_VOTRE_REPO]
   ```

4. **Générer l'APK depuis le nouveau chemin** :
   ```powershell
   cd E:\suivi-activite-delegation\front
   flutter build apk --release
   ```

### Option 2 : Utiliser un Lien Symbolique

1. **Créer un lien symbolique** :
   ```powershell
   # Ouvrir PowerShell en tant qu'Administrateur
   New-Item -ItemType SymbolicLink -Path "E:\suivi-activite-delegation" -Target "E:\suivi activité délégation"
   ```

2. **Utiliser le nouveau chemin pour la compilation** :
   ```powershell
   cd E:\suivi-activite-delegation\front
   flutter build apk --release
   ```

### Option 3 : Renommer le Dossier Actuel

1. **Renommer le dossier** :
   ```powershell
   Rename-Item -Path "E:\suivi activité délégation" -NewName "suivi-activite-delegation"
   ```

2. **Mettre à jour les chemins dans votre IDE** si nécessaire

3. **Générer l'APK** :
   ```powershell
   cd E:\suivi-activite-delegation\front
   flutter build apk --release
   ```

## Après le Déplacement

Une fois le projet déplacé, vous devriez pouvoir générer l'APK sans problème :

```powershell
cd E:\suivi-activite-delegation\front
flutter build apk --release
```

L'APK sera généré dans : `E:\suivi-activite-delegation\front\build\app\outputs\flutter-apk\app-release.apk`

## Note Importante

- Si vous utilisez Git, assurez-vous que le remote est correct après le déplacement
- Si vous avez des chemins codés en dur dans votre code, mettez-les à jour
- Les chemins relatifs dans le projet ne nécessitent pas de modification
