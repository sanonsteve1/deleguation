import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {ButtonModule} from 'primeng/button';
import {ChartModule} from 'primeng/chart';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {ChangeDetectorRef} from '@angular/core';
import {KpiStockService} from '../../../../services/kpi-stock';
import {StatistiqueMensuelleResponsesKPIStock} from '../../../../models/statistique-mensuelle-responses-kpi-stock';

@Component({
  selector: 'app-analyse-financiere',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, ButtonModule, ChartModule, ProgressSpinnerModule, OverlayPanelModule],
  templateUrl: './analyse-financiere.component.html',
  styleUrls: ['./analyse-financiere.component.scss']
})
export class AnalyseFinanciereComponent implements OnInit {
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

  // State
  loading: boolean = false;
  loadingMessage: string = 'Chargement des statistiques...';
  loadingProgress: number = 0;

  dataKpiStock: StatistiqueMensuelleResponsesKPIStock | undefined;

  // Graphiques
  aucuneDonneeEvolutionStockDisponible: boolean = false;
  chartDonneesEvolutionStock: any;
  chartOptionsEvolutionStock: any;

  aucuneDonneeEvolutionStockMoyenDisponible: boolean = false;
  chartDonneesEvolutionStockMoyen: any;
  chartOptionsEvolutionStockMoyen: any;

  constructor(private kpiStockService: KpiStockService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.chargerStatistiques();
  }

  chargerStatistiques(): void {
    this.loading = true;
    this.loadingProgress = 30;
    this.kpiStockService
      .getStatistiquesMensuellesKPIStock(this.moisSelectionne, this.anneeSelectionnee)
      .subscribe({
        next: (res: StatistiqueMensuelleResponsesKPIStock) => {
          this.dataKpiStock = res;
          this.updateChartEvolutionStock();
          this.updateChartEvolutionStockMoyen();
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

  reinitialiserFiltres(): void {
    this.anneeSelectionnee = 2025;
    this.moisSelectionne = null;
    this.chargerStatistiques();
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

  formatRatio(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '-';
    }
    return value.toFixed(2);
  }

  // Calculer la valeur immobilisée (stock moyen ou total selon contexte)
  getValeurImmobilisee(): number | null | undefined {
    if (this.moisSelectionne) {
      // Si un mois est sélectionné, utiliser valeurStockMoyenMois ou valeurTotalStockMois
      return this.dataKpiStock?.valeurStockMoyenMois || this.dataKpiStock?.valeurTotalStockMois;
    } else {
      // Sinon, utiliser valeurStockMoyenAnnee ou valeurTotalStockAnnee
      return this.dataKpiStock?.valeurStockMoyenAnnee || this.dataKpiStock?.valeurTotalStockAnnee;
    }
  }

  updateChartEvolutionStock(): void {
    const labels = this.moisLabels;
    const dataInit = this.dataKpiStock?.donneesMensuellesKpiStock || [];
    
    // Créer un tableau de données pour tous les mois (12 mois) - utiliser null pour les valeurs manquantes
    const dataValeurStock = new Array(12).fill(null);

    // Remplir les données (convertir en millions de FCFA)
    dataInit.forEach(d => {
      const moisIndex = d.mois - 1;
      if (moisIndex >= 0 && moisIndex < 12 && d.valeurTotaleStock >= 0) {
        dataValeurStock[moisIndex] = d.valeurTotaleStock / 1e6; // Convertir en millions
      }
    });

    this.aucuneDonneeEvolutionStockDisponible = dataValeurStock.every(v => v === null || v === undefined);

    this.chartDonneesEvolutionStock = {
      labels,
      datasets: [{
        label: 'Valeur totale du stock (M FCFA)',
        data: dataValeurStock,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        spanGaps: false,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2
      }]
    };

    this.chartOptionsEvolutionStock = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 8,
          right: 8,
          top: 15,
          bottom: 85
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
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
              return this.mois.slice(1)[moisIndex]?.label || `Mois ${item.label}`;
            },
            label: (context: any) => {
              const val = context.parsed.y;
              if (val === null || val === undefined) return 'Aucune donnée';
              return `Valeur: ${val.toFixed(2)} M FCFA`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: false
          },
          ticks: {
            font: { size: 10 },
            maxRotation: 45,
            minRotation: 45,
            padding: 8,
            color: '#6b7280',
            maxTicksLimit: 12,
            autoSkip: false
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Valeur (M FCFA)',
            font: {
              size: 10,
              weight: 'bold'
            }
          },
          ticks: {
            font: { size: 9 },
            color: '#6b7280',
            callback: function(value: any) {
              return new Intl.NumberFormat('fr-FR', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
              }).format(value) + ' M';
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      }
    };
  }

  updateChartEvolutionStockMoyen(): void {
    const labels = this.moisLabels;
    const dataInit = this.dataKpiStock?.donneesMensuellesKpiStock || [];
    
    // Créer un tableau de données pour tous les mois (12 mois) - utiliser null pour les valeurs manquantes
    const dataValeurStockMoyen = new Array(12).fill(null);

    // Remplir les données (convertir en millions de FCFA)
    dataInit.forEach(d => {
      const moisIndex = d.mois - 1;
      if (moisIndex >= 0 && moisIndex < 12 && d.valeurStockMoyen >= 0) {
        dataValeurStockMoyen[moisIndex] = d.valeurStockMoyen / 1e6; // Convertir en millions
      }
    });

    this.aucuneDonneeEvolutionStockMoyenDisponible = dataValeurStockMoyen.every(v => v === null || v === undefined);

    this.chartDonneesEvolutionStockMoyen = {
      labels,
      datasets: [{
        label: 'Valeur moyenne du stock (M FCFA)',
        data: dataValeurStockMoyen,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        spanGaps: false,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2
      }]
    };

    this.chartOptionsEvolutionStockMoyen = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 8,
          right: 8,
          top: 15,
          bottom: 85
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
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
              return this.mois.slice(1)[moisIndex]?.label || `Mois ${item.label}`;
            },
            label: (context: any) => {
              const val = context.parsed.y;
              if (val === null || val === undefined) return 'Aucune donnée';
              return `Valeur moyenne: ${val.toFixed(2)} M FCFA`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: false
          },
          ticks: {
            font: { size: 10 },
            maxRotation: 45,
            minRotation: 45,
            padding: 8,
            color: '#6b7280',
            maxTicksLimit: 12,
            autoSkip: false
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Valeur moyenne (M FCFA)',
            font: {
              size: 10,
              weight: 'bold'
            }
          },
          ticks: {
            font: { size: 9 },
            color: '#6b7280',
            callback: function(value: any) {
              return new Intl.NumberFormat('fr-FR', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
              }).format(value) + ' M';
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      }
    };
  }
}


