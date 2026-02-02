# 🔧 Solution : Espace Disque Insuffisant

## ❌ Problème Identifié

**Erreur** : `java.io.IOException: Espace insuffisant sur le disque`

Le disque **C:** est plein. Gradle ne peut pas écrire dans son cache :
- `C:\Users\steve\.gradle\caches\8.9\`
- `C:\Users\steve\.gradle\daemon\8.9\`

## ✅ Solutions

### Solution 1 : Nettoyer le Cache Gradle (Recommandé)

```powershell
# Arrêter tous les daemons Gradle
cd E:\suivi-activite-delegation\front\android
.\gradlew --stop

# Nettoyer le cache Gradle (libère plusieurs GB)
Remove-Item -Path "$env:USERPROFILE\.gradle\caches" -Recurse -Force -ErrorAction SilentlyContinue

# Nettoyer le cache des daemons
Remove-Item -Path "$env:USERPROFILE\.gradle\daemon" -Recurse -Force -ErrorAction SilentlyContinue

# Nettoyer le build du projet
cd E:\suivi-activite-delegation\front
flutter clean
```

### Solution 2 : Vérifier l'Espace Disque

```powershell
# Vérifier l'espace disponible sur C:
Get-PSDrive C | Select-Object Used,Free

# Voir les plus gros dossiers dans .gradle
Get-ChildItem "$env:USERPROFILE\.gradle" -Recurse | 
    Where-Object {$_.PSIsContainer -eq $false} | 
    Sort-Object Length -Descending | 
    Select-Object -First 10 FullName, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}}
```

### Solution 3 : Déplacer le Cache Gradle vers un Autre Disque

Si le disque E: a plus d'espace :

```powershell
# Créer la variable d'environnement GRADLE_USER_HOME
[System.Environment]::SetEnvironmentVariable("GRADLE_USER_HOME", "E:\.gradle", "User")

# Redémarrer PowerShell pour que la variable soit prise en compte
```

Ou créer un fichier `gradle.properties` dans le projet :

**Fichier** : `android/gradle.properties`
```properties
org.gradle.user.home=E:/.gradle
```

### Solution 4 : Nettoyer d'Autres Caches

```powershell
# Nettoyer le cache Flutter
flutter clean

# Nettoyer le cache pub
Remove-Item -Path "$env:USERPROFILE\.pub-cache" -Recurse -Force -ErrorAction SilentlyContinue

# Nettoyer les fichiers temporaires Windows
Remove-Item -Path "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
```

## 🚀 Actions Immédiates

### Étape 1 : Nettoyer le Cache Gradle

```powershell
# Arrêter Gradle
cd E:\suivi-activite-delegation\front\android
.\gradlew --stop

# Nettoyer le cache (ATTENTION : cela supprime tout le cache Gradle)
Remove-Item -Path "$env:USERPROFILE\.gradle\caches" -Recurse -Force -ErrorAction SilentlyContinue
```

### Étape 2 : Vérifier l'Espace

```powershell
Get-PSDrive C | Select-Object Used,Free
```

### Étape 3 : Si toujours insuffisant, déplacer le cache

Créer `android/gradle.properties` :
```properties
org.gradle.user.home=E:/.gradle
```

### Étape 4 : Réessayer le Build

```powershell
cd E:\suivi-activite-delegation\front
flutter clean
flutter pub get
flutter build apk --debug --target-platform android-arm,android-arm64,android-x64
```

## 📊 Taille Typique des Caches

- **Cache Gradle** : 2-5 GB (peut être nettoyé)
- **Cache Flutter** : 500 MB - 1 GB
- **Cache pub** : 200-500 MB
- **Build Android** : 500 MB - 2 GB

## ⚠️ Attention

- Nettoyer le cache Gradle va ralentir le prochain build (téléchargement des dépendances)
- Le cache sera reconstruit automatiquement
- Assurez-vous d'avoir au moins **5-10 GB** d'espace libre pour un build Android
