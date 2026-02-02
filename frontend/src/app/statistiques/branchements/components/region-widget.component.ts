import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { StatistiqueRegion } from '../../../../models/statistique-region';

@Component({
    selector: 'app-region-widget',
    standalone: true,
    imports: [CommonModule, ChartModule, TableModule, TagModule, ButtonModule, TooltipModule],
    template: `
        <!-- Message si aucune donnée -->
        <div *ngIf="hasNoData()" class="p-4 text-center">
            <i class="pi pi-info-circle text-4xl text-blue-500 mb-3"></i>
            <div class="text-lg font-semibold text-gray-700 mb-2">Aucune donnée</div>
            <div class="text-sm text-gray-600 mb-3">Aucune région trouvée pour les critères sélectionnés.</div>
            <div class="text-xs text-gray-500">Les statistiques apparaîtront ici dès qu'elles seront disponibles.</div>
        </div>

        <!-- Graphique et tableau si il y a des données -->
        <div *ngIf="!hasNoData()">
            <p-chart type="doughnut" [data]="chartData" [options]="chartOptions" height="200px"></p-chart>

            <div class="mt-3">
                <p-table [value]="statistiques" styleClass="p-datatable-sm" [scrollable]="true" scrollHeight="180px">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Région</th>
                            <th class="text-right">Nombre</th>
                            <th class="text-right" style="width: 20%">%</th>
                            <th style="width: 10%"></th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-region>
                        <tr>
                            <td>
                                <div class="font-bold text-sm">{{ region.nomDepartement }}</div>
                            </td>
                            <td class="text-right font-bold text-sm">
                                <span [class]="region.nombreBranchements === 0 ? 'text-gray-400' : 'text-green-600'">
                                    {{ region.nombreBranchements | number: '1.0-0' : 'fr-FR' }}
                                </span>
                            </td>
                            <td class="text-right font-semibold text-sm">
                                <span [class]="region.partNational === 0 ? 'text-gray-400' : 'text-blue-600'"> {{ region.partNational | number: '1.1-1' : 'fr-FR' }}% </span>
                            </td>
                            <td class="text-center">
                                <button
                                    *ngIf="region.repartitionAmperages && region.repartitionAmperages.length > 0"
                                    pButton
                                    icon="pi pi-eye"
                                    class="p-button-rounded p-button-text p-button-sm"
                                    pTooltip="Détail"
                                    (click)="onDetailClick(region)"
                                ></button>
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
export class RegionWidgetComponent implements OnInit, OnChanges {
    @Input() statistiques: StatistiqueRegion[] = [];
    @Output() detailClick = new EventEmitter<StatistiqueRegion>();

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
        // Générer des couleurs uniques et bien différenciées
        const colors = this.generateUniqueColors(this.statistiques.length);

        this.chartData = {
            labels: this.statistiques.map((s) => s.nomDepartement),
            datasets: [
                {
                    data: this.statistiques.map((s) => s.partNational),
                    backgroundColor: colors,
                    hoverBackgroundColor: colors.map((c) => this.adjustBrightness(c, -20))
                }
            ]
        };

        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        padding: 8,
                        font: { size: 10 },
                        boxWidth: 10,
                        boxHeight: 10,
                        generateLabels: (chart: any) => {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label: string, i: number) => {
                                    const value = data.datasets[0].data[i];
                                    return {
                                        text: `${label} (${value.toFixed(1)}%)`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => `${context.label}: ${context.parsed.toFixed(2)}%`
                    }
                }
            }
        };
    }

    onDetailClick(region: StatistiqueRegion): void {
        this.detailClick.emit(region);
    }

    hasNoBranchements(): boolean {
        return !this.statistiques || this.statistiques.length === 0 || this.statistiques.every((region) => region.nombreBranchements === 0);
    }

    hasNoData(): boolean {
        return !this.statistiques || this.statistiques.length === 0;
    }

    getRangClass(rang: number): string {
        if (rang === 1) return 'text-yellow-500 font-bold';
        if (rang === 2) return 'text-gray-400 font-bold';
        if (rang === 3) return 'text-orange-500 font-bold';
        return '';
    }

    /**
     * Génère des couleurs uniques et bien différenciées
     */
    generateUniqueColors(count: number): string[] {
        const baseColors = [
            '#FF6384', // Rose
            '#36A2EB', // Bleu
            '#FFCE56', // Jaune
            '#4BC0C0', // Turquoise
            '#9966FF', // Violet
            '#FF9F40', // Orange
            '#66BB6A', // Vert
            '#FF6B6B', // Rouge clair
            '#4ECDC4', // Cyan
            '#45B7D1', // Bleu clair
            '#FFA07A', // Saumon
            '#98D8C8', // Menthe
            '#F7DC6F', // Jaune doré
            '#BB8FCE', // Lavande
            '#85C1E2' // Bleu poudre
        ];

        // Si on a plus d'éléments que de couleurs, générer des couleurs supplémentaires
        if (count > baseColors.length) {
            for (let i = baseColors.length; i < count; i++) {
                const hue = (i * 137.5) % 360; // Nombre d'or pour espacement optimal
                baseColors.push(`hsl(${hue}, 70%, 60%)`);
            }
        }

        return baseColors.slice(0, count);
    }

    /**
     * Ajuste la luminosité d'une couleur pour l'effet hover
     */
    adjustBrightness(color: string, amount: number): string {
        if (color.startsWith('hsl')) return color;

        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
        const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));

        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
}
