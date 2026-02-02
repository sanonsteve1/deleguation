import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ChartModule} from 'primeng/chart';
import {DropdownModule} from 'primeng/dropdown';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {ProgressSpinner} from "primeng/progressspinner";

import {StatistiquesKPIDsiService} from '../../../services/statistiques-kpi-dsi.service';
import {StatistiqueMensuelKpiDsi} from "../../../models/StatistiqueMensuelKpiDsi";


@Component({
    selector: 'app-kpi-dsi',
    imports: [ButtonModule, ChartModule, FormsModule, DropdownModule, CardModule, CommonModule, ProgressSpinner],
    templateUrl: './kpi-dsi.component.html',
    styleUrl: './kpi-dsi.component.scss'
})
export class KpiDsiComponent implements OnInit {

    annees: number[] = [2025];
    mois = [
        {label: 'Toute l\'année', value: null},
        {label: 'Janv', value: 1},
        {label: 'Fév', value: 2},
        {label: 'Mars', value: 3},
        {label: 'Avr', value: 4},
        {label: 'Mai', value: 5},
        {label: 'Juin', value: 6},
        {label: 'Jul', value: 7},
        {label: 'Aoû', value: 8},
        {label: 'Sep', value: 9},
        {label: 'Oct', value: 10},
        {label: 'Nov', value: 11},
        {label: 'Déc', value: 12}
    ];

    // Labels des mois mémorisés (sans "Toute l'année")
    private readonly moisLabels: string[] = this.mois.slice(1).map(m => m.label);

    anneeSelectionnee = 2025;
    moisSelectionne?: number;

    chartData: any;
    chartOptions: any;
    loading = false;
    statistiqueMensuelKpiDsi: StatistiqueMensuelKpiDsi;
    loadingMessage: string = "page en cours de chargement"

    constructor(private kpiService: StatistiquesKPIDsiService) {
    }

    ngOnInit(): void {
        this.moisSelectionne = null;
        this.chargerStatistiques();
    }

    chargerStatistiques(): void {
        this.loading = true;

        this.kpiService.getStatistiquesMensuelles(this.anneeSelectionnee, this.moisSelectionne)
            .subscribe({
                next: (data: StatistiqueMensuelKpiDsi) => {

                    const labels = this.moisLabels;
                    this.statistiqueMensuelKpiDsi = data;

                    const dataDispoServeurMensuel = new Array(12).fill(null);

                    if (this.statistiqueMensuelKpiDsi?.donneesMensuelles) {
                        this.statistiqueMensuelKpiDsi?.donneesMensuelles.forEach(d => {
                            const moisIndex = d.mois - 1;
                            if (moisIndex >= 0 && moisIndex < 12) {
                                dataDispoServeurMensuel[moisIndex] = d.tauxDisponibilite ?? null;
                            }
                        });
                    }

                    this.chartData = {
                        labels,
                        datasets: [
                            {
                                data: dataDispoServeurMensuel,
                                borderColor: '#42A5F5',
                                tension: 0.4,
                                pointRadius: 4,
                                pointBackgroundColor: '#1E88E5',
                                pointBorderColor: '#fff',
                                pointHoverRadius: 6,
                                pointHoverBackgroundColor: '#fff',
                                pointHoverBorderColor: '#42A5F5'
                            }
                        ]
                    };

                    const documentStyle = getComputedStyle(document.documentElement);
                    const textColor = documentStyle.getPropertyValue('--text-color');
                    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
                    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

                    this.chartOptions = {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false,
                                position: 'bottom', // ← place la légende en bas

                                labels: {
                                    color: textColor,
                                    font: {
                                        size: 13,
                                        weight: 'bold'
                                    }
                                }
                            },
                            tooltip: {
                                titleColor: '#fff',
                                bodyColor: '#fff',
                                borderColor: '#ffffff',
                                borderWidth: 1
                            }
                        },
                        scales: {
                            x: {
                                ticks: {
                                    color: textColorSecondary,
                                    font: {
                                        size: 11
                                    }
                                },
                                grid: {
                                    color: surfaceBorder,
                                    drawBorder: false
                                }
                            },
                            y: {
                                beginAtZero: false,
                                ticks: {
                                    color: textColorSecondary,
                                    font: {
                                        size: 11
                                    },
                                    callback: (value: number) => value + '%'
                                },
                                grid: {
                                    color: surfaceBorder,
                                    drawBorder: false
                                }
                            }
                        },
                        elements: {
                            line: {
                                borderWidth: 2.5
                            }
                        }
                    };

                    this.loading = false;
                },
                error: (err) => {
                    console.error('Erreur de chargement:', err);
                    this.loading = false;
                }
            });

    }

    // Méthode pour formater les valeurs KPI (afficher '-' si 0)
    formatKPIValue(value: number | null | undefined): string {
        if (value === null || value === undefined || value === 0) {
            return '-';
        }
        return value.toLocaleString('fr-FR');
    }


    get tauxDisponibiliteMensuelle(): string | undefined {
        let donneeMensuelle = null;
        if (this.moisSelectionne && this.statistiqueMensuelKpiDsi?.donneesMensuelles) {
            donneeMensuelle = this.statistiqueMensuelKpiDsi.donneesMensuelles.find(
                (d: any) => d.mois === this.moisSelectionne
            );
        }
        return this.formatKPIValue(donneeMensuelle?.tauxDisponibilite);
    }


    reinitialiserFiltres(): void {
        this.moisSelectionne = null;
        this.anneeSelectionnee = 2025;
        this.chargerStatistiques();
    }
}
