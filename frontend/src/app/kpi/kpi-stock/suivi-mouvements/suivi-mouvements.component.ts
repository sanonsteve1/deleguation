import {Component, OnInit, HostListener} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {ButtonModule} from 'primeng/button';
import {ChartModule} from 'primeng/chart';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {ToggleSwitchModule} from 'primeng/toggleswitch';
import {PaginatorModule} from 'primeng/paginator';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {ChangeDetectorRef} from '@angular/core';
import {KpiStockService} from '../../../../services/kpi-stock';
import {StatistiqueMensuelleResponsesKPIStock} from '../../../../models/statistique-mensuelle-responses-kpi-stock';

@Component({
  selector: 'app-suivi-mouvements',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, ButtonModule, ChartModule, ProgressSpinnerModule, ToggleSwitchModule, PaginatorModule, OverlayPanelModule],
  templateUrl: './suivi-mouvements.component.html',
  styleUrls: ['./suivi-mouvements.component.scss']
})
export class SuiviMouvementsComponent implements OnInit {
  annees: number[] = [2025];
  mois: any[] = [
    { label: "Toute l'année", value: null },
    { label: 'Jan', value: 1 },
    { label: 'Fév', value: 2 },
    { label: 'Mar', value: 3 },
    { label: 'Avr', value: 4 },
    { label: 'Mai', value: 5 },
    { label: 'Juin', value: 6 },
    { label: 'Jul', value: 7 },
    { label: 'Aoû', value: 8 },
    { label: 'Sep', value: 9 },
    { label: 'Oct', value: 10 },
    { label: 'Nov', value: 11 },
    { label: 'Déc', value: 12 }
  ];

  anneeSelectionnee: number = 2025;
  moisSelectionne: number | null = null;

  // Labels des mois mémorisés (sans "Toute l'année")
  private readonly moisLabels: string[] = this.mois.slice(1).map(m => m.label);

  // state
  loading: boolean = false;
  loadingMessage: string = 'Chargement des statistiques...';
  loadingProgress: number = 0;

  dataKpiStock: StatistiqueMensuelleResponsesKPIStock | undefined;
  
  // Pagination pour les commandes
  firstCommande: number = 0;
  rowsCommande: number = 2; // 2 commandes par page
  
  // Filtres par colonne
  filterNumeroCommande: string = '';
  filterDateCommande: string = '';
  filterDateReception: string = '';
  filterFournisseur: string = '';
  filterStatut: string | null = null;
  filterMontant: string = '';
  
  // Liste filtrée des commandes
  commandesFiltrees: any[] = [];
  
  // Options pour le filtre statut (chargées depuis le backend)
  statutsOptions: any[] = [];
  
  // chart Entrées/Sorties
  aucuneDonneeEntreesSortiesDisponible: boolean = false;
  chartDonneesEntreesSorties: any;
  chartOptionsEntreesSorties: any;
  
  // Équipements utilisés et critiques
  afficherEquipementsCritiques: boolean = false;
  aucuneDonneeEquipementPlusUtiliseDisponible: boolean = false;
  aucuneDonneeEquipementRuptureStockDisponible: boolean = false;

  constructor(private kpiStockService: KpiStockService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.chargerStatuts();
    this.chargerStatistiques();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    // Recalculer les options du graphique lors du redimensionnement
    if (this.chartDonneesEntreesSorties) {
      this.updateChartEntreesSorties();
    }
  }

  chargerStatuts(): void {
    this.kpiStockService.getStatutsDistincts().subscribe({
      next: (statuts: string[]) => {
        // Convertir les statuts en format label/value
        this.statutsOptions = statuts.map(statut => ({
          label: this.getStatutLabel(statut),
          value: statut
        }));
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statuts:', error);
        // Valeurs par défaut en cas d'erreur
        this.statutsOptions = [
          { label: 'Livrée', value: 'LIVREE' },
          { label: 'Réceptionnée', value: 'RECEPTIONNEE' },
          { label: 'Facturée', value: 'FACTUREE' },
          { label: 'En cours de livraison', value: 'EN_COURS_LIVRAISON' },
          { label: 'Partiellement livrée', value: 'PARTIELLEMENT_LIVREE' },
          { label: 'Confirmée', value: 'CONFIRMEE' },
          { label: 'Envoyée', value: 'ENVOYEE' },
          { label: 'Brouillon', value: 'BROUILLON' },
          { label: 'Annulée', value: 'ANNULEE' }
        ];
        this.cdr.markForCheck();
      }
    });
  }

  chargerStatistiques(): void {
    this.loading = true;
    this.loadingProgress = 30;
    // Réinitialiser la pagination et les filtres lors du chargement
    this.firstCommande = 0;
    this.reinitialiserFiltresColonnes();
    this.kpiStockService
      .getStatistiquesMensuellesKPIStock(this.moisSelectionne, this.anneeSelectionnee)
      .subscribe({
        next: (res: StatistiqueMensuelleResponsesKPIStock) => {
          this.dataKpiStock = res;
          this.updateChartEntreesSorties();
          this.updateEquipementsDisponibles();
          this.appliquerFiltres();
          this.loading = false;
          this.loadingProgress = 0;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.loadingProgress = 0;
          this.cdr.markForCheck();
        }
      });
  }

  updateChartEntreesSorties(): void {
    const labels = this.moisLabels;
    const entrees = (this.dataKpiStock?.entreesParMois || []).slice(0, 12).map(v => v ? v / 1e6 : null);
    const sorties = (this.dataKpiStock?.sortiesParMois || []).slice(0, 12).map(v => v ? v / 1e6 : null);

    this.aucuneDonneeEntreesSortiesDisponible = [...entrees, ...sorties].every(v => v === null || v === undefined);

    const isMobile = window.innerWidth <= 768;
    
    this.chartDonneesEntreesSorties = {
      labels,
      datasets: [
        {
          label: `Entrées (M FCFA)`,
          data: entrees,
          backgroundColor: '#10B981',
          borderColor: '#059669',
          borderWidth: 1
        },
        {
          label: `Sorties (M FCFA)`,
          data: sorties,
          backgroundColor: '#EF4444',
          borderColor: '#DC2626',
          borderWidth: 1
        }
      ]
    };

    this.chartOptionsEntreesSorties = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'bottom',
          align: 'center',
          labels: {
            color: '#495057',
            boxWidth: 20,
            padding: 8,
            font: { size: 11 }
          }
        },
        tooltip: {
          callbacks: {
            title: (tooltipItems: any) => {
              const item = tooltipItems[0];
              const moisIndex = item.dataIndex;
              const moisComplet = this.mois.slice(1)[moisIndex]?.label || `Mois ${item.label}`;
              return moisComplet;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            font: { 
              size: isMobile ? 8 : 10 
            },
            maxRotation: isMobile ? 90 : 45,
            minRotation: isMobile ? 90 : 45,
            padding: isMobile ? 4 : 8,
            color: '#6b7280'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Valeur (M FCFA)',
            font: {
              size: isMobile ? 9 : 10,
              weight: 'bold'
            }
          },
          ticks: {
            font: { 
              size: isMobile ? 8 : 9 
            },
            color: '#6b7280'
          }
        }
      }
    };
  }

  reinitialiserFiltres(): void {
    this.anneeSelectionnee = 2025;
    this.moisSelectionne = null;
    this.chargerStatistiques();
  }

  // Méthodes de formatage (copie de kpi-stock)
  formatKPIValue(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '-';
    }
    return value.toLocaleString('fr-FR');
  }

  formatJoursEnAnneeMoisJours(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) return '-';
    
    const joursTotal = Math.floor(value);
    const annees = Math.floor(joursTotal / 365);
    const restantApresAnnees = joursTotal % 365;
    const mois = Math.floor(restantApresAnnees / 30);
    const jours = restantApresAnnees % 30;

    if (annees > 0) {
      return `${annees} an${annees > 1 ? 's' : ''} ${mois} mois ${jours} j`;
    } else if (mois > 0) {
      return `${mois} mois ${jours} j`;
    } else {
      return `${jours} j`;
    }
  }

  getEquipementIcon(nomEquipement: string): string {
    if (!nomEquipement) return 'pi pi-box';

    const nom = nomEquipement.toLowerCase().trim();

    // Transformateurs (détection améliorée)
    if (nom.includes('transformateur') || nom.includes('nsformateur') || nom.includes('sformateur') || nom.includes('kva')) {
      return 'pi pi-bolt';
    }

    // Compteurs (détection améliorée)
    if (nom.includes('compteur') || nom.includes('prépayé') || nom.includes('prepaye') || nom.includes('postpayé') || nom.includes('postpaye')) {
      return 'pi pi-cog';
    }

    // Câbles souterrains
    if (nom.includes('souterrain') || (nom.includes('cuivre') && nom.includes('mm²'))) {
      return 'pi pi-link';
    }

    // Câbles aériens
    if (nom.includes('aérien') || nom.includes('aerien') || nom.includes('aluminium')) {
      return 'pi pi-link';
    }

    // Fibre optique
    if (nom.includes('fibre') || nom.includes('optique')) {
      return 'pi pi-wifi';
    }

    // Câbles en général
    if (nom.includes('câble') || nom.includes('cable')) {
      return 'pi pi-link';
    }

    // Par défaut
    return 'pi pi-box';
  }

  updateEquipementsDisponibles(): void {
    // Vérifier si les données pour équipements plus utilisés sont disponibles
    const equipementsPlusUtilises = this.dataKpiStock?.top10EquipementPlusUtilises || [];
    this.aucuneDonneeEquipementPlusUtiliseDisponible = equipementsPlusUtilises.length === 0 || 
      equipementsPlusUtilises.every(e => !e || (e.quantiteConsomme === null || e.quantiteConsomme === undefined || e.quantiteConsomme === 0));

    // Vérifier si les données pour équipements critiques sont disponibles
    const equipementsCritiques = this.dataKpiStock?.top10EquipementCritique || [];
    this.aucuneDonneeEquipementRuptureStockDisponible = equipementsCritiques.length === 0 || 
      equipementsCritiques.every(e => !e || (e.quantiteRestante === null || e.quantiteRestante === undefined || e.quantiteRestante === 0));
  }

  // Méthodes pour la liste des commandes
  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '-';
    }
  }

  formatFCFA(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '-';
    }
    // Convertir en millions si supérieur à 1 million
    if (value >= 1e9) {
      return (value / 1e9).toFixed(2) + ' Mds FCFA';
    } else if (value >= 1e6) {
      return (value / 1e6).toFixed(2) + ' M FCFA';
    } else if (value >= 1e3) {
      return (value / 1e3).toFixed(2) + ' K FCFA';
    }
    return value.toLocaleString('fr-FR') + ' FCFA';
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'LIVREE': 'Livrée',
      'RECEPTIONNEE': 'Réceptionnée',
      'FACTUREE': 'Facturée',
      'EN_COURS_LIVRAISON': 'En cours de livraison',
      'PARTIELLEMENT_LIVREE': 'Partiellement livrée',
      'CONFIRMEE': 'Confirmée',
      'ENVOYEE': 'Envoyée',
      'BROUILLON': 'Brouillon',
      'ANNULEE': 'Annulée'
    };
    return labels[statut] || statut;
  }

  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'LIVREE': 'statut-livree',
      'RECEPTIONNEE': 'statut-receptionnee',
      'FACTUREE': 'statut-facturee',
      'EN_COURS_LIVRAISON': 'statut-en-cours',
      'PARTIELLEMENT_LIVREE': 'statut-partiel',
      'CONFIRMEE': 'statut-confirmee',
      'ENVOYEE': 'statut-envoyee',
      'BROUILLON': 'statut-brouillon',
      'ANNULEE': 'statut-annulee'
    };
    return classes[statut] || 'statut-default';
  }

  // Méthodes pour le filtrage et la pagination des commandes
  appliquerFiltres(): void {
    if (!this.dataKpiStock?.listeCommandesTraitees) {
      this.commandesFiltrees = [];
      return;
    }

    this.commandesFiltrees = this.dataKpiStock.listeCommandesTraitees.filter(commande => {
      // Filtre numéro commande
      if (this.filterNumeroCommande && 
          !commande.numeroCommande?.toLowerCase().includes(this.filterNumeroCommande.toLowerCase())) {
        return false;
      }

      // Filtre date commande
      if (this.filterDateCommande && 
          !this.formatDate(commande.dateCommande)?.toLowerCase().includes(this.filterDateCommande.toLowerCase())) {
        return false;
      }

      // Filtre date réception
      if (this.filterDateReception && 
          !this.formatDate(commande.dateReceptionEffective)?.toLowerCase().includes(this.filterDateReception.toLowerCase()) &&
          commande.dateReceptionEffective !== null) {
        return false;
      }

      // Filtre fournisseur
      if (this.filterFournisseur && 
          !commande.nomFournisseur?.toLowerCase().includes(this.filterFournisseur.toLowerCase())) {
        return false;
      }

      // Filtre statut
      if (this.filterStatut && commande.statut !== this.filterStatut) {
        return false;
      }

      // Filtre montant
      if (this.filterMontant) {
        const montantStr = this.formatFCFA(commande.montantTotal)?.toLowerCase() || '';
        if (!montantStr.includes(this.filterMontant.toLowerCase())) {
          return false;
        }
      }

      return true;
    });

    // Réinitialiser la pagination après filtrage
    this.firstCommande = 0;
  }

  reinitialiserFiltresColonnes(): void {
    this.filterNumeroCommande = '';
    this.filterDateCommande = '';
    this.filterDateReception = '';
    this.filterFournisseur = '';
    this.filterStatut = null;
    this.filterMontant = '';
    this.commandesFiltrees = [];
  }

  get commandesPaginees(): any[] {
    if (!this.commandesFiltrees || this.commandesFiltrees.length === 0) {
      return [];
    }
    return this.commandesFiltrees.slice(
      this.firstCommande,
      this.firstCommande + this.rowsCommande
    );
  }

  get totalCommandes(): number {
    return this.commandesFiltrees?.length || 0;
  }

  onPageChangeCommandes(event: any): void {
    this.firstCommande = event.first;
    this.rowsCommande = event.rows;
  }
}


