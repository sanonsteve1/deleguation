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
  selector: 'app-performance-logistique',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, ButtonModule, ChartModule, ProgressSpinnerModule, OverlayPanelModule],
  templateUrl: './performance-logistique.component.html',
  styleUrls: ['./performance-logistique.component.scss']
})
export class PerformanceLogistiqueComponent implements OnInit {
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

  formatKPIValue(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '-';
    }
    return value.toLocaleString('fr-FR');
  }

  formatPourcentage(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '-';
    }
    return value.toFixed(2) + '%';
  }

  formatJours(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '-';
    }
    const jours = Math.floor(value);
    if (jours === 0) {
      return '< 1 jour';
    } else if (jours === 1) {
      return '1 jour';
    } else {
      return `${jours} jours`;
    }
  }

  // 1. Courbe d'évolution du niveau de stock
  updateChartEvolutionStock(): void {
    const labels = this.moisLabels;
    const dataInit = this.dataKpiStock?.donneesMensuellesKpiStock || [];
    
    const dataStock = new Array(12).fill(null);
    dataInit.forEach(d => {
      const moisIndex = d.mois - 1;
      if (moisIndex >= 0 && moisIndex < 12 && d.valeurTotaleStock >= 0) {
        dataStock[moisIndex] = d.valeurTotaleStock / 1e6; // Convertir en millions
      }
    });

    this.aucuneDonneeEvolutionStockDisponible = dataStock.every(v => v === null || v === undefined);

    this.chartDonneesEvolutionStock = {
      labels,
      datasets: [{
        label: 'Niveau de stock (M FCFA)',
        data: dataStock,
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
      layout: { padding: { left: 8, right: 8, top: 15, bottom: 85 } },
      plugins: {
        legend: { position: 'bottom', labels: { color: '#495057', boxWidth: 20, padding: 8, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            title: (tooltipItems: any) => {
              const item = tooltipItems[0];
              return this.mois.slice(1)[item.dataIndex]?.label || `Mois ${item.label}`;
            },
            label: (context: any) => {
              const val = context.parsed.y;
              if (val === null || val === undefined) return 'Aucune donnée';
              return `Stock: ${val.toFixed(2)} M FCFA`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: false },
          ticks: { font: { size: 10 }, maxRotation: 45, minRotation: 45, padding: 8, color: '#6b7280', maxTicksLimit: 12, autoSkip: false },
          grid: { display: true, color: 'rgba(0, 0, 0, 0.05)' }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Valeur stock (M FCFA)', font: { size: 10, weight: 'bold' } },
          ticks: { font: { size: 9 }, color: '#6b7280' },
          grid: { display: true, color: 'rgba(0, 0, 0, 0.05)' }
        }
      }
    };
  }

}


