import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { StatistiqueAmperage } from '../../../../models/statistique-amperage';

@Component({
    selector: 'app-amperage-widget',
    standalone: true,
    imports: [CommonModule, ChartModule, TableModule, TagModule],
    template: `
        <!-- Message si aucune donnée -->
        <div *ngIf="hasNoData()" class="p-4 text-center">
            <i class="pi pi-info-circle text-4xl text-blue-500 mb-3"></i>
            <div class="text-lg font-semibold text-gray-700 mb-2">Aucune donnée</div>
            <div class="text-sm text-gray-600 mb-3">Aucune donnée d'ampérage trouvée pour les critères sélectionnés.</div>
            <div class="text-xs text-gray-500">Les ampérages apparaîtront ici dès qu'ils seront disponibles.</div>
        </div>

        <!-- Graphique et tableau si il y a des données -->
        <div *ngIf="!hasNoData()">
            <p-chart type="bar" [data]="chartData" [options]="chartOptions" height="200px"></p-chart>

            <div class="mt-3">
                <p-table [value]="statistiquesTriees" styleClass="p-datatable-sm" [scrollable]="true" scrollHeight="180px">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Ampérage</th>
                            <th class="text-right">Nombre</th>
                            <th class="text-right" style="width: 20%">%</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-stat>
                        <tr>
                            <td><p-tag [value]="stat.libelleAmperage" severity="info" [rounded]="true"></p-tag></td>
                            <td class="text-right font-bold text-sm">
                                <span [class]="stat.nombreBranchements === 0 ? 'text-gray-400' : 'text-green-600'">
                                    {{ stat.nombreBranchements | number: '1.0-0' : 'fr-FR' }}
                                </span>
                            </td>
                            <td class="text-right font-semibold text-sm">
                                <span [class]="stat.pourcentage === 0 ? 'text-gray-400' : 'text-blue-600'"> {{ stat.pourcentage | number: '1.1-1' : 'fr-FR' }}% </span>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    `,
    styles: [
        `
            :host ::ng-deep {
                .p-datatable .p-datatable-thead > tr > th,
                .p-datatable .p-datatable-tbody > tr > td {
                    padding: 0.5rem !important;
                }
            }
        `
    ]
})
export class AmperageWidgetComponent implements OnInit, OnChanges {
    @Input() statistiques: StatistiqueAmperage[] = [];

    chartData: any;
    chartOptions: any;
    statistiquesTriees: StatistiqueAmperage[] = [];

    ngOnInit(): void {
        this.prepareChartData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['statistiques'] && changes['statistiques'].currentValue) {
            this.prepareChartData();
        }
    }

    prepareChartData(): void {
        console.log('AmperageWidget - prepareChartData called with:', this.statistiques);

        if (!this.statistiques || this.statistiques.length === 0) {
            console.warn('AmperageWidget - No statistics data available');
            this.statistiquesTriees = [];
            this.chartData = {
                labels: [],
                datasets: [
                    {
                        label: 'Branchements',
                        data: [],
                        backgroundColor: [],
                        borderColor: [],
                        borderWidth: 2
                    }
                ]
            };
            return;
        }

        // Trier les statistiques par valeur d'ampérage (croissant)
        this.statistiquesTriees = [...this.statistiques].sort((a, b) => a.valeurAmperage - b.valeurAmperage);

        // Palette de couleurs variées
        const colors = [
            { bg: '#42A5F5', border: '#1E88E5' },  // Bleu
            { bg: '#66BB6A', border: '#43A047' },  // Vert
            { bg: '#FFA726', border: '#FB8C00' },  // Orange
            { bg: '#EF5350', border: '#E53935' },  // Rouge
            { bg: '#AB47BC', border: '#8E24AA' },  // Violet
            { bg: '#26C6DA', border: '#00ACC1' },  // Cyan
            { bg: '#FFEE58', border: '#FDD835' },  // Jaune
            { bg: '#EC407A', border: '#D81B60' },  // Rose
            { bg: '#5C6BC0', border: '#3949AB' },  // Indigo
            { bg: '#78909C', border: '#546E7A' },  // Bleu gris
            { bg: '#FF7043', border: '#F4511E' },  // Orange foncé
            { bg: '#9CCC65', border: '#7CB342' }   // Vert clair
        ];

        // Assigner des couleurs à chaque barre
        const backgroundColors = this.statistiquesTriees.map((_, index) => colors[index % colors.length].bg);
        const borderColors = this.statistiquesTriees.map((_, index) => colors[index % colors.length].border);

        this.chartData = {
            labels: this.statistiquesTriees.map((s) => s.libelleAmperage),
            datasets: [
                {
                    label: 'Branchements',
                    data: this.statistiquesTriees.map((s) => s.nombreBranchements),
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2
                }
            ]
        };

        // Vérifier si on a des écarts importants dans les valeurs
        const values = this.statistiques.map((s) => s.nombreBranchements);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values.filter((v) => v > 0));
        const useLogScale = maxValue / minValue > 10; // Si écart > 10x, utiliser échelle log

        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context: any) => `Branchements: ${context.parsed.y.toLocaleString('fr-FR')}`
                    }
                }
            },
            scales: {
                y: {
                    type: useLogScale ? 'logarithmic' : 'linear',
                    beginAtZero: !useLogScale,
                    min: useLogScale ? 0.5 : 0,
                    ticks: {
                        callback: (value: any) => {
                            // Pour échelle log, afficher seulement certaines valeurs
                            if (useLogScale) {
                                if (value === 1 || value === 10 || value === 100 || value === 1000 || value === 10000) {
                                    return value.toLocaleString('fr-FR');
                                }
                                return '';
                            }
                            return value.toLocaleString('fr-FR');
                        }
                    },
                    title: {
                        display: useLogScale,
                        text: 'Échelle logarithmique',
                        font: {
                            size: 10,
                            style: 'italic'
                        }
                    }
                }
            }
        };
    }

    getRangClass(rang: number): string {
        if (rang === 1) return 'text-yellow-500 font-bold';
        if (rang === 2) return 'text-gray-400 font-bold';
        if (rang === 3) return 'text-orange-500 font-bold';
        return '';
    }

    hasNoBranchements(): boolean {
        return !this.statistiques || this.statistiques.length === 0 || this.statistiques.every((stat) => stat.nombreBranchements === 0);
    }

    hasNoData(): boolean {
        return !this.statistiques || this.statistiques.length === 0 || this.statistiques.every((stat) => stat.nombreBranchements === 0);
    }
}
