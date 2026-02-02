# Flutter wrapper
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Garder toutes les classes Flutter
-keep class * extends io.flutter.plugin.common.PluginRegistry
-keep class * extends io.flutter.plugin.common.PluginRegistry$Registrar

# Garder toutes les classes de l'application
-keep class com.example.social_media.** { *; }

# Désactiver les optimisations agressives
-dontoptimize
-dontobfuscate
-dontpreverify
