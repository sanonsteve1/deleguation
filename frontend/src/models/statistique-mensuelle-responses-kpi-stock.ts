import { DonneesMensuellesKpiStock } from './donnees-mensuelles-kpi-stock';
import { StockParCategorie } from './stock-par-categorie';
import { EquipementDtoCustom } from './equipement-dto-custom';
import { EquipementRestant } from './equipement-restant';
import { TauxRotationCategorie } from './taux-rotation-categorie';
import { CommandeTraitee } from './commande-traitee';

export interface StatistiqueMensuelleResponsesKPIStock {
    // --- Liste des données mensuelles ---
    donneesMensuellesKpiStock: DonneesMensuellesKpiStock[];

    // --- Répartition par catégorie ---
    stockParCategorie: StockParCategorie[];

    // --- Top 10 des équipements les plus utilisés (quantité consommée) ---
    top10EquipementPlusUtilises: EquipementDtoCustom[];

    // --- Top 10 des équipements critiques (stock restant le plus bas) ---
    top10EquipementCritique: EquipementRestant[];

    // --- Taux de rotation par catégorie ---
    tauxRotationParCategorie: TauxRotationCategorie[];

    // --- KPI globaux ---
    tauxRotationMois: number;
    tauxRotationAnnee: number;
    valeurStockMoyenMois: number;
    valeurStockMoyenAnnee: number;

    quantiteStockMois: number;      // Nombre d'équipements distincts en stock jusqu'au mois
    valeurTotalStockMois: number;   // Valeur totale du stock jusqu'au mois

    quantiteStockAnnee: number;     // Nombre d'équipements distincts en stock à l'année
    valeurTotalStockAnnee: number;  // Valeur totale du stock à l'année

  // Nouveaux indicateurs
  entreesParMois: number[];       // Valeurs d'entrées par mois (FCFA)
  sortiesParMois: number[];       // Valeurs de sorties par mois (FCFA)
  tauxRupture: number;            // Pourcentage 0-100
  ratioStockConsommation: number; // Stock cumulé / Consommations cumulées

  // --- Nouveaux KPIs: Surstock & Coûts ---
  nombreArticlesSurstock?: number;      // Nombre d'articles en surstock
  coutEntreposageTotal?: number;        // Coût total d'entreposage
  valeurStockMoyenCout?: number;        // Valeur moyenne du stock pour calcul coût
  tauxCoutEntreposage?: number;         // Taux de coût d'entreposage (%)

  // --- KPIs Performance Logistique ---
  delaiMoyenApprovisionnement?: number; // Délai moyen en jours
  volumeCommandesTraitees?: number;     // Nombre de commandes traitées
  fiabiliteMoyenneFournisseurs?: number; // Fiabilité fournisseurs (0-100)
  tauxConformiteMoyen?: number;         // Taux de conformité réception (0-100)
  
  // --- KPIs Commandes par statut ---
  nombreCommandesLivrees?: number;      // Nombre de commandes livrées
  nombreCommandesEnCours?: number;      // Nombre de commandes en cours
  nombreCommandesAnnulees?: number;     // Nombre de commandes annulées
  
  // --- Liste des commandes traitées ---
  listeCommandesTraitees?: CommandeTraitee[];
}
