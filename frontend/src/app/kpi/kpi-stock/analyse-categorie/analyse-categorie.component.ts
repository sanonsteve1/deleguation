import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {ButtonModule} from 'primeng/button';
import {ChartModule} from 'primeng/chart';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {ToggleSwitchModule} from 'primeng/toggleswitch';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {ChangeDetectorRef} from '@angular/core';
import {KpiStockService} from '../../../../services/kpi-stock';
import {StatistiqueMensuelleResponsesKPIStock} from '../../../../models/statistique-mensuelle-responses-kpi-stock';

@Component({
  selector: 'app-analyse-categorie',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, ButtonModule, ChartModule, ProgressSpinnerModule, ToggleSwitchModule, OverlayPanelModule],
  templateUrl: './analyse-categorie.component.html',
  styleUrls: ['./analyse-categorie.component.scss']
})
export class AnalyseCategorieComponent implements OnInit {
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

  // Graphique répartition par type
  aucuneDonneeRepartitionTypeDisponible: boolean = false;
  chartDonneesRepartitionType: any;
  chartOptionsRepartitionType: any;
  afficherQuantiteStock: boolean = false;

  // Graphique taux d'utilisation
  aucuneDonneeTauxUtilisationDisponible: boolean = false;
  chartDonneesTauxUtilisation: any = null;
  chartOptionsTauxUtilisation: any = null;

  // Graphique vieillissement des stocks
  aucuneDonneeVieillissementDisponible: boolean = false;
  chartDonneesVieillissement: any = null;
  chartOptionsVieillissement: any = null;

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
          console.log('Données reçues:', res);
          console.log('tauxRotationParCategorie:', res?.tauxRotationParCategorie);
          console.log('stockParCategorie:', res?.stockParCategorie);
          this.updateChartRepartitionType();
          this.updateChartTauxUtilisation();
          this.updateChartVieillissement();
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

  updateChartRepartitionType(): void {
    const dataInit = this.dataKpiStock?.stockParCategorie || [];
    
    // Filtrer par types spécifiques (transformateurs, câbles, compteurs)
    const typesRecherches = ['transformateur', 'câble', 'cable', 'compteur'];
    const dataFiltree = dataInit.filter(d => {
      const categorieLower = d.categorie.toLowerCase();
      return typesRecherches.some(type => categorieLower.includes(type));
    });

    // Si pas de correspondance exacte, prendre toutes les catégories
    const dataFinale = dataFiltree.length > 0 ? dataFiltree : dataInit;

    const labels = dataFinale.map(d => d.categorie);
    const data = dataFinale.map(d => this.afficherQuantiteStock ? d.quantiteStock : d.valeurTotalStock);
    this.aucuneDonneeRepartitionTypeDisponible = data.length === 0 || data.every(v => !v);

    const baseColors = ['#4ECDC4', '#FF6B6B', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];
    const darkerColors = baseColors.map(c => this.darkenHex(c, 80));

    this.chartDonneesRepartitionType = {
      labels,
      datasets: [{
        data,
        backgroundColor: darkerColors.slice(0, labels.length),
        hoverBackgroundColor: baseColors.slice(0, labels.length)
      }]
    };

    this.chartOptionsRepartitionType = {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 1,
      layout: { padding: { left: 2, right: 2, top: 10, bottom: 200 } },
      plugins: {
        legend: {
          position: 'right',
          align: 'center',
          labels: {
            generateLabels: (chart: any) => {
              const dataset = chart.data.datasets[0];
              const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
              return chart.data.labels.map((label: string, i: number) => {
                const value = dataset.data[i];
                const pourcentage = total ? ((value / total) * 100).toFixed(1) : '0';
                let formattedValue: string;
                if (this.afficherQuantiteStock) {
                  formattedValue = value.toString();
                } else if (value >= 1e9) {
                  formattedValue = (value / 1e9).toFixed(1) + ' Mds';
                } else if (value >= 1e6) {
                  formattedValue = (value / 1e6).toFixed(1) + ' M';
                } else {
                  formattedValue = value.toLocaleString('fr-FR') + ' Fcfa';
                }
                const shortLabel = this.truncateLabel(label, 22);
                return {
                  text: `${shortLabel} (${pourcentage}%)\n${formattedValue}`,
                  fillStyle: dataset.backgroundColor[i]
                };
              });
            },
            usePointStyle: true,
            padding: 6,
            font: { size: 10, weight: 'normal' },
            boxWidth: 10,
            boxHeight: 10,
            maxWidth: 220
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
              const value = context.parsed;
              const pourcentage = total ? ((value / total) * 100).toFixed(1) : '0';
              let formattedValue: string;
              if (this.afficherQuantiteStock) {
                formattedValue = value.toString();
              } else if (value >= 1e9) {
                formattedValue = (value / 1e9).toFixed(1) + ' Mds FCFA';
              } else if (value >= 1e6) {
                formattedValue = (value / 1e6).toFixed(1) + ' M FCFA';
              } else {
                formattedValue = value.toLocaleString('fr-FR') + ' FCFA';
              }
              return `${formattedValue} (${pourcentage}%)`;
            }
          }
        }
      },
      elements: {
        arc: {
          borderWidth: 2,
          borderColor: '#fff'
        }
      },
      cutout: '60%',
      radius: '80%'
    };
  }

  updateChartTauxUtilisation(): void {
    const dataInit = this.dataKpiStock?.tauxRotationParCategorie || [];
    console.log('updateChartTauxUtilisation - dataInit:', dataInit);
    const labels = dataInit.map((d: any) => d?.libelleCategorie || '');
    const data = dataInit.map((d: any) => d?.tauxRotation || 0);

    this.aucuneDonneeTauxUtilisationDisponible = data.length === 0 || data.every((v: any) => !v || v === 0);
    console.log('aucuneDonneeTauxUtilisationDisponible:', this.aucuneDonneeTauxUtilisationDisponible, 'data:', data);

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
    
    // Toujours initialiser les données du graphique
    this.chartDonneesTauxUtilisation = {
      labels: labels.length > 0 ? labels : [],
      datasets: [{
        label: 'Taux d\'utilisation (%)',
        data: data.length > 0 ? data : [],
        backgroundColor: colors.slice(0, Math.max(1, data.length)),
        borderWidth: 1
      }]
    };
    console.log('chartDonneesTauxUtilisation initialisé:', this.chartDonneesTauxUtilisation);

    this.chartOptionsTauxUtilisation = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      layout: {
        padding: {
          left: 5,
          right: 5,
          top: 5,
          bottom: 35
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const val = context.parsed.x;
              return `Taux d'utilisation: ${val.toFixed(2)}%`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Taux d\'utilisation (%)',
            font: {
              size: 11,
              weight: 'bold'
            },
            color: '#333'
          },
          ticks: {
            font: { size: 9 },
            color: '#666',
            padding: 5
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        y: {
          ticks: {
            font: { size: 9 },
            color: '#666',
            padding: 5
          },
          grid: {
            display: false
          }
        }
      }
    };
  }

  updateChartVieillissement(): void {
    // Pour le vieillissement, on utilise les données de stock par catégorie
    // En l'absence de données d'âge spécifiques, on simule avec la répartition
    const dataInit = this.dataKpiStock?.stockParCategorie || [];
    console.log('updateChartVieillissement - dataInit:', dataInit);
    
    // Utiliser les catégories et leur valeur de stock comme indicateur de vieillissement
    // (plus il y a de stock, plus il y a potentiellement de vieux stock)
    const labels = dataInit.length > 0 ? dataInit.slice(0, 8).map(d => d?.categorie || '') : [];
    // S'assurer qu'on n'a pas de valeurs nulles pour l'échelle logarithmique (minimum 0.01)
    const data = dataInit.length > 0 ? dataInit.slice(0, 8).map(d => {
      const valeur = (d?.valeurTotalStock || 0) / 1e6; // En millions
      return valeur > 0 ? valeur : 0.01; // Minimum 0.01 pour éviter les problèmes avec log(0)
    }) : [];

    this.aucuneDonneeVieillissementDisponible = data.length === 0 || data.every(v => !v || v === 0 || v === 0.01);
    console.log('aucuneDonneeVieillissementDisponible:', this.aucuneDonneeVieillissementDisponible, 'data:', data);

    // Calculer l'échelle dynamique pour que toutes les barres soient visibles
    const validData = data.filter(v => v !== null && v !== undefined && v > 0 && v !== 0.01);
    const maxValue = validData.length > 0 ? Math.max(...validData) : 0;
    const minValue = validData.length > 0 ? Math.min(...validData) : 0;
    
    // Détecter si l'écart est très grand (ratio > 50) entre max et min
    const ratio = maxValue > 0 && minValue > 0 ? maxValue / minValue : 1;
    
    // Utiliser une échelle logarithmique si l'écart est très grand
    const useLogScale = ratio > 50 && validData.length > 1;
    
    let dynamicMax: number;
    let stepSize: number;
    
    if (useLogScale) {
      // Avec échelle logarithmique, on garde le max normal mais on utilise l'échelle log
      dynamicMax = maxValue > 0 ? Math.ceil(maxValue * 1.2) : 100;
      stepSize = 1; // Pas utilisé en log
    } else {
      // Comportement normal avec une marge de 20% au-dessus
      dynamicMax = maxValue > 0 ? Math.ceil(maxValue * 1.2) : 100;
      stepSize = 10;
    }
    
    // Arrondir le max au multiple de 10 supérieur pour avoir des graduations propres
    if (!useLogScale) {
      dynamicMax = Math.ceil(dynamicMax / 10) * 10;
    }
    
    // Si le max est 0, utiliser 100 par défaut
    if (dynamicMax === 0) {
      dynamicMax = 100;
      stepSize = 10;
    }

    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6'];
    
    // Sauvegarder useLogScale et stepSize pour les utiliser dans les callbacks
    const logScale = useLogScale;
    const step = stepSize;
    
    // Toujours initialiser les données du graphique
    this.chartDonneesVieillissement = {
      labels: labels.length > 0 ? labels : [],
      datasets: [{
        label: 'Valeur stock (M FCFA)',
        data: data.length > 0 ? data : [],
        backgroundColor: colors.slice(0, Math.max(1, data.length)),
        borderWidth: 1
      }]
    };
    console.log('chartDonneesVieillissement initialisé:', this.chartDonneesVieillissement);

    this.chartOptionsVieillissement = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 5,
          right: 5,
          top: 5,
          bottom: 40
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            title: (tooltipItems: any) => {
              const item = tooltipItems[0];
              const moisIndex = item.dataIndex;
              return labels[moisIndex] || `Catégorie ${item.label}`;
            },
            label: (context: any) => {
              const val = context.parsed.y;
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
            font: { size: 9 },
            maxRotation: 0,
            minRotation: 0,
            padding: 5,
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
          beginAtZero: !logScale, // beginAtZero ne fonctionne pas avec logarithmic
          max: dynamicMax,
          type: logScale ? 'logarithmic' : 'linear',
          min: logScale ? 0.1 : 0, // Minimum pour l'échelle logarithmique
          title: {
            display: true,
            //text: 'Valeur stock (M FCFA)' + (logScale ? ' (échelle logarithmique)' : ''),
            font: {
              size: 10,
              weight: 'bold'
            }
          },
          ticks: {
            font: { size: 9 },
            color: '#6b7280',
            precision: 0,
            maxTicksLimit: logScale ? 8 : 50,
            callback: function(value: any) {
              const numValue = typeof value === 'number' ? value : parseFloat(value);
              if (logScale) {
                // Pour l'échelle logarithmique, n'afficher que les puissances de 10 exactes
                // Par exemple : 1, 10, 100, 1000 (plus lisible)
                const logValue = Math.log10(numValue);
                
                // Afficher uniquement les puissances de 10 exactes (1, 10, 100, 1000, etc.)
                if (Math.abs(logValue % 1) < 0.001) {
                  return new Intl.NumberFormat('fr-FR', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(numValue);
                }
                
                return '';
              } else {
                // Pour l'échelle linéaire, afficher selon le stepSize
                if (numValue % step === 0) {
                  return new Intl.NumberFormat('fr-FR', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(numValue);
                }
                return '';
              }
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

  reinitialiserFiltres(): void {
    this.anneeSelectionnee = 2025;
    this.moisSelectionne = null;
    this.chargerStatistiques();
  }

  // Méthodes utilitaires
  darkenHex(hex: string, amount: number) {
    let col = parseInt(hex.slice(1), 16);
    let r = Math.max(0, ((col >> 16) & 0xFF) - amount);
    let g = Math.max(0, ((col >> 8) & 0xFF) - amount);
    let b = Math.max(0, (col & 0xFF) - amount);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  private truncateLabel(label: string, maxLength: number = 24): string {
    if (!label) return '';
    const clean = label.trim();
    return clean.length <= maxLength ? clean : clean.slice(0, Math.max(0, maxLength - 1)) + '…';
  }
}


