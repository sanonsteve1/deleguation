# Tableau par Projet - Fiche Localité

## Structure mise à jour

Maintenant, chaque projet a son propre tableau d'activités avec ses propres cartes financières.

## Structure HTML

```html
<!-- Affichage des projets avec leurs tableaux individuels -->
<div *ngFor="let projet of getProjetsDepuisNouveauxWS(quantitesOuvrageParProjet)" class="mb-6">
  <div class="card py-2">
    <!-- En-tête du projet -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-4">
        <h3 class="text-lg font-semibold text-blue-600">{{ projet.designation }}</h3>
        <span class="badge px-3 py-1 rounded text-sm font-semibold">
          {{ getStatutDisplay(projet.statut) }}
        </span>
      </div>
    </div>

    <!-- Cartes financières spécifiques au projet -->
    <div class="flex gap-4">
      <div class="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <div class="text-sm text-blue-700 font-medium">À investir</div>
        <div class="text-lg font-bold text-blue-800">
          {{ formatCurrencyWithSpaces(calculerMontantAInvestirDepuisNouveauxWS(getActivitesParProjet(projet.designation))) }}
        </div>
      </div>
      <!-- ... autres cartes -->
    </div>

    <!-- Tableau spécifique au projet -->
    <div class="overflow-x-auto">
      <table class="w-full border-collapse border border-gray-300 bg-white">
        <!-- En-têtes du tableau -->
        <tbody>
          <ng-container *ngFor="let typeTravaux of getTypesTravauxDepuisNouveauxWS(getActivitesParProjet(projet.designation)); let i = index">
            <tr *ngFor="let activite of typeTravaux.ouvrages; let j = index">
              <!-- Contenu du tableau -->
            </tr>
          </ng-container>
        </tbody>
      </table>
    </div>
  </div>
</div>
```

## Méthodes ajoutées

### `getActivitesParProjet(projetDesignation: string)`

```typescript
getActivitesParProjet(projetDesignation: string): any[] {
  if (!this.quantitesOuvrageParProjet || this.quantitesOuvrageParProjet.length === 0) {
    return [];
  }

  return this.quantitesOuvrageParProjet.filter(activite => 
    activite.projetDesignation === projetDesignation
  );
}
```

Cette méthode filtre les activités pour ne retourner que celles qui appartiennent au projet spécifié.

## Fonctionnement

1. **Boucle sur les projets** : `*ngFor="let projet of getProjetsDepuisNouveauxWS(quantitesOuvrageParProjet)"`

2. **Pour chaque projet** :
   - Affichage du nom du projet et de son statut
   - Calcul des montants financiers spécifiques au projet via `getActivitesParProjet(projet.designation)`
   - Affichage du tableau des activités spécifiques au projet

3. **Filtrage des données** :
   - `getActivitesParProjet(projet.designation)` filtre les activités
   - `getTypesTravauxDepuisNouveauxWS()` groupe par type de travaux
   - Chaque projet a ses propres calculs financiers

## Exemple avec les données de l'API

Avec le JSON fourni :
```json
{
  "projetDesignation": "PROJET D'AUGMENTATION DE L'ACCES A L'ELECTRICITE (P2AE)",
  "typeTravauxDesignation": "Electrification rurale",
  "coutTotalOuvrages": 2574000,
  "coutTotalOuvragesRealises": 0
}
```

**Résultat :**
- **Projet** : "PROJET D'AUGMENTATION DE L'ACCES A L'ELECTRICITE (P2AE)"
- **Statut** : EN COURS
- **Cartes financières** :
  - À investir : 2 574 000 FCFA
  - Décaissé : 0 FCFA
  - À décaisser : 2 574 000 FCFA
- **Tableau** :
  - Type de travaux : "Electrification rurale"
  - Activité : "KANDI" (Code: ACT-000000762)
  - Progression : 0%
  - Statut : N/A
  - Responsable : N/A
  - Coût réalisé : 0 FCFA
  - Coût restant : 2 574 000 FCFA

## Avantages

1. **Séparation claire** : Chaque projet a sa propre section
2. **Calculs précis** : Les montants financiers sont calculés par projet
3. **Lisibilité** : Plus facile de comprendre les données par projet
4. **Évolutivité** : Facile d'ajouter de nouveaux projets
5. **Performance** : Filtrage efficace des données

## Structure finale

```
Fiche Localité
├── Sélection géographique (Département, Commune, Localité)
├── Compteur de projets
└── Pour chaque projet :
    ├── En-tête du projet (nom + statut)
    ├── Cartes financières (À investir, Décaissé, À décaisser)
    └── Tableau des activités
        ├── Type de travaux (fusionné verticalement)
        ├── Activité (nom + code)
        ├── Progression (%)
        ├── Statut
        ├── Responsable
        ├── Coût réalisé (FCFA)
        └── Coût restant (FCFA)
```

Cette structure permet une visualisation claire et organisée des données par projet, facilitant l'analyse et la compréhension des informations.
