package com.example.social_media;

import android.os.Bundle;
import android.util.Log;
import io.flutter.embedding.android.FlutterActivity;

public class MainActivity extends FlutterActivity {
    private static final String TAG = "MainActivity";
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        try {
            Log.d(TAG, "MainActivity onCreate - Démarrage");
            super.onCreate(savedInstanceState);
            Log.d(TAG, "MainActivity onCreate - Succès");
        } catch (Exception e) {
            Log.e(TAG, "Erreur fatale dans onCreate", e);
            // Ne pas relancer l'exception pour éviter un crash silencieux
            // L'application affichera un écran d'erreur Flutter si nécessaire
            e.printStackTrace();
        } catch (Error e) {
            Log.e(TAG, "Erreur fatale (Error) dans onCreate", e);
            e.printStackTrace();
        }
    }
    
    @Override
    protected void onStart() {
        try {
            Log.d(TAG, "MainActivity onStart");
            super.onStart();
            Log.d(TAG, "MainActivity onStart - Succès");
        } catch (Exception e) {
            Log.e(TAG, "Erreur dans onStart", e);
            e.printStackTrace();
        } catch (Error e) {
            Log.e(TAG, "Erreur (Error) dans onStart", e);
            e.printStackTrace();
        }
    }
    
    @Override
    protected void onResume() {
        try {
            Log.d(TAG, "MainActivity onResume");
            super.onResume();
            Log.d(TAG, "MainActivity onResume - Succès");
        } catch (Exception e) {
            Log.e(TAG, "Erreur dans onResume", e);
            e.printStackTrace();
        }
    }
}
