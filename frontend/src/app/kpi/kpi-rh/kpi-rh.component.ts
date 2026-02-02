import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import {  MessageService } from 'primeng/api';
import {EffectifCumul} from "../../../models/effectif-cumul.model";
import {EffectifService} from "../../../services/effectif.service";
import {ToastModule} from "primeng/toast";
import {DropdownModule} from "primeng/dropdown";
import {ButtonModule} from "primeng/button";
import {FormsModule} from "@angular/forms";

@Component({
    selector: 'app-kpi-rh',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ChartModule,
        ProgressSpinnerModule,
        ToastModule,
        DropdownModule,
        ButtonModule,
        FormsModule
    ],
    providers: [MessageService],
    templateUrl: './kpi-rh.component.html',
    styleUrls: ['./kpi-rh.component.scss']
})
export class KpiRhComponent implements OnInit {

    effectifCumul?: EffectifCumul;
    loading = false;

    directions: { label: string; value: string | null }[] = [
        { label: 'Toutes les directions', value: null }
    ];
    directionSelectionnee: string | null = null;

    // 🔹 Graphiques globaux
    chartDirection: any;
    chartTrancheAgeDirection: any;
    chartCategorieDirection: any;

    // 🔹 Graphiques filtrés
    chartTrancheAgeFiltre: any;
    chartCategorieFiltre: any;
    chartDepartementPie: any;
    chartOptionsPie: any;
    chartOptions: any;
    chartOptionsNoLegend: any;

    constructor(
        private effectifService: EffectifService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.chargerEffectifs();
    }

    chargerEffectifs(): void {
        this.loading = true;
        this.effectifService.getEffectifGeneral(this.directionSelectionnee ?? undefined).subscribe({
            next: (data) => {
                this.effectifCumul = data;
                this.updateDirectionsList();
                this.initCharts();
                this.loading = false;
            },
            error: (err) => {
                console.error('Erreur lors du chargement des effectifs', err);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les données des effectifs' });
                this.loading = false;
            }
        });
    }

    private updateDirectionsList(): void {
        if (this.effectifCumul?.totalEffectifParDirection) {
            const directionsFromBackend = Object.keys(this.effectifCumul.totalEffectifParDirection);
            this.directions = [
                { label: 'Toutes les directions', value: null },
                ...directionsFromBackend.map(dir => ({ label: dir, value: dir }))
            ];
        }
    }

    reinitialiserFiltre(): void {
        this.directionSelectionnee = null;
        this.chargerEffectifs();
    }

    private initCharts(): void {
        if (!this.effectifCumul) return;

        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { stacked: true },
                y: { stacked: true }
            },
            plugins: {
                legend: { position: 'bottom', align: 'center', labels: { color: '#495057', boxWidth: 20, padding: 8, font: { size: 11 } } }
            }
        };

        this.chartOptionsNoLegend = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        };

        if (!this.directionSelectionnee) {
            // 🔹 Graphiques globaux existants
            this.initGlobalCharts();
        } else {
            this.initPieChartOptions();
            // 🔹 Graphiques filtrés pour une direction
            // 🔹 Graphiques filtrés pour une direction
            const ordreTranches = ['0 - 30', '31 - 45', '46 - 54', '>= 55'];
            const tranches = ordreTranches.filter(t => this.effectifCumul!.totalParTrancheAge.hasOwnProperty(t));
            
            const trancheColors: Record<string, string> = {
                '0 - 30': '#42A5F5',
                '31 - 45': '#66BB6A',
                '46 - 54': '#FFA726',
                '>= 55': '#AB47BC'
            };

            this.chartTrancheAgeFiltre = {
                labels: tranches, // 🔹 Les tranches d'âge en abscisse
                datasets: [{
                    label: 'Effectif',
                    data: tranches.map(t => this.effectifCumul!.totalParTrancheAge[t]),
                    backgroundColor: tranches.map(t => trancheColors[t] || '#42A5F5'),
                    borderWidth: 1
                }]
            };

            const categories = Object.keys(this.effectifCumul.totalParCategorieAgent);
            const categoryColors: Record<string, string> = {
                'agent cadre': '#42A5F5',
                'agent dexecution': '#66BB6A',
                'agent dexécution': '#66BB6A',
                'agent de maitrise': '#FFA726',
                'agent de maîtrise': '#FFA726',
                'agent general': '#AB47BC',
                'agent général': '#AB47BC'
            };

            const normalize = (str: string) =>
                str
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[']/g, '')
                    .trim();

            this.chartCategorieFiltre = {
                labels: categories, // 🔹 Les catégories en abscisse
                datasets: [{
                    label: 'Effectif',
                    data: categories.map(c => this.effectifCumul!.totalParCategorieAgent[c]),
                    backgroundColor: categories.map(c => {
                        const key = normalize(c);
                        return categoryColors[key] || '#42A5F5';
                    }),
                    borderWidth: 1
                }]
            };

            // 🥧 Affichage de la densité (%) par département dans le pie chart
            if (this.effectifCumul.densiteParDepartement) {
                const departements = Object.keys(this.effectifCumul.densiteParDepartement);
                const valeursDensite = Object.values(this.effectifCumul.densiteParDepartement);

                // 🎨 couleurs uniques à chaque département
                const couleurs = this.generateUniqueColors(departements.length);

                this.chartDepartementPie = {
                    labels: departements,
                    datasets: [{
                        data: valeursDensite,
                        backgroundColor: couleurs,
                        hoverBackgroundColor: couleurs.map(color => color + 'CC') // Ajouter transparence au hover
                    }]
                };
            }
        }
    }

    private initPieChartOptions(): void {
        this.chartOptionsPie = {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            layout: {
                padding: {
                    left: 5,
                    right: 5,
                    top: 5,
                    bottom: 5
                }
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        generateLabels: (chart: any) => {
                            const dataset = chart.data.datasets[0];
                            const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                            return chart.data.labels.map((label: string, i: number) => {
                                const value = dataset.data[i];
                                const pourcentage = total ? ((value / total) * 100).toFixed(1) : '0';
                                return {
                                    text: `${label} (${pourcentage}%)`,
                                    fillStyle: dataset.backgroundColor[i]
                                };
                            });
                        },
                        usePointStyle: true,
                        padding: 8,
                        font: { size: 10 },
                        boxWidth: 1,
                        boxHeight: 5
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                            const value = context.parsed;
                            const pourcentage = total ? ((value / total) * 100).toFixed(1) : '0';
                            return `${value} (${pourcentage}%)`;
                        }
                    }
                }
            },
            elements: {
                arc: {
                    borderWidth: 2,
                    borderColor: '#fff'
                }
            }
        };
    }

    private initGlobalCharts(): void {
        const directionsTotaux = Object.keys(this.effectifCumul.totalEffectifParDirection);
        const values = Object.values(this.effectifCumul.totalEffectifParDirection);
        const uniqueColors = this.generateUniqueColors(directionsTotaux.length); // couleurs uniques

        this.chartDirection = {
            labels: directionsTotaux, // 🔹 Les directions en abscisse
            datasets: [{
                label: 'Effectif',
                data: values,
                backgroundColor: uniqueColors,
                borderWidth: 1
            }]
        };

        // 🔹 Graphique : Tranches d'âge × Direction (Bar chart empilé)
        const directions = Object.keys(this.effectifCumul.densiteTrancheParDirection);
        const ordreTranches = ['0 - 30', '31 - 45', '46 - 54', '>= 55'];
        const tranchesDisponibles = ordreTranches.filter(t => 
            directions.some(dir => this.effectifCumul.densiteTrancheParDirection[dir][t] !== undefined)
        );

        const trancheColors: Record<string, string> = {
            '0 - 30': '#42A5F5',
            '31 - 45': '#66BB6A',
            '46 - 54': '#FFA726',
            '>= 55': '#AB47BC'
        };

        const datasetsTrancheDirection = tranchesDisponibles.map(tranche => {
            return {
                label: tranche,
                data: directions.map(dir => this.effectifCumul!.densiteTrancheParDirection[dir][tranche] ?? 0),
                backgroundColor: trancheColors[tranche] || '#42A5F5',
                borderWidth: 1
            };
        });

        this.chartTrancheAgeDirection = {
            labels: directions,
            datasets: datasetsTrancheDirection
        };

        // 🔹 Graphique : Catégories pro × Direction (Bar chart empilé)
        const categories = Object.keys(this.effectifCumul.densiteParCategorieParDirection[directions[0]] || {});

        const categoryColors: Record<string, string> = {
            'agent cadre': '#42A5F5',
            'agent dexecution': '#66BB6A',
            'agent dexécution': '#66BB6A',
            'agent de maitrise': '#FFA726',
            'agent de maîtrise': '#FFA726',
            'agent general': '#AB47BC',
            'agent général': '#AB47BC'
        };

        const normalize = (str: string) =>
            str
                .toLowerCase()
                .normalize('NFD') // supprime les accents
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[’']/g, '') // remplace les apostrophes
                .trim();

        const datasetsCategorieDirection = categories.map(cat => {
            const key = normalize(cat);
            const color = categoryColors[key] || '#42A5F5'; // fallback : bleu par défaut
            return {
                label: cat,
                data: directions.map(dir => this.effectifCumul!.densiteParCategorieParDirection[dir][cat] ?? 0),
                backgroundColor: color,
                borderWidth: 1
            };
        });

        this.chartCategorieDirection = {
            labels: directions,
            datasets: datasetsCategorieDirection
        };
    }

    private generateUniqueColors(length: number): string[] {
        const palette = [
            '#3366CC', '#DC3912', '#FF9900', '#109618', '#990099',
            '#0099C6', '#DD4477', '#91c81f', '#aa0e0e', '#316395',
            '#592859', '#22AA99', '#4d7a0b', '#6633CC', '#E67300',
            '#8c4949', '#c532c6', '#329262', '#5574A6', '#3B3EAC'
        ];
        return Array.from({ length }, (_, i) => palette[i % palette.length]);
    }

    private generateColors(length: number): string[] {
        const baseColors = ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#EC407A', '#26C6DA', '#7E57C2', '#FF7043'];
        const colors: string[] = [];
        for (let i = 0; i < length; i++) {
            colors.push(baseColors[i % baseColors.length]);
        }
        return colors;
    }
}
