import {ChangeDetectorRef, Component, OnInit, HostListener} from '@angular/core';
import {StatistiquesKPITechniqueService} from "../../../services/statistiques-kpi-technique.service";
import {KpiStockService} from "../../../services/kpi-stock";
import {NiveauTension} from "../../../models/niveau-tension";
import {
    StatistiqueMensuelleResponsesKpiTechnique
} from "../../../models/statistique-mensuelles-responses-kpi-technique";
import {forkJoin} from "rxjs";
import {finalize} from "rxjs/operators";
import {KpiStock} from "../../../models/kpi-stock";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {ButtonModule} from "primeng/button";
import {ChartModule} from "primeng/chart";
import {FormsModule} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {CardModule} from "primeng/card";
import {CommonModule} from "@angular/common";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {
    StatistiqueMensuelleResponsesKPIStock
} from "../../../models/statistique-mensuelle-responses-kpi-stock";

@Component({
  selector: 'app-kpi-stock',
  imports: [ButtonModule,ChartModule, FormsModule, DropdownModule,CardModule,CommonModule, ToggleSwitchModule, ProgressSpinnerModule, OverlayPanelModule],
  templateUrl: './kpi-stock.component.html',
  styleUrl: './kpi-stock.component.scss'
})
export class KpiStockComponent implements OnInit{

    // Filtres
    annees: number[] = [2025];
    mois: any[] = [
        { label: 'Toute l\'année', value: null },
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

    // Labels des mois mémorisés (sans "Toute l'année")
    private readonly moisLabels: string[] = this.mois.slice(1).map(m => m.label);

    // Listes de référence pour les dropdowns
    niveauxTension: NiveauTension[] = [];

    // Valeurs sélectionnées
    anneeSelectionnee: number = 2025;
    moisSelectionne: number | null = null;
    niveauTensionSelectionne: number | null = null;

    loading: boolean = false;
    loadingProgress: number = 0;
    loadingMessage: string = "Chargement des statistiques...";

    // Cache pour éviter les rechargements inutiles
    private cache = new Map<string, any>();
    private lastRequestParams: any = null;

    donneesMensuelleAnneePrecedente: StatistiqueMensuelleResponsesKpiTechnique;
    donneesMensuelleAnneeCourante: StatistiqueMensuelleResponsesKpiTechnique;

    // Evolution Indice d'interruption
    aucuneDonneeIndiceInterruptionDisponible: boolean = false;
    afficherIndiceDuree: boolean = false
    chartDonneesMensuellesIndiceInterruption: any;
    chartOptionsDonneesMensuellesIndiceInterruption: any;
    headerMensuellesIndiceInterruption: any;

    // Evolution Energie non distribué
    aucuneDonneeEnergieNonDistribueeDisponible: boolean = false;
    afficherEnergieNonDistribueeKwh: boolean = false
    chartDonneesMensuellesEnergieNonDistribuee: any;
    chartOptionsDonneesMensuellesEnergieNonDistribuee: any;
    headerMensuellesEnergieNonDistribuee: any;

    // Evolution Energie importée
    aucuneDonneeEnergieImporteeDisponible: boolean = false;
    afficherEnergieImporteeKwh: boolean = false
    chartDonneesMensuellesEnergieImportee: any;
    chartOptionsDonneesMensuellesEnergieImportee: any;
    //headerMensuellesEnergieNonDistribuee: any;

    // kpi stock

    dataKpiStock: StatistiqueMensuelleResponsesKPIStock

    // courbe evolution stock
    aucuneDonneeEvolutionStockDisponible: boolean = false;
    chartDonneesMensuellesEvolutionStockFcfa: any;
    chartOptionsDonneesMensuellesEvolutionStockFcfa: any;

    // courbe Taux de rotation du stock
    aucuneDonneeTauxRotationDisponible: boolean = false;
    chartDonneesMensuellesTauxRotation: any;
    chartOptionsDonneesMensuellesTauxRotation: any;

    // courbe Répartion stock par catégorie
    aucuneDonneeRepartitionStockCategorieDisponible: boolean = false;
    chartDonneesRepartitionStockCategorie: any;
    chartOptionsRepartitionStockCategorie: any;
    afficherQuantiteSotck: boolean = false;
    afficherEquipementsCritiques: boolean = false;

    // Taux de rotation par catégorie (bar chart)
    aucuneDonneeTauxRotationParCategorie: boolean = false;
    chartDonneesTauxRotationParCategorie: any;
    chartOptionsTauxRotationParCategorie: any;

    // Bar chat équipements plus utilisés
    aucuneDonneeEquipementPlusUtiliseDisponible: boolean = false;
    chartDonneesEquipementPlusUtilise: any;
    chartOptionsEquipementPlusUtilise: any;

    // Evolution équipements proche de rupture de stock
    aucuneDonneeEquipementRuptureStockDisponible: boolean = false;
    chartDonneesEquipementRuptureStock: any;
    chartOptionsEquipementRuptureStock: any;

    // Entrées / Sorties par mois
    aucuneDonneeEntreesSortiesDisponible: boolean = false;
    chartDonneesEntreesSorties: any;
    chartOptionsEntreesSorties: any;

    constructor(
        private statistiquesKpiTechniqueService: StatistiquesKPITechniqueService,
        private kpiStockSevice: KpiStockService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        // Charger les données initiales
        this.chargerStatistiques();
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        // Recalculer les options du graphique lors du redimensionnement
        if (this.chartDonneesEntreesSorties) {
            this.updateChartEntreesSorties();
        }
    }

    private areParamsEqual(params1: any, params2: any): boolean {
        if (!params2) return false;
        return params1.mois === params2.mois &&
            params1.annee === params2.annee &&
            params1.tension === params2.tension &&
            params1.mode === params2.mode;
    }

    private generateCacheKey(annee: number, params: any): string {
        return `${annee}_${params.mois || 'all'}_${params.tension || 'all'}}`;
    }

    // Méthode publique appelée par les dropdowns - charge immédiatement
    chargerStatistiques(): void {
        // Vérifier le cache pour éviter les requêtes inutiles
        const requestParams = {
            mois: this.moisSelectionne,
            annee: this.anneeSelectionnee,
        };

        // Si les paramètres sont identiques, ne pas recharger
        if (this.areParamsEqual(requestParams, this.lastRequestParams)) {
            return;
        }

        this.loading = true;
        this.lastRequestParams = requestParams;
        this.cdr.markForCheck();

        // Générer les clés de cache
        const cacheKeyCourant = this.generateCacheKey(this.anneeSelectionnee, requestParams);
        const cacheKeyPrecedent = this.generateCacheKey(this.anneeSelectionnee - 1, requestParams);

        // Vérifier si on a déjà les données en cache
        const cachedCourant = this.cache.get(cacheKeyCourant);
        const cachedPrecedent = this.cache.get(cacheKeyPrecedent);

        if (cachedCourant && cachedPrecedent) {
            // Utiliser le cache - chargement instantané
            this.loadingProgress = 100;
            this.loadingMessage = "Données mises à jour";
            this.cdr.markForCheck();

            setTimeout(() => {
                this.processData(cachedCourant);
            }, 50); // Petit délai pour afficher le message
            return;
        }

        // Préparer les observables (utiliser le cache si disponible)
        const anneeCourante$ = cachedCourant
            ? Promise.resolve(cachedCourant)
            : this.kpiStockSevice.getStatistiquesMensuellesKPIStock(
                this.moisSelectionne,
                this.anneeSelectionnee
            );


        // Simuler un chargement progressif
        this.simulateProgress();

        // Charger les données (cache + API)
        forkJoin({
            anneeCourante: anneeCourante$,
        }).pipe(
            finalize(() => {
                this.loading = false;
                this.loadingProgress = 0;
                this.cdr.markForCheck();
            })
        ).subscribe({
            next: (responses) => {
                // Mettre en cache
                this.dataKpiStock = responses.anneeCourante
                //console.log("kpi stock :", this.dataKpiStock)
                // Traiter les données
                this.processData(responses.anneeCourante);
            },
            error: (error) => {
                console.error('Erreur lors du chargement des statistiques:', error);
                this.loading = false;
                this.loadingProgress = 0;
                this.cdr.markForCheck();
            }
        });
    }

    private processData(anneeCourante: any): void {
        this.loadingProgress = 100;
        this.loadingMessage = "Finalisation...";
        this.cdr.markForCheck();

        // Traitement optimisé avec requestAnimationFrame pour éviter le blocage UI
        requestAnimationFrame(() => {
            // Année courante
            this.niveauxTension = anneeCourante.niveauxTension;
            this.donneesMensuelleAnneeCourante = anneeCourante;

            // Année précédente

            // Construire les Maps pour optimiser les recherches
            // this.buildLookupMaps();

            // Mettre à jour les headers mémorisés
          //  this.updateHeaders();

            // Mettre à jour tous les graphiques
           this.updateChartData();

            // Finaliser
            this.loading = false;
            this.loadingProgress = 0;
            this.cdr.markForCheck();
        });
    }

    updateHeaders() {
        this.headerMensuellesIndiceInterruption = this.afficherIndiceDuree? 'SAIDI': 'SAIFI'
    }
    private simulateProgress(): void {
        this.loadingProgress = 0;
        this.loadingMessage = "Récupération des données...";

        const progressInterval = setInterval(() => {
            if (this.loadingProgress < 90) {
                this.loadingProgress += Math.random() * 15;
                this.loadingMessage = this.loadingProgress < 50
                    ? "Récupération des données..."
                    : "Traitement des graphiques...";
                this.cdr.markForCheck();
            } else {
                clearInterval(progressInterval);
            }
        }, 100);
    }

    updateChartData() {
        // 1 - Indice interruption
        this.updataChartEvolutionChartStock()

        // 2 - Taux de rotation
        this.updataChartTauxRotationStock()

        // 3 - Repartition des stocks par catégorie
        this.updateChartRepartitionStockParCategorie()

        // 4 - Top 10 des équipements les plus utilisés
        this.updataChartEquipementPlusUtilise()

        // 5 - Top 10 des équipements en rupture de stock
        this.updataChartEvolutionEquipementRuptureStock()

        // 6 - Taux de rotation par catégorie
        this.updateChartTauxRotationParCategorie()

        // 7 - Entrées / Sorties par mois
        this.updateChartEntreesSorties()
    }

    updataChartEvolutionChartStock() {
        //this.updateHeaders()


        // Courbes indices interruption duree/frequence
        const labels = this.moisLabels;

        // Créer un tableau de données pour tous les mois (12 mois) - utiliser null pour les valeurs manquantes
        const dataAnneeCouranteEvolutionStock = new Array(12).fill(null);


        // Remplir les données année courante (utiliser null pour les valeurs 0)
        this.dataKpiStock?.donneesMensuellesKpiStock.forEach(d => {
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
        this.aucuneDonneeEvolutionStockDisponible = [...dataAnneeCouranteEvolutionStock].every(v => v === null || v === undefined);

        this.chartDonneesMensuellesEvolutionStockFcfa = {
            labels,
            datasets: [
                {
                    label: `stock (Mds FCFA) ${this.anneeSelectionnee}`,
                    data: dataAnneeCouranteEvolutionStock,
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.2)',
                    fill: false,
                    tension: 0.3,
                    spanGaps: false // Ne pas connecter les lignes entre les points null
                }
            ]
        };

        this.chartOptionsDonneesMensuellesEvolutionStockFcfa = {
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

    updataChartTauxRotationStock() {
        const labels = this.moisLabels;

        const dataAnneeCouranteTauxRotation = new Array(12).fill(null);
        const dataAnneeCouranteStockMoyen = new Array(12).fill(null);

        // Remplir les données pour l'année courante
        this.dataKpiStock?.donneesMensuellesKpiStock.forEach(d => {
            const moisIndex = d.mois - 1;
            const divisor = 1e9
            if (moisIndex >= 0 && moisIndex < 12) {
                dataAnneeCouranteTauxRotation[moisIndex] = d.tauxRotationValeur != null && d.tauxRotationValeur > 0
                    ? +(d.tauxRotationValeur).toFixed(2)
                    : null;

                dataAnneeCouranteStockMoyen[moisIndex] = d.valeurStockMoyen != null && d.valeurStockMoyen > 0
                    ? +Math.floor(d.valeurStockMoyen)/divisor
                    : null;
            }
        });

        this.aucuneDonneeTauxRotationDisponible = [
            ...dataAnneeCouranteTauxRotation,
            ...dataAnneeCouranteStockMoyen
        ].every(v => v === null || v === undefined);

        // Calculer les couleurs pour les barres du stock moyen selon leur valeur
        const getColorForStockValue = (value: number | null): string => {
            if (value === null || value === undefined || value === 0) return 'rgba(156, 163, 175, 0.5)';

            // Trouver les valeurs min et max pour créer un dégradé
            const validValues = dataAnneeCouranteStockMoyen.filter(v => v !== null && v !== undefined) as number[];
            if (validValues.length === 0) return 'rgba(99, 102, 241, 0.7)';

            const minValue = Math.min(...validValues);
            const maxValue = Math.max(...validValues);
            const range = maxValue - minValue;

            if (range === 0) return 'rgba(99, 102, 241, 0.7)';

            // Normaliser la valeur entre 0 et 1
            const normalized = (value - minValue) / range;

            // Dégradé de bleu clair à bleu foncé selon la valeur
            const hue = 220; // Bleu
            const saturation = 80 + normalized * 20; // De 80% à 100%
            const lightness = 70 - normalized * 30; // De 70% à 40% (plus foncé pour les valeurs élevées)

            return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
        };

        const backgroundColors = dataAnneeCouranteStockMoyen.map(getColorForStockValue);
        const borderColors = dataAnneeCouranteStockMoyen.map(value =>
            value === null || value === undefined ? '#9ca3af' : '#6366f1'
        );

        this.chartDonneesMensuellesTauxRotation = {
            labels,
            datasets: [
                {
                    label: `Valeur stock moyen (Mds FCFA) ${this.anneeSelectionnee}`,
                    data: dataAnneeCouranteStockMoyen,
                    type: 'bar',
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                    yAxisID: 'y2',
                    order: 2,
                    datalabels: {
                        display: true,
                        color: '#1f2937',
                        font: {
                            size: 10,
                            weight: 'bold' as const
                        },
                        anchor: 'end' as const,
                        align: 'end' as const,
                        offset: 4,
                        formatter: (value: number) => {
                            if (value === null || value === undefined) return '';
                            return new Intl.NumberFormat('fr-FR', {
                                minimumFractionDigits: 1,
                                maximumFractionDigits: 1
                            }).format(value);
                        }
                    }
                },
                {
                    label: `Taux de rotation (%) ${this.anneeSelectionnee}`,
                    data: dataAnneeCouranteTauxRotation,
                    type: 'line',
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointStyle: 'circle',
                    yAxisID: 'y1',
                    order: 1
                }
            ]
        };

        this.chartOptionsDonneesMensuellesTauxRotation = {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            layout: {
                padding: {
                    left: 8,
                    right: 8,
                    top: 8,
                    bottom: 90
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 8,
                        font: {
                            size: 11.5,
                            weight: 'bold'
                        },
                        usePointStyle: true,
                        boxWidth: 9,
                        boxHeight: 9,
                        color: '#1f2937',
                        generateLabels: (chart: any) => {
                            const datasets = chart.data.datasets;
                            return datasets.map((dataset: any, i: number) => {
                                const label = dataset.label || '';
                                const pointStyle = dataset.type === 'line' ? 'circle' : 'rect';
                                const color = dataset.type === 'line' ? dataset.borderColor : dataset.backgroundColor;
                                return {
                                    text: label,
                                    fillStyle: color,
                                    strokeStyle: dataset.borderColor || color,
                                    lineWidth: dataset.type === 'line' ? 2 : 0,
                                    pointStyle: pointStyle,
                                    hidden: !chart.isDatasetVisible(i),
                                    index: i
                                };
                            });
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(31, 41, 55, 0.95)',
                    padding: 10,
                    titleFont: {
                        size: 12,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 11
                    },
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: (context: any) => {
                            const val = context.parsed.y;
                            if (context.dataset.type === 'bar') {
                                return `Stock moyen: ${new Intl.NumberFormat('fr-FR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }).format(val)} Mds FCFA`;
                            } else {
                                return `Taux de rotation: ${val.toFixed(2)} %`;
                            }
                        },
                        title: (tooltipItems: any) => {
                            const item = tooltipItems[0];
                            const moisIndex = item.dataIndex;
                            const moisComplet = this.mois.slice(1)[moisIndex]?.label || `Mois ${item.label}`;
                            return `${moisComplet} ${this.anneeSelectionnee}`;
                        },
                        labelColor: (context: any) => {
                            const dataset = context.dataset;
                            return {
                                borderColor: dataset.borderColor || dataset.backgroundColor,
                                backgroundColor: dataset.type === 'line' ? dataset.backgroundColor : dataset.backgroundColor,
                                borderWidth: 2,
                                borderRadius: 2
                            };
                        }
                    }
                }
            },
            scales: {
                y1: {
                    type: 'linear',
                    position: 'left',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Taux de rotation (%)',
                        font: {
                            size: 9,
                            weight: 'bold'
                        },
                        color: '#ef4444',
                        padding: { top: 0, bottom: 8 }
                    },
                    ticks: {
                        font: { size: 8.5 },
                        color: '#ef4444',
                        callback: function(value: any) {
                            return value + ' %';
                        }
                    },
                    grid: {
                        color: 'rgba(239, 68, 68, 0.1)',
                        lineWidth: 1
                    }
                },
                y2: {
                    type: 'linear',
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false
                    },
                    title: {
                        display: true,
                        text: 'Stock moyen (Mds FCFA)',
                        font: {
                            size: 9,
                            weight: 'bold'
                        },
                        color: '#6366f1',
                        padding: { top: 0, bottom: 8 }
                    },
                    ticks: {
                        font: { size: 8.5 },
                        color: '#6366f1',
                        callback: (value: any) => {
                            return new Intl.NumberFormat('fr-FR', {
                                minimumFractionDigits: 1,
                                maximumFractionDigits: 1
                            }).format(value);
                        }
                    }
                },
                x: {
                    title: {
                        display: false
                    },
                    ticks: {
                        font: { size: 9 },
                        maxRotation: 45,
                        minRotation: 45,
                        padding: 8,
                        color: '#6b7280',
                        maxTicksLimit: 12,
                        autoSkip: false,
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        display: true
                    }
                }
            }
        };

        this.cdr.markForCheck();
    }

    updateChartEntreesSorties(): void {
        const labels = this.moisLabels;
        const entrees = (this.dataKpiStock?.entreesParMois || []).slice(0, 12).map(v => v ? v / 1e6 : null);
        const sorties = (this.dataKpiStock?.sortiesParMois || []).slice(0, 12).map(v => v ? v / 1e6 : null);

        this.aucuneDonneeEntreesSortiesDisponible = [...entrees, ...sorties].every(v => v === null || v === undefined);

        const isMobile = window.innerWidth <= 768;
        
        this.chartDonneesEntreesSorties = {
            labels,
            datasets: [
                {
                    label: `Entrées (M FCFA)`,
                    data: entrees,
                    backgroundColor: '#10B981',
                    borderColor: '#059669',
                    borderWidth: 1
                },
                {
                    label: `Sorties (M FCFA)`,
                    data: sorties,
                    backgroundColor: '#EF4444',
                    borderColor: '#DC2626',
                    borderWidth: 1
                }
            ]
        };

        this.chartOptionsEntreesSorties = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'bottom',
                    align: 'center',
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
                            const moisComplet = this.mois.slice(1)[moisIndex]?.label || `Mois ${item.label}`;
                            return moisComplet;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: { 
                            size: isMobile ? 8 : 10 
                        },
                        maxRotation: isMobile ? 90 : 45,
                        minRotation: isMobile ? 90 : 45,
                        padding: isMobile ? 4 : 8,
                        color: '#6b7280'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Valeur (M FCFA)',
                        font: {
                            size: isMobile ? 9 : 10,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        font: { 
                            size: isMobile ? 8 : 9 
                        },
                        color: '#6b7280'
                    }
                }
            }
        };
        this.cdr.markForCheck();
    }

    updateChartRepartitionStockParCategorie(): void {
        const dataInit = this.dataKpiStock?.stockParCategorie
        const labels = dataInit.map(d=> d.categorie);
        const data = dataInit.map(d=> this.afficherQuantiteSotck? d.quantiteStock : d.valeurTotalStock)
        this.aucuneDonneeRepartitionStockCategorieDisponible = data.every(v=> !v)

        // Exemple d'utilisation
        const baseColors = ['#4ECDC4', '#FF6B6B', '#F59E0B', '#3B82F6'];
        const darkerColors = baseColors.map(c => this.darkenHex(c, 80)); // 20% plus foncé
        this.chartDonneesRepartitionStockCategorie = {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: darkerColors,
                    hoverBackgroundColor: baseColors
                }

            ]
        };
        this.chartOptionsRepartitionStockCategorie = {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            layout: {
                padding: {
                    left: 2,
                    right: 2,
                    top: 2,
                    bottom: 2
                }
            },
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
                                // Formater la valeur : Mds si >= 1 milliard, M si < 1 milliard
                                let formattedValue: string;
                                if (this.afficherQuantiteSotck) {
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
                                    // Afficher d'abord le pourcentage pour garantir sa visibilité
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
                        // largeur plus grande pour éviter la coupe du pourcentage
                        maxWidth: 220
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                            const value = context.parsed;
                            const pourcentage = total ? ((value / total) * 100).toFixed(1) : '0';
                            // Formater la valeur : Mds si >= 1 milliard, M si < 1 milliard
                            let formattedValue: string;
                            if (this.afficherQuantiteSotck) {
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

    updataChartEquipementPlusUtilise() {
        const dataInit = this.dataKpiStock?.top10EquipementPlusUtilises || [];

        // Vérifier si des données sont disponibles
        const data = dataInit.map(d => d.quantiteConsomme);
        this.aucuneDonneeEquipementPlusUtiliseDisponible = data.length === 0 || data.every(v => v === null || v === undefined || v === 0);

        this.cdr.markForCheck();
    }

    updataChartEvolutionEquipementRuptureStock() {
        const dataInit = this.dataKpiStock?.top10EquipementCritique || [];

        // Vérifier si des données sont disponibles
        const data = dataInit.map(d => d.quantiteRestante);
        this.aucuneDonneeEquipementRuptureStockDisponible = data.length === 0 || data.every(v => v === null || v === undefined || v === 0);

        this.cdr.markForCheck();
    }


    reinitialiserFiltres(): void {
        this.anneeSelectionnee = 2025;
        this.moisSelectionne = null;
        this.niveauTensionSelectionne = null;
        this.aucuneDonneeEvolutionStockDisponible= false
        this.aucuneDonneeTauxRotationDisponible= false
        this.aucuneDonneeIndiceInterruptionDisponible= false

        // Vider le cache pour forcer le rechargement
        this.clearCache();
        this.chargerStatistiques();
    }

    private clearCache(): void {
        this.cache.clear();
        this.lastRequestParams = null;
    }


    // Méthode pour formater les valeurs KPI (afficher '-' si 0)
    formatKPIValue(value: number | null | undefined): string {
        if (value === null || value === undefined) {
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

    formatPercent(value: number | null | undefined): string {
        if (value === null || value === undefined || Number.isNaN(value)) return '-';
        return `${(+value).toFixed(1)} %`;
    }

    formatRatio(value: number | null | undefined): string {
        if (value === null || value === undefined || Number.isNaN(value)) return '-';
        return (+value).toFixed(2);
    }

    // Méthode pour formater les jours en années, mois et jours
    formatJoursEnAnneeMoisJours(value: number | null | undefined): string {
        if (value === null || value === undefined || Number.isNaN(value)) return '-';
        
        const joursTotal = Math.floor(value);
        const annees = Math.floor(joursTotal / 365);
        const restantApresAnnees = joursTotal % 365;
        const mois = Math.floor(restantApresAnnees / 30);
        const jours = restantApresAnnees % 30;

        if (annees > 0) {
            return `${annees} an${annees > 1 ? 's' : ''} ${mois} mois ${jours} j`;
        } else if (mois > 0) {
            return `${mois} mois ${jours} j`;
        } else {
            return `${jours} j`;
        }
    }

    // Méthode pour formater les valeurs KWh en GWh
    formatKWhToGWh(value: number | null | undefined): string {
        if (value === null || value === undefined) {
            return '-';
        }
        const gwh = value / 1000000; // Conversion KWh vers GWh
        return gwh.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
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

    // Méthode pour obtenir l'icône appropriée selon le type d'équipement
    getEquipementIcon(nomEquipement: string): string {
        if (!nomEquipement) return 'pi pi-box';

        const nom = nomEquipement.toLowerCase().trim();

        // Transformateurs (détection améliorée)
        if (nom.includes('transformateur') || nom.includes('nsformateur') || nom.includes('sformateur') || nom.includes('kva')) {
            return 'pi pi-bolt';
        }

        // Compteurs (détection améliorée)
        if (nom.includes('compteur') || nom.includes('prépayé') || nom.includes('prepaye') || nom.includes('postpayé') || nom.includes('postpaye')) {
            return 'pi pi-cog';
        }

        // Câbles souterrains
        if (nom.includes('souterrain') || (nom.includes('cuivre') && nom.includes('mm²'))) {
            return 'pi pi-link';
        }

        // Câbles aériens
        if (nom.includes('aérien') || nom.includes('aerien') || nom.includes('aluminium')) {
            return 'pi pi-link';
        }

        // Fibre optique
        if (nom.includes('fibre') || nom.includes('optique')) {
            return 'pi pi-wifi';
        }

        // Câbles en général
        if (nom.includes('câble') || nom.includes('cable')) {
            return 'pi pi-link';
        }

        // Par défaut
        return 'pi pi-box';
    }

    updateChartTauxRotationParCategorie(): void {
        const dataInit = this.dataKpiStock?.tauxRotationParCategorie || [];
        const labels = dataInit.map((d: any) => d.libelleCategorie);
        const data = dataInit.map((d: any) => d.tauxRotation);

        this.aucuneDonneeTauxRotationParCategorie = data.length === 0 || data.every((v: any) => !v);

        if (this.aucuneDonneeTauxRotationParCategorie) {
            return;
        }

        // Palette de couleurs pour chaque barre
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
        
        this.chartDonneesTauxRotationParCategorie = {
            labels: labels,
            datasets: [
                {
                    label: 'Taux de rotation',
                    data: data,
                    backgroundColor: colors.slice(0, data.length),
                    borderWidth: 1
                }
            ]
        };

        this.chartOptionsTauxRotationParCategorie = {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 80
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
                            return `Taux de rotation: ${val.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Taux de rotation',
                        font: {
                            size: 11,
                            weight: 'bold'
                        },
                        color: '#333'
                    },
                    ticks: {
                        font: { size: 10 },
                        color: '#666'
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    ticks: {
                        font: { size: 10 },
                        color: '#666'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        };
    }
}
