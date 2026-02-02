import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {ChartModule} from 'primeng/chart';
import {StatistiquesKPICommercialService} from "../../services/statistiques-kpi-commercial.service";
import {StatistiquesConsommationService} from "../../services/statistiques-consommation.service";
import {forkJoin} from "rxjs";
import {finalize} from "rxjs/operators";
import {ProgressSpinner} from "primeng/progressspinner";
import {ToggleSwitch} from "primeng/toggleswitch";
import {DashboardService} from "../../services/dashboard.service";
import {StatistiqueMensuelleResponsesKpiTechnique} from "../../models/statistique-mensuelles-responses-kpi-technique";
import {EffectifCumul} from "../../models/effectif-cumul.model";

import {StatistiquesKPIDsiService} from '../../services/statistiques-kpi-dsi.service';
import {StatistiqueMensuelKpiDsi} from "../../models/StatistiqueMensuelKpiDsi";
import {StatistiqueKpiFinance} from "../../models/EvolutionsKpiFinanceResponse.model";
import {StatistiquesKPIFinanceService} from "../../services/statitiques-kpi-finance.service";
import {StatistiqueMensuelleResponsesKPIStock} from "../../models/statistique-mensuelle-responses-kpi-stock";

@Component({
    selector: 'app-tableau-de-bord',
    standalone: true,
    imports: [CommonModule, FormsModule, ChartModule, RouterLink, ProgressSpinner, ToggleSwitch],
    templateUrl: './tableau-de-bord.component.html',
    styleUrls: ['./tableau-de-bord.component.scss']
})
export class TableauDeBordComponent implements OnInit {

    mois: any[] = [
        {label: 'Jan', value: 1},
        {label: 'Fév', value: 2},
        {label: 'Mar', value: 3},
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

    // Styles standardisés pour tous les graphiques
    private readonly STANDARD_LEGEND_STYLES = {
        display: true,
        position: 'bottom' as const,
        labels: {
            usePointStyle: true,
            pointStyle: 'line' as const,
            padding: 8,
            font: {
                size: 12,
                weight: 'bold' as const
            },
            boxWidth: 10,
            boxHeight: 10,
            color: '#333'
        }
    };

    // Sélecteur d'année
    selectedYear: number = 2025;
    availableYears: number[] = [2025];
    showYearDropdown: boolean = false;

    // Données pour les graphiques KPI
    commercialData: any;
    rhData: any;
    financeData: any;
    dsiData: any;
    stockData: any;
    techniqueData: any;
    chartOptions: any;
    chartOptionsFinance: any;
    chartOptionsDsi: any
    loading: boolean = false
    loadingMessage: string = "Chargement des données...";
    afficherMontant: boolean = false
    aucuneDonneeVenteDisponible: boolean

    donneesMensuelleAnneeCouranteVentes: any;
    aucuneDonneeBranchementsDisponible: boolean = false;

    // Unités dynamiques
    currentEnergyUnit: string = 'GWh';
    currentCurrencyUnit: string = 'Milliards';
    currentEnergyDivisor: number = 1000000;
    currentCurrencyDivisor: number = 1000000000;

    chartOptionsCommercial: any;
    chartOption: any;

    dynamicMax: number = 0;
    dynamicStepSize: number = 1;

    //
    headerVentes: string = "Evolution des ventes";
    headerFinance: string = "Evolution CA, CAPEX, OPEX";
    statistiqueFinances : StatistiqueKpiFinance;

    // Dashboard data
    dashboarBoardData: any;

    private readonly STANDARD_TICK_STYLES = {
        font: {
            size: 10,
            weight: 'bold' as const
        },
        color: '#333',
        padding: 8
    };

    private readonly STANDARD_AXIS_STYLES = {
        font: {
            size: 11,
            weight: 'bold' as const
        },
        color: '#333'
    };

    // Taux recouvrement cumule
    tauxRecouvrementGlobal: number = null;

    // KPI TECHNIQUE SAIDI-SAIFI
    headerMensuellesIndiceInterruption: string;
    afficherIndiceDuree: boolean = false
    donneesMensuelleAnneeCouranteKpiTechnique: StatistiqueMensuelleResponsesKpiTechnique;
    donneesMensuelleAnneeCouranteKpiDsi: StatistiqueMensuelKpiDsi;

    aucuneDonneeIndiceInterruptionDisponible: boolean = false
    chartOptionsKpiTechnique: any;
    tauxCoupureMoyen: number;

    // KPI RESSOURCE HUMAINE
    chartOptionsKpiRh: any;
    effectifCumul: EffectifCumul;

    // KPI STOCK
    chartOptionsStock: any;
    kpiStock: StatistiqueMensuelleResponsesKPIStock;


    // Labels des mois
    private readonly moisLabels: string[] = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    constructor(
        private statistiquesKpiCommercialService: StatistiquesKPICommercialService,
        private financeService: StatistiquesKPIFinanceService,
        private dashBoardService: DashboardService,
        private cdr: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        this.loading = true;
        this.initEmptyData();
        this.initChartOptions();
        this.chargerStatistiques()

    }

    toggleYearDropdown() {
        this.showYearDropdown = !this.showYearDropdown;
    }

    selectYear(year: number) {
        this.selectedYear = year;
        this.showYearDropdown = false;
        // Ici vous pouvez ajouter la logique pour recharger les données selon l'année sélectionnée
        this.refreshDataForYear(year);
    }


    chargerStatistiques(): void {
        this.loading = true;
        this.loadingMessage = "Chargement des données...";
        this.cdr.markForCheck();

        // Charger les données pour l'année courante et précédente
        const anneeCourante$ = this.statistiquesKpiCommercialService.getStatistiquesMensuellesKPI(
            undefined,
            this.selectedYear,
            undefined,
            undefined
        );

        // Charger les données du dashboard
        const dashBoard$ = this.dashBoardService.getDashboard(
            this.selectedYear
        );

        forkJoin({
            /*anneeCourante: anneeCourante$,*/
            dashBoard: dashBoard$
        }).pipe(
            finalize(() => {
                this.cdr.markForCheck();
            })
        ).subscribe({
            next: (responses) => {
                console.log('Réponses reçues:', responses);

                // Stocker les données
                this.donneesMensuelleAnneeCouranteVentes = responses.dashBoard.statistiquesCommerciales;
                /*this.dashboarBoardData = responses.dashBoard*/
                this.donneesMensuelleAnneeCouranteKpiTechnique = responses.dashBoard.statistiquesTechniques
                this.donneesMensuelleAnneeCouranteKpiDsi = responses.dashBoard.statistiquesKpiDSI


                this.effectifCumul = responses.dashBoard.effectifCumule

                this.kpiStock = responses.dashBoard.statistiquesStock

                this.tauxRecouvrementGlobal = this.donneesMensuelleAnneeCouranteVentes?.tauxRecouvrementCumule;

                this.statistiqueFinances = responses.dashBoard.statistiquesFinances;

                this.updataChartRepartitionConsommationBTEtMTGroupe();
                this.updataChartIndiceInterruption();
                this.updateKpiRh();
                this.updateKpiDsi();
                this.updataChartEvolutionChartStock();
                this.initialiserFinanceChart(this.statistiqueFinances);

                this.cdr.markForCheck();
                this.loading = false;
            },
            error: (error) => {
                console.error('Erreur lors du chargement des statistiques:', error);
                this.loading = false;
                this.cdr.markForCheck();
            }
        });
    }

    formatFcfaAuto(value: number | null | undefined): string {
        if (value === null || value === undefined || Number.isNaN(value)) return '-';

        const abs = Math.abs(value);
        const MILLION = 1_000_000;
        const MILLIARD = 1_000_000_000;

        let scaled = value;
        let suffix = '';

        if (abs >= MILLIARD) {
            scaled = value / MILLIARD;
            suffix = ' Mds Fcfa';
        } else if (abs >= MILLION) {
            scaled = value / MILLION;
            suffix = ' M Fcfa';
        } // sinon, on laisse tel quel (pas de suffixe)

        // Arrondir à 1 décimale max; pas de décimales si entier.
        const rounded = Math.round(scaled * 10) / 10;
        const isInt = Number.isInteger(rounded);

        const formatted = rounded.toLocaleString('fr-FR', {
            minimumFractionDigits: isInt ? 0 : 1,
            maximumFractionDigits: 2,
        });

        return `${formatted}${suffix}`;
    }

    refreshDataForYear(year: number) {
        // Méthode pour actualiser les données selon l'année sélectionnée
        console.log(`Actualisation des données pour l'année ${year}`);
        // Vous pouvez appeler vos services API ici pour récupérer les données de l'année sélectionnée
        this.chargerStatistiques()
    }

    initChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        font: {
                            size: 12
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
        //this.chartOptionsCommercial = this.chartOptions
    }

    initEmptyData() {
        // Données vides pour tous les graphiques KPI
        this.commercialData = {
            labels: [],
            datasets: []
        };

        this.financeData = {
            labels: [],
            datasets: []
        };

        this.rhData = {
            labels: [],
            datasets: []
        };

        this.dsiData = {
            labels: [],
            datasets: []
        };

        this.stockData = {
            labels: [],
            datasets: []
        };

        this.techniqueData = {
            labels: [],
            datasets: []
        };
    }

    initialiserFinanceChart(data: StatistiqueKpiFinance): void {
        const allMonths = Array.from({length: 12}, (_, i) => i + 1);
        const moisLabels = [
            'Jan', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin',
            'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
        ];

        // --- On complète jusqu’à décembre pour avoir tous les mois visibles ---
        const completeEvolutionCa = allMonths.map(m => {
            const found = data.evolutionCa.find(e => e.mois === m);
            return found ? found : {mois: m, montant: 0};
        });

        const completeEvolutionCapex = allMonths.map(m => {
            const found = data.evolutionCapex.find(e => e.mois === m);
            return found ? found : {mois: m, montant: 0};
        });

        const completeEvolutionOpex = allMonths.map(m => {
            const found = data.evolutionOpex.find(e => e.mois === m);
            return found ? found : {mois: m, montant: 0};
        });

        // --- 🧠 On garde tous les labels, mais on met "null" pour les mois sans données ---
        // Cela permet à Chart.js de NE PAS tracer de points là où la valeur = null
        const labels = allMonths.map(m => moisLabels[m - 1]);

        const caData = completeEvolutionCa.map(e => e.montant && e.montant !== 0 ? e.montant : null);
        const capexData = completeEvolutionCapex.map(e => e.montant && e.montant !== 0 ? e.montant : null);
        const opexData = completeEvolutionOpex.map(e => e.montant && e.montant !== 0 ? e.montant : null);

        // --- Détection s’il n’y a absolument aucune donnée ---
        this.aucuneDonneeBranchementsDisponible =
            caData.every(v => v === null) &&
            capexData.every(v => v === null) &&
            opexData.every(v => v === null);

        // --- Ajustement de l’échelle dynamique ---
        const allValues = [...caData, ...capexData, ...opexData].filter(v => v != null);
        const maxVal = allValues.length ? Math.max(...allValues) : 10;
        this.dynamicMax = maxVal * 1.1;
        this.dynamicStepSize = Math.ceil(this.dynamicMax / 5);

        console.log('dynamic max :', this.dynamicMax);
        console.log('dynamic max step size :', this.dynamicStepSize);

        this.financeData = {
            labels,
            datasets: [
                {
                    label: 'CA',
                    data: caData,
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79,70,229,0.15)',
                    fill: false,
                    tension: 0.3,
                    spanGaps: false // 👈 Important : n'affiche pas les lignes entre points séparés par null
                },
                {
                    label: 'CAPEX',
                    data: capexData,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16,185,129,0.15)',
                    fill: false,
                    tension: 0.3,
                    spanGaps: false
                },
                {
                    label: 'OPEX',
                    data: opexData,
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245,158,11,0.15)',
                    fill: false,
                    tension: 0.3,
                    spanGaps: false
                }
            ]
        };

        this.chartOptionsFinance = {
            responsive: true,
            maintainAspectRatio: false,
            layout: {padding: {left: 20, right: 20, top: 15, bottom: 85}},
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 15,
                        color: '#333',
                        font: {size: 12, weight: 'bold'}
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
                           return  labels[tooltipItems[0].dataIndex]
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
                        color: '#333',
                        font: {size: 12, weight: 'bold'}
                    },
                    ticks: {
                        color: '#555',
                        stepSize: this.dynamicStepSize,
                        callback: (value: number) => (value / 1_000_000_000).toFixed(0) + ' Mds'
                    }
                },
                x: {
                    ticks: {
                        color: '#555',
                        font: {size: 10, weight: 'bold'}
                    }
                }
            },
            elements: {
                line: {borderWidth: 2, tension: 0.3},
                point: {radius: 4, hoverRadius: 6, borderWidth: 2}
            }
        };
    }

    // Chart des ventes
    updataChartRepartitionConsommationBTEtMTGroupe(): void {
        console.log('Mise à jour du graphique Evolution des ventes');


        // Vérifier si les données sont disponibles
        if (!this.donneesMensuelleAnneeCouranteVentes?.donneesMensuelleGenerale) {
            console.log('Aucune donnée mensuelle disponible');
            this.aucuneDonneeVenteDisponible = true;
            this.cdr.markForCheck();
            return;
        }

        const labels = this.moisLabels;

        // Créer un tableau de données pour tous les mois (12 mois) - utiliser null pour les valeurs manquantes
        const dataAnneeCouranteConsommationMTBT = new Array(12).fill(null);
        const dataAnneePrecedenteConspmmationMTBT = new Array(12).fill(null);

        // Remplir les données année courante
        this.donneesMensuelleAnneeCouranteVentes?.donneesMensuelleGenerale?.forEach((d: any) => {
            const moisIndex = d.mois - 1;
            if (moisIndex >= 0 && moisIndex < 12) {
                const valeur = this.afficherMontant ? d.montantConsomme : d.consommationKwh;
                if (valeur && valeur > 0) {
                    const divisor = this.afficherMontant ? this.currentCurrencyDivisor : this.currentEnergyDivisor;
                    dataAnneeCouranteConsommationMTBT[moisIndex] = valeur / divisor;
                } else {
                    dataAnneeCouranteConsommationMTBT[moisIndex] = null;
                }
            }
        });

        // Remplir les données année précédente
        /*this.donneesMensuelleAnneePrecedente?.donneesMensuelleGenerale?.forEach((d: any) => {
            const moisIndex = d.mois - 1;
            if (moisIndex >= 0 && moisIndex < 12) {
                const valeur = this.afficherMontant ? d.montantConsomme : d.consommationKwh;
                if (valeur && valeur > 0) {
                    const divisor = this.afficherMontant ? this.currentCurrencyDivisor : this.currentEnergyDivisor;
                    dataAnneePrecedenteConspmmationMTBT[moisIndex] = valeur / divisor;
                } else {
                    dataAnneePrecedenteConspmmationMTBT[moisIndex] = null;
                }
            }
        });*/

        // Vérifier si toutes les données sont nulles
        this.aucuneDonneeVenteDisponible = [...dataAnneeCouranteConsommationMTBT].every(v => v === null || v === undefined);


        // Calculer les valeurs dynamiques pour les axes (identique à la page principale)
        const allValidData = [...dataAnneeCouranteConsommationMTBT, ...dataAnneePrecedenteConspmmationMTBT]
            .filter(v => v !== null && v !== undefined);

        const maxValue = allValidData.length > 0 ? Math.max(...allValidData) : 0;
        const minValue = allValidData.length > 0 ? Math.min(...allValidData) : 0;

        // Calculer une valeur minimale dynamique avec une marge de 5% en dessous
        const dynamicMin = minValue > 0 ? Math.floor(minValue * 0.95) : 0;

        // Calculer une valeur maximale dynamique avec une marge de 5% au-dessus
        const dynamicMax = maxValue > 0 ? Math.ceil(maxValue * 1.05) : 100;

        // Calculer un stepSize optimal basé sur la plage dynamique
        // Pour avoir environ 4-5 graduations maximum et éviter les valeurs inutiles
        const range = dynamicMax - dynamicMin;
        const targetTicks = 4;
        const rawStep = range / targetTicks;

        // Arrondir à une valeur "propre" qui évite les graduations inutiles
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
        const normalizedStep = rawStep / magnitude;

        let step;
        if (normalizedStep <= 1.5) step = 1;
        else if (normalizedStep <= 3) step = 2;
        else if (normalizedStep <= 7) step = 5;
        else step = 10;

        const dynamicStepSize = step * magnitude;

        console.log('Évolution ventes - Min:', minValue, 'Max:', maxValue, 'Dynamic min:', dynamicMin, 'Dynamic max:', dynamicMax, 'Step size:', dynamicStepSize);

        const currentUnitLabel = this.afficherMontant ?
            (this.currentCurrencyUnit === 'Milliards' ? 'Montant FCFA' :
                this.currentCurrencyUnit === 'Millions' ? 'Montant FCFA' : 'FCFA') :
            (this.currentEnergyUnit === 'GWh' ? 'GWh' :
                this.currentEnergyUnit === 'MWh' ? 'MWh' : 'kWh');

        this.commercialData = {
            labels,
            datasets: [
                {
                    label: `${currentUnitLabel} ${this.selectedYear}`,
                    data: dataAnneeCouranteConsommationMTBT,
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.2)',
                    fill: false,
                    tension: 0.3,
                    spanGaps: false
                }/*,
                {
                    label: `${currentUnitLabel} ${this.selectedYear - 1}`,
                    data: dataAnneePrecedenteConspmmationMTBT,
                    borderColor: '#4ECDC4',
                    backgroundColor: 'rgba(78, 205, 196, 0.2)',
                    fill: false,
                    tension: 0.3,
                    spanGaps: false
                }*/
            ]
        };

        // Mettre à jour les options du graphique avec les nouvelles unités et valeurs dynamiques
        //this.updateChartOptions(dynamicMin, dynamicMax, dynamicStepSize);
        this.chartOptionsCommercial = {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            layout: {
                padding: {
                    left: 20,
                    right: 20,
                    top: 15,
                    bottom: 85
                }
            },
            plugins: {
                legend: this.STANDARD_LEGEND_STYLES,
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const val = context.parsed.y;
                            const unit = this.afficherMontant ?
                                (this.currentCurrencyUnit === 'Milliards' ? 'Milliards FCFA' :
                                    this.currentCurrencyUnit === 'Millions' ? 'Millions FCFA' : 'FCFA') :
                                (this.currentEnergyUnit === 'GWh' ? 'GWh' :
                                    this.currentEnergyUnit === 'MWh' ? 'MWh' : 'kWh');
                            return `${new Intl.NumberFormat('fr-FR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }).format(val)} ${unit}`;
                        },
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
                y: {
                    beginAtZero: false, // Ne pas commencer à zéro pour mieux voir les variations
                    min: dynamicMin, // Valeur minimale dynamique
                    max: dynamicMax, // Valeur maximale dynamique pour une meilleure lisibilité
                    title: {
                        display: true,
                        text: this.afficherMontant ?
                            (this.currentCurrencyUnit === 'Milliards' ? 'Montant (Milliards FCFA)' :
                                this.currentCurrencyUnit === 'Millions' ? 'Montant (Millions FCFA)' : 'Montant (FCFA)') :
                            (this.currentEnergyUnit === 'GWh' ? 'Consommation (GWh)' :
                                this.currentEnergyUnit === 'MWh' ? 'Consommation (MWh)' : 'Consommation (kWh)'),
                        ...this.STANDARD_AXIS_STYLES
                    },
                    ticks: {
                        ...this.STANDARD_TICK_STYLES,
                        stepSize: dynamicStepSize, // StepSize dynamique optimisé
                        maxTicksLimit: 5, // Limite à 5 graduations maximum pour éviter les valeurs inutiles
                        callback: function (value: any) {
                            // Afficher des entiers pour les graduations (pas de virgules avec zéros)
                            return new Intl.NumberFormat('fr-FR', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(value);
                        }
                    }
                },
                x: {
                    title: {
                        display: false,
                        text: 'Mois'
                    },
                    ticks: {
                        ...this.STANDARD_TICK_STYLES,
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        maxRotation: 45,
                        minRotation: 45,
                        maxTicksLimit: 12,
                        autoSkip: false,
                        stepSize: 1
                    }
                }
            },
            /*elements: {
                arc: {
                    borderWidth: 2,
                    borderColor: '#fff'
                }
            },
            cutout: '50%', // Trou central équilibré
            radius: '70%' // Taille équilibrée du camembert*/
        };
        this.cdr.markForCheck();
    }

    // charte SAIFI/SAIDI
    updataChartIndiceInterruption() {
        //this.updateHeaders()
        this.headerMensuellesIndiceInterruption = this.afficherIndiceDuree ? 'SAIDI' : 'SAIFI'
        this.tauxCoupureMoyen = this.afficherIndiceDuree ? this.donneesMensuelleAnneeCouranteKpiTechnique.cumulDureeIndiceInterruption
            : this.donneesMensuelleAnneeCouranteKpiTechnique.cumulFrequenceIndiceInterruption

        // Courbes indices interruption duree/frequence
        const labels = this.moisLabels;

        // Créer un tableau de données pour tous les mois (12 mois) - utiliser null pour les valeurs manquantes
        const dataAnneeCouranteIndiceInterruption = new Array(12).fill(null);
        // Remplir les données année courante (utiliser null pour les valeurs 0)
        this.donneesMensuelleAnneeCouranteKpiTechnique?.donneesMensuelleGenerale.forEach(d => {
            const moisIndex = d.mois - 1;
            if (moisIndex >= 0 && moisIndex < 12) {
                const valeur = this.afficherIndiceDuree ? d.dureeIndiceInterruption : d.frequenceIndiceInterruption;
                // Utiliser null pour les valeurs 0, null ou undefined (Chart.js ne les affichera pas)
                dataAnneeCouranteIndiceInterruption[moisIndex] = (valeur >= 0) ? valeur : null;
            }
        });


        /*console.log('Données année courante:', dataAnneeCouranteConsommationMTBT);
        console.log('Données année précédente:', dataAnneePrecedenteConspmmationMTBT);*/
        this.aucuneDonneeIndiceInterruptionDisponible = [...dataAnneeCouranteIndiceInterruption].every(v => v === null || v === undefined);

        this.techniqueData = {
            labels,
            datasets: [
                {
                    label: `${(this.afficherIndiceDuree ? 'SAIDI (h) ' : 'SAIFI ')} ${this.selectedYear}`,
                    data: dataAnneeCouranteIndiceInterruption,
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.2)',
                    fill: false,
                    tension: 0.3,
                    spanGaps: false // Ne pas connecter les lignes entre les points null
                },
            ]
        };

        this.chartOptionsKpiTechnique = {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            layout: {
                padding: {
                    left: 20,
                    right: 20,
                    top: 15,
                    bottom: 85
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'line',
                        padding: 8,
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        boxWidth: 10,
                        boxHeight: 10,
                        color: '#333'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const val = context.parsed.y;
                            return this.afficherIndiceDuree
                                ? `${new Intl.NumberFormat('fr-FR').format(val)} h`
                                : `${new Intl.NumberFormat('fr-FR').format(val)}`;
                        },
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
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: this.afficherIndiceDuree ? 'SAIDI (h)' : 'SAIFI'
                    },
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                },
                x: {
                    title: {
                        display: false,
                        text: 'Mois'
                    },
                    ticks: {
                        font: {
                            size: 12,
                            //weight: 'bold'
                        },
                        maxRotation: 45,
                        minRotation: 45,
                        padding: 8,
                        color: '#333',
                        maxTicksLimit: 12,
                        autoSkip: false,
                        stepSize: 1
                    }
                }
            },
            /*elements: {
                arc: {
                    borderWidth: 2,
                    borderColor: '#fff'
                }
            },
            cutout: '50%', // Trou central équilibré
            radius: '70%' // Taille équilibrée du camembert*/
        };

        this.cdr.markForCheck(); // Forcer la mise à jour du graphique
    }

    // KPI RH

    updateKpiRh() {
        const directionsTotaux = Object.keys(this.effectifCumul.totalEffectifParDirection);
        const values = Object.values(this.effectifCumul.totalEffectifParDirection);
        const uniqueColors = this.generateUniqueColors(directionsTotaux.length); // couleurs uniques

        this.rhData = {
            labels: directionsTotaux, //  Les directions en abscisse
            datasets: [{
                label: 'Effectif',
                data: values,
                backgroundColor: uniqueColors,
                borderWidth: 1
            }]
        };


        this.chartOptionsKpiRh = {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            layout: {
                padding: {
                    left: 20,
                    right: 20,
                    top: 15,
                    bottom: 85
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const val = context.parsed.y;
                            return `${new Intl.NumberFormat('fr-FR', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(val)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Effectif'
                    },
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                },
                x: {
                    title: {
                        display: false,
                        text: 'Directions'
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        maxRotation: 45,
                        minRotation: 45,
                        padding: 8,
                        color: '#333',
                        maxTicksLimit: 12,
                        autoSkip: false,
                        stepSize: 1
                    }
                }
            }
        };

    }

//update kpidsi
    updateKpiDsi() {
        // Préparer les 12 mois pour l’axe X
        const labels = this.moisLabels;
        // datas = data;
        const donneesMensuelKpiDsis = this.donneesMensuelleAnneeCouranteKpiDsi.donneesMensuelles;

        const dataDispoServeurMensuel = new Array(12).fill(null);

        if (donneesMensuelKpiDsis) {
            donneesMensuelKpiDsis.forEach(d => {
                const moisIndex = d.mois - 1;
                if (moisIndex >= 0 && moisIndex < 12) {
                    dataDispoServeurMensuel[moisIndex] = d.tauxDisponibilite ?? null;
                }
            });
        }

        // 🎯 Configuration des données du graphique
        this.dsiData = {
            labels,
            datasets: [
                {

                    data: dataDispoServeurMensuel,
                    borderColor: '#42A5F5',
                    tension: 0.4, // rend la courbe fluide
                    pointRadius: 4,
                    pointBackgroundColor: '#1E88E5',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#42A5F5'
                }
            ]
        };
        //backgroundColor: 'rgba(66, 165, 245, 0.1)',fill: true, // remplit sous la courbe


        // 🎨 Options d’affichage (axes, légende, couleurs)
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.chartOptionsDsi = {
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
                        maxRotation: 45, // 🌟 rotation maximale des labels
                        minRotation: 45,  // 🌟 rotation minimale (angle fixe)
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
        this.cdr.markForCheck(); // Forcer la mise à jour du graphique


    }

    private updateChartOptions(dynamicMin?: number, dynamicMax?: number, dynamicStepSize?: number): void {
        const yAxisTitle = this.afficherMontant ?
            (this.currentCurrencyUnit === 'Milliards' ? 'Montant (Milliards FCFA)' :
                this.currentCurrencyUnit === 'Millions' ? 'Montant (Millions FCFA)' : 'Montant (FCFA)') :
            (this.currentEnergyUnit === 'GWh' ? 'Consommation (GWh)' :
                this.currentEnergyUnit === 'MWh' ? 'Consommation (MWh)' : 'Consommation (kWh)');

        this.chartOptionsCommercial.scales.y.title.text = yAxisTitle;

        // Mettre à jour les valeurs dynamiques si fournies
        if (dynamicMin !== undefined) {
            this.chartOptionsCommercial.scales.y.min = dynamicMin;
        }
        if (dynamicMax !== undefined) {
            this.chartOptionsCommercial.scales.y.max = dynamicMax;
        }
        if (dynamicStepSize !== undefined) {
            this.chartOptionsCommercial.scales.y.ticks.stepSize = dynamicStepSize;
        }

        this.chartOptionsCommercial.scales.x = {
            title: {
                display: false,
                text: 'Mois'
            },
            ticks: {
                ...this.STANDARD_TICK_STYLES,
                font: {
                    size: 12,
                    weight: 'bold'
                },
                maxRotation: 45,
                minRotation: 45,
                maxTicksLimit: 12,
                autoSkip: false,
                stepSize: 1
            }
        }

        /* this.chartOptionsCommercial.scales.y.title = {
             display: true,
             text: this.afficherMontant ?
                 (this.currentCurrencyUnit === 'Milliards' ? 'Montant (Milliards FCFA)' :
                     this.currentCurrencyUnit === 'Millions' ? 'Montant (Millions FCFA)' : 'Montant (FCFA)') :
                 (this.currentEnergyUnit === 'GWh' ? 'Consommation (GWh)' :
                     this.currentEnergyUnit === 'MWh' ? 'Consommation (MWh)' : 'Consommation (kWh)'),
             ...this.STANDARD_AXIS_STYLES
         }*/
    }

    updataChartEvolutionChartStock() {
        //this.updateHeaders()


        // Courbes indices interruption duree/frequence
        const labels = this.moisLabels;

        // Créer un tableau de données pour tous les mois (12 mois) - utiliser null pour les valeurs manquantes
        const dataAnneeCouranteEvolutionStock = new Array(12).fill(null);


        // Remplir les données année courante (utiliser null pour les valeurs 0)
        this.kpiStock?.donneesMensuellesKpiStock.forEach(d => {
            const moisIndex = d.mois - 1;
            if (moisIndex >= 0 && moisIndex < 12) {
                const valeur = d.valeurTotaleStock
                // Utiliser null pour les valeurs 0, null ou undefined (Chart.js ne les affichera pas)
                const divisor = 1e9
                dataAnneeCouranteEvolutionStock[moisIndex] = (valeur >= 0) ? valeur/divisor : null;
            }
        });
        console.log("val :", dataAnneeCouranteEvolutionStock)

        /*console.log('Données année courante:', dataAnneeCouranteConsommationMTBT);
        console.log('Données année précédente:', dataAnneePrecedenteConspmmationMTBT);*/
        //this.aucuneDonneeEvolutionStockDisponible = [...dataAnneeCouranteEvolutionStock].every(v => v === null || v === undefined);

        this.stockData = {
            labels,
            datasets: [
                {
                    label: `stock (Mds FCFA) ${this.selectedYear}`,
                    data: dataAnneeCouranteEvolutionStock,
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.2)',
                    fill: false,
                    tension: 0.3,
                    spanGaps: false // Ne pas connecter les lignes entre les points null
                }
            ]
        };

        this.chartOptionsStock = {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            layout: {
                padding: {
                    left: 20,
                    right: 20,
                    top: 15,
                    bottom: 85
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'line',
                        padding: 8,
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        boxWidth: 10,
                        boxHeight: 10,
                        color: '#333'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const val = context.parsed.y;
                            return `${new Intl.NumberFormat('fr-FR').format(val)} Mds FCFA`
                        },
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
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'stock (Mds Fcfa)'
                    },
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                },
                x: {
                    title: {
                        display: false,
                        text: 'Mois'
                    },
                    ticks: {
                        font: {
                            size: 12,
                            //weight: 'bold'
                        },
                        maxRotation: 45,
                        minRotation: 45,
                        padding: 8,
                        color: '#333',
                        maxTicksLimit: 12,
                        autoSkip: false,
                        stepSize: 1
                    }
                }
            },
            /*elements: {
                arc: {
                    borderWidth: 2,
                    borderColor: '#fff'
                }
            },
            cutout: '50%', // Trou central équilibré
            radius: '70%' // Taille équilibrée du camembert*/
        };

        this.cdr.markForCheck(); // Forcer la mise à jour du graphique
    }
    formatKWhToGWh(value: number | null | undefined): string {
        if (value === null || value === undefined || value === 0) {
            return '-';
        }
        const gwh = value / 1000000; // Conversion KWh vers GWh
        return gwh.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Méthode pour formater les valeurs FCFA en milliards
    formatFcfaToMilliards(value: number | null | undefined): string {
        if (value === null || value === undefined || value === 0) {
            return '-';
        }
        const milliards = value / 1000000000; // Conversion FCFA vers milliards
        return milliards.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Méthode pour formater le taux de rendement
    /*formatTauxRendement(value: number | null | undefined): string {
        if (value === null || value === undefined || value === 0) {
            return '-';
        }
        return value.toFixed(2)
    }*/


    // Méthode pour formater le taux de recouvrement
    formatTauxRecouvrement(value: number | null | undefined): string {
        if (value === null || value === undefined) {
            return '-';
        }
        return value.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + '%';
    }

    private getMonthLabel(mois: number): string {
        const moisLabels = [
            'Janvier', 'Février', 'Mars', 'Avril',
            'Mai', 'Juin', 'Juillet', 'Août',
            'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        return moisLabels[mois - 1];
    }

    private generateUniqueColors(length: number): string[] {
        const palette = [
            '#3366CC', '#DC3912', '#FF9900', '#109618', '#990099',
            '#0099C6', '#DD4477', '#91c81f', '#aa0e0e', '#316395',
            '#592859', '#22AA99', '#4d7a0b', '#6633CC', '#E67300',
            '#8c4949', '#c532c6', '#329262', '#5574A6', '#3B3EAC'
        ];
        return Array.from({length}, (_, i) => palette[i % palette.length]);
    }

    // Méthode pour formater les valeurs KPI (afficher '-' si 0)
    formatKPIValue(value: number | null | undefined): string {
        if (value === null || value === undefined || value === 0) {
            return '-';
        }
        return value.toLocaleString('fr-FR');
    }

    formatKPIValueMoyen(value: number | null | undefined): string {
        if (value === null || value === undefined) {
            return '-';
        }
        return (value).toFixed(2).toString();
    }
}

