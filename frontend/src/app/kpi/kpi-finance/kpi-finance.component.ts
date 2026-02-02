import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule, DecimalPipe, NgIf} from "@angular/common";
import {ProgressSpinner, ProgressSpinnerModule} from "primeng/progressspinner";
import {ChartModule, UIChart} from "primeng/chart";
import {StatistiquesKPIFinanceService} from "../../../services/statitiques-kpi-finance.service";
import {StatistiqueKpiFinance} from "../../../models/EvolutionsKpiFinanceResponse.model";
import {Button} from "primeng/button";
import {DropdownModule} from "primeng/dropdown";
import {forkJoin} from "rxjs";
import {finalize} from "rxjs/operators";
import {
    StatistiqueMensuelleResponsesKpiTechnique
} from "../../../models/statistique-mensuelles-responses-kpi-technique";
import {FormsModule} from "@angular/forms";

@Component({
    selector: 'app-kpi-finance',
    standalone: true,
    imports: [CommonModule, ChartModule, ProgressSpinnerModule, Button, DropdownModule, FormsModule],
    templateUrl: './kpi-finance.component.html',
    styleUrls: ['./kpi-finance.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiFinanceComponent implements OnInit {
    annees: number[] = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
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
    loading: boolean = false;
    loadingMessage: string = 'Chargement des statistiques financières...';
    chartData: any;
    chartOptions: any;
    headerFinance: string = 'Evolution CA, CAPEX, OPEX';
    headerCaOpex: string = 'Evolution Ratio CA/OPEX';
    aucuneDonneeBranchementsDisponible: boolean = false;
    dynamicMax: number = 0;
    dynamicStepSize: number = 1;
    chartDataRatio: any;
    chartOptionsRatio: any;
    private lastRequestParams: any = null;
    loadingProgress: number = 0;
    private cache = new Map<string, any>();
    donneesMensuelleAnneePrecedente: StatistiqueKpiFinance;
    donneesMensuelleAnneeCourante: StatistiqueKpiFinance;

    constructor(
        private financeService: StatistiquesKPIFinanceService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.loadFinanceStats();
        this.chargerStatistiques();
    }

    loadFinanceStats(): void {
        this.loading = true;
        this.financeService.getAllEvolutionsKpiFinance().subscribe({
            next: (response: StatistiqueKpiFinance) => {
                this.setupChart(response);
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Erreur de chargement des statistiques financières:', err);
                this.loading = false;
                this.cdr.markForCheck();
            }
        });
    }

    private areParamsEqual(params1: any, params2: any): boolean {
        if (!params2) return false;
        return params1.mois === params2.mois && params1.annee === params2.annee;
    }

    private generateCacheKey(annee: number, params: any): string {
        return `${annee}_${params.mois || 'all'}_${params.tension || 'all'}}`;
    }

    chargerStatistiques(): void {
        const requestParams = {
            mois: this.moisSelectionne,
            annee: this.anneeSelectionnee
        };

        if (this.areParamsEqual(requestParams, this.lastRequestParams)) {
            return;
        }

        this.loading = true;
        this.lastRequestParams = requestParams;
        this.cdr.markForCheck();

        const cacheKeyCourant = this.generateCacheKey(this.anneeSelectionnee, requestParams);
        const cacheKeyPrecedent = this.generateCacheKey(this.anneeSelectionnee - 1, requestParams);

        const cachedCourant = this.cache.get(cacheKeyCourant);
        const cachedPrecedent = this.cache.get(cacheKeyPrecedent);

        if (cachedCourant && cachedPrecedent) {
            this.loadingProgress = 100;
            this.loadingMessage = 'Données mises à jour';
            this.cdr.markForCheck();

            setTimeout(() => {
                this.processData(cachedCourant, cachedPrecedent);
            }, 50);
            return;
        }

        const anneeCourante$ = cachedCourant ? Promise.resolve(cachedCourant) : this.financeService.getAllEvolutionsKpiFinance(this.moisSelectionne, this.anneeSelectionnee);

        const anneePrecedente$ = cachedPrecedent ? Promise.resolve(cachedPrecedent) : this.financeService.getAllEvolutionsKpiFinance(this.moisSelectionne, this.anneeSelectionnee - 1);

        this.simulateProgress();

        forkJoin({
            anneeCourante: anneeCourante$,
            anneePrecedente: anneePrecedente$
        })
            .pipe(
                finalize(() => {
                    this.loading = false;
                    this.loadingProgress = 0;
                    this.cdr.markForCheck();
                })
            )
            .subscribe({
                next: (responses) => {
                    if (!cachedCourant) this.cache.set(cacheKeyCourant, responses.anneeCourante);
                    if (!cachedPrecedent) this.cache.set(cacheKeyPrecedent, responses.anneePrecedente);

                    this.processData(responses.anneeCourante, responses.anneePrecedente);
                },
                error: (error) => {
                    console.error('Erreur lors du chargement des statistiques:', error);
                    this.loading = false;
                    this.loadingProgress = 0;
                    this.cdr.markForCheck();
                }
            });
    }

   formatFcfaToMilliards(value: number | null | undefined): string {
		if (value === null || value === undefined || value === 0) {
			return '-';
		}
		const milliards = value / 1000000000; // Conversion FCFA vers milliards
		return milliards.toLocaleString('fr-FR', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}) + ' Mds Fcfa';
	}


    formatRatio(value: number | null | undefined): string {
        if (value === null || value === undefined) {
            return '-';
        }
        return value.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + '%';
    }

    private simulateProgress(): void {
        this.loadingProgress = 0;
        this.loadingMessage = 'Récupération des données...';
        const progressInterval = setInterval(() => {
            if (this.loadingProgress < 90) {
                this.loadingProgress += Math.random() * 15;
                this.loadingMessage = this.loadingProgress < 50 ? 'Récupération des données...' : 'Traitement des graphiques...';
                this.cdr.markForCheck();
            } else {
                clearInterval(progressInterval);
            }
        }, 100);
    }

    private processData(anneeCourante: any, anneePrecedente: any): void {
        this.loadingProgress = 100;
        this.loadingMessage = 'Finalisation...';
        this.cdr.markForCheck();
        requestAnimationFrame(() => {
            this.donneesMensuelleAnneeCourante = anneeCourante;
            this.donneesMensuelleAnneePrecedente = anneePrecedente;
            this.loading = false;
            this.loadingProgress = 0;
           // 🟢 Mets à jour le graphique ici
    this.setupChart(this.donneesMensuelleAnneeCourante);
            this.cdr.markForCheck();
        });
    }

    reinitialiserFiltres(): void {
        this.anneeSelectionnee = 2025;
        this.moisSelectionne = null;
        this.aucuneDonneeBranchementsDisponible = false;
        this.chargerStatistiques();
    }

    private setupChart(data: StatistiqueKpiFinance): void {
        const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);
        const moisLabels = ['Jan', 'Fév', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sept', 'Oct', 'Nov', 'Déc'];

        const completeEvolutionCa = allMonths.map((m) => data.evolutionCa.find((e) => e.mois === m) || { mois: m, montant: 0 });
        const completeEvolutionCapex = allMonths.map((m) => data.evolutionCapex.find((e) => e.mois === m) || { mois: m, montant: 0 });
        const completeEvolutionOpex = allMonths.map((m) => data.evolutionOpex.find((e) => e.mois === m) || { mois: m, montant: 0 });
        const completeRatioOpexCa = allMonths.map((m) => data.ratioOpexCa.find((e) => e.mois === m) || { mois: m, ratioOpexCa: 0 });

        const labels = allMonths.map((m) => moisLabels[m - 1]);
        const caData = completeEvolutionCa.map((e) => e.montant || null);
        const capexData = completeEvolutionCapex.map((e) => e.montant || null);
        const opexData = completeEvolutionOpex.map((e) => e.montant || null);
        const ratioData = completeRatioOpexCa.map((e) => e.ratioOpexCa || null);

        this.aucuneDonneeBranchementsDisponible = caData.every((v) => v === null) && capexData.every((v) => v === null) && opexData.every((v) => v === null);

        const allValues = [...caData, ...capexData, ...opexData].filter((v) => v !== null);
        const maxVal = allValues.length ? Math.max(...allValues) : 10;
        this.dynamicMax = maxVal * 1.1;
        this.dynamicStepSize = Math.ceil(this.dynamicMax / 5);

        this.chartData = {
            labels,
            datasets: [
                {
                    label: 'CA',
                    data: caData,
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79,70,229,0.15)',
                    fill: false,
                    tension: 0.3
                },
                {
                    label: 'CAPEX',
                    data: capexData,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16,185,129,0.15)',
                    fill: false,
                    tension: 0.3
                },
                {
                    label: 'OPEX',
                    data: opexData,
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245,158,11,0.15)',
                    fill: false,
                    tension: 0.3
                }
            ]
        };

        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: { left: 20, right: 20, top: 15, bottom: 85 }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 15,
                        color: '#333',
                        font: { size: 12, weight: 'bold' }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const val = context.parsed.y;
                            if (val == null) return '';
                            if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(2) + ' Mds FCFA';
                            if (val >= 1_000_000) return (val / 1_000_000).toFixed(2) + ' M FCFA';
                            return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
                        },
                        title: (tooltipItems: any) => {
                            labels[tooltipItems[0].dataIndex]
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    max: this.dynamicMax,
                    title: {
                        display: true,
                        text: 'Montant (Mds FCFA)',
                        color: '#333'
                    },
                    ticks: {
                        color: '#555',
                        callback: (value: number) => {
                            return (value / 1_000_000_000).toFixed(0) + ' Mds';
                        }
                    }
                },
                x: {
                    ticks: { color: '#555', font: { size: 10, weight: 'bold' } }
                }
            }
        };

        this.chartDataRatio = {
            labels,
            datasets: [
                {
                    label: 'Ratio OPEX / CA (%)',
                    data: ratioData,
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239,68,68,0.15)',
                    fill: false,
                    tension: 0.3
                }
            ]
        };

        this.chartOptionsRatio = {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: { left: 20, right: 20, top: 15, bottom: 85 }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        color: '#333',
                        font: { size: 12, weight: 'bold' }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const val = context.parsed.y;
                            return val != null ? val.toFixed(2) + ' %' : '';
                        },
                        title: (tooltipItems: any) => labels[tooltipItems[0].dataIndex]
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Ratio OPEX / CA (%)',
                        color: '#333'
                    },
                    ticks: {
                        color: '#555',
                        callback: (value: any) => value + ' %'
                    }
                },
                x: {
                    ticks: { color: '#555', font: { size: 10, weight: 'bold' } }
                }
            }
        };
    }



}
