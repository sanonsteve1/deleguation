import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { StatistiqueAgence } from '../../../../models/statistique-agence';

@Component({
    selector: 'app-agence-widget',
    standalone: true,
    imports: [CommonModule, ChartModule, TableModule, TagModule],
    template: `
        <!-- Message si aucune donnée -->
        <div *ngIf="hasNoData()" class="p-4 text-center">
            <i class="pi pi-info-circle text-4xl text-blue-500 mb-3"></i>
            <div class="text-lg font-semibold text-gray-700 mb-2">Aucune donnée</div>
            <div class="text-sm text-gray-600 mb-3">Aucune agence trouvée pour les critères sélectionnés.</div>
            <div class="text-xs text-gray-500">Les agences apparaîtront ici dès qu'elles seront disponibles.</div>
        </div>

        <!-- Graphique et tableau si il y a des données -->
        <div *ngIf="!hasNoData()">
            <p-chart type="bar" [data]="chartData" [options]="chartOptions" height="200px"></p-chart>

            <div class="mt-3">
                <p-table [value]="statistiques" styleClass="p-datatable-sm" [scrollable]="true" scrollHeight="180px">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Agence</th>
                            <th class="text-right">Nombre</th>
                            <th class="text-right" style="width: 20%">%</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-agence>
                        <tr>
                            <td>
                                <div class="font-bold text-sm">{{ agence.nomAgence }}</div>
                                <small class="text-500 text-xs">{{ agence.nomDepartement }}</small>
                            </td>
                            <td class="text-right font-bold text-sm">
                                <span [class]="agence.nombreBranchements === 0 ? 'text-gray-400' : 'text-green-600'">
                                    {{ agence.nombreBranchements | number: '1.0-0' : 'fr-FR' }}
                                </span>
                            </td>
                            <td class="text-right font-semibold text-sm">
                                <span *ngIf="agence.contributionRegion" class="text-blue-600"> {{ agence.contributionRegion | number: '1.1-1' : 'fr-FR' }}% </span>
                                <span *ngIf="!agence.contributionRegion" class="text-gray-400">-</span>
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
export class AgenceWidgetComponent implements OnInit, OnChanges {
    @Input() statistiques: StatistiqueAgence[] = [];

    chartData: any;
    chartOptions: any;

    ngOnInit(): void {
        this.prepareChartData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['statistiques'] && changes['statistiques'].currentValue) {
            this.prepareChartData();
        }
    }

    prepareChartData(): void {
        const top10 = this.statistiques.slice(0, 10);

        // Palette de couleurs variées pour les agences
        const colors = [
            { bg: '#42A5F5', border: '#1E88E5' },  // Bleu
            { bg: '#66BB6A', border: '#43A047' },  // Vert
            { bg: '#FFA726', border: '#FB8C00' },  // Orange
            { bg: '#EF5350', border: '#E53935' },  // Rouge
            { bg: '#AB47BC', border: '#8E24AA' },  // Violet
            { bg: '#26C6DA', border: '#00ACC1' },  // Cyan
            { bg: '#FFCA28', border: '#FFB300' },  // Jaune
            { bg: '#EC407A', border: '#D81B60' },  // Rose
            { bg: '#5C6BC0', border: '#3949AB' },  // Indigo
            { bg: '#78909C', border: '#546E7A' }   // Bleu gris
        ];

        // Assigner des couleurs à chaque barre
        const backgroundColors = top10.map((_, index) => colors[index % colors.length].bg);
        const borderColors = top10.map((_, index) => colors[index % colors.length].border);

        this.chartData = {
            labels: top10.map((s) => (s.nomAgence.length > 15 ? s.nomAgence.substring(0, 15) + '...' : s.nomAgence)),
            datasets: [
                {
                    label: 'Branchements',
                    data: top10.map((s) => s.nombreBranchements),
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2
                }
            ]
        };

        this.chartOptions = {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context: any) => `Branchements: ${context.parsed.x.toLocaleString('fr-FR')}`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value: any) => value.toLocaleString('fr-FR')
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
        return this.statistiques && this.statistiques.length > 0 && this.statistiques.every((agence) => agence.nombreBranchements === 0);
    }

    hasNoData(): boolean {
        return !this.statistiques || this.statistiques.length === 0;
    }
}
