import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Direction } from '../../../../models/direction';
import { NiveauTension } from '../../../../models/niveau-tension';
import { ModeFacturation } from '../../../../models/mode-facturation';
import {StatistiquesKPICommercialService} from "../../../../services/statistiques-kpi-commercial.service";
import {
	StatistiqueMensuelleResponsesKPICommercial
} from "../../../../models/statistique-mensuelles-responses-kpi-commercial";
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import {TaxePostpaye} from "../../../../models/taxe-postpaye";
import {TaxePrepaye} from "../../../../models/taxe-prepaye";
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {StatistiquesKpiTauxRecouvrementService} from "../../../../services/statistiques-kpi-taux-recouvrement.service";
import {
    StatistiquesMensuellesResponsesKpiTauxRecouvrement
} from "../../../../models/statistique-mensuelles-responses-kpi-taux-recouvrement";

@Component({
  selector: 'app-taux-recouvrement',
  imports: [ButtonModule,ChartModule, FormsModule, DropdownModule,CardModule,CommonModule, ToggleSwitchModule, ProgressSpinnerModule],
  templateUrl: './kpi-taux-recouvrement.component.html',
  styleUrl: './kpi-taux-recouvrement.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TauxRecouvrementComponent implements OnInit {

	// Données du graphique


	// Indicateurs pour savoir si aucune donnée n'est disponible pour chaque graphique
	aucuneDonneeDisponible: boolean = false;

	// Filtres
	annees: number[] = [2024, 2025];
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
	modesFacturation: ModeFacturation[] = [];
    directions: Direction[] =[]

	// Maps pour optimiser les recherches
	private niveauxTensionMap = new Map<number, NiveauTension>();
	private modesFacturationMap = new Map<number, ModeFacturation>();

    private directionsMap = new Map<number, Direction>();

	// Valeurs sélectionnées
	anneeSelectionnee: number = 2025;
	moisSelectionne: number | null = null;
	modeFacturationSelectionne: number | null = null;
    directionSelectionnee: number | null = null;
	niveauTensionSelectionne: number | null = null;

	loading: boolean = false;
	loadingProgress: number = 0;
	loadingMessage: string = "Chargement des statistiques...";

	tauxRecouvrementMois: number | null = null;
	tauxRecouvrementCumule: number | null = null;

	donneesMensuelleAnneeCourante: StatistiquesMensuellesResponsesKpiTauxRecouvrement;

	afficherMontant: boolean = false; //
	//headerMensuellesMTBTConsommation: string = ''

	// Repartition MT et BT (groupé)
	chartDonneesMensuellesMTBTConsommation: any;
	chartOptionsDonneesMensuellesMTBTConsommation: any;

	// Consommation BT et MT (barres)
	afficherMontantRepartitionMensuellesMTBTConsommation : boolean =false
	chartRepartitionMensuellesMTBTConsommation: any;
	chartOptionsRepartitionMensuellesMTBTConsommation: any;

	// Evolution des abonnes
	afficherEvolutionAbonnes : boolean =false
	chartEvolutionAbonnes: any;
	chartOptionsEvolutionAbonne: any;


	// Repartition des taxes
	aucuneDonneeTaxesDisponible = false;
	chartRepartitionTaxes: any;
	chartOptionsRepartitionTaxes: any;

	// Repartition Abonne MT/BT
	aucuneDonneeAbonnesDisponible: boolean = false
	chartRepartitionAbonnes: any;
	chartOptionsRepartitionAbonnes: any;

	// Repartition Abonne Postpayé/Prépayé
	aucuneDonneeAbonnesPostpayeEtPrepayeDisponible: boolean = false



	currentEnergyDivisor: number = 1;
	currentCurrencyDivisor: number = 1;

	// Cache pour éviter les rechargements inutiles
	private cache = new Map<string, any>();
	private lastRequestParams: any = null;

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

	private readonly STANDARD_AXIS_STYLES = {
		font: {
			size: 11,
			weight: 'bold' as const
		},
		color: '#333'
	};

	private readonly STANDARD_TICK_STYLES = {
		font: {
			size: 10,
			weight: 'bold' as const
		},
		color: '#333',
		padding: 8
	};

    // Courbe evolution taux de recouvrement général

    chartDonneesMensuellesTauxRecouvrementGneneral: any;
    chartOptionsDonneesMensuellesTauxRecouvremenGneneral: any;

    aucuneDonneeDisponiblTauxRecouvrementParDirection: boolean = false

    // diagramme bar taux de recouvrement par direction
    aucuneDonneeTauxRecouvrementParDirection: boolean = false
    chartDonneesTauxRecouvrementParDirection: any;
    chartOptionsTauxRecouvrementParDirection: any;

	constructor(
		private statistiquesKpiCommercialService: StatistiquesKPICommercialService,
        private statistiquesKpiTauxRecouvrementService: StatistiquesKpiTauxRecouvrementService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		// Charger les données initiales
		this.chargerStatistiques();
	}

	// Méthode publique appelée par les dropdowns - charge immédiatement
	chargerStatistiques(): void {
		// Vérifier le cache pour éviter les requêtes inutiles
		const requestParams = {
			mois: this.moisSelectionne,
			annee: this.anneeSelectionnee,
			tension: this.niveauTensionSelectionne,
			direction: this.directionSelectionnee
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


		// Vérifier si on a déjà les données en cache
		const cachedCourant = this.cache.get(cacheKeyCourant);

		if (cachedCourant) {
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
			: this.statistiquesKpiTauxRecouvrementService.getStatistiquesMensuellesTauxRecouvrement(
				this.moisSelectionne,
				this.anneeSelectionnee,
                this.directionSelectionnee,
				this.niveauTensionSelectionne,
			);


		// Simuler un chargement progressif
		this.simulateProgress();

		// Charger les données (cache + API)
		forkJoin({
			anneeCourante: anneeCourante$
		}).pipe(
			finalize(() => {
				this.loading = false;
				this.loadingProgress = 0;
				this.cdr.markForCheck();
			})
		).subscribe({
			next: (responses) => {
				// Mettre en cache
				if (!cachedCourant) this.cache.set(cacheKeyCourant, responses.anneeCourante);
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

	private generateCacheKey(annee: number, params: any): string {
		return `${annee}_${params.mois || 'all'}_${params.tension || 'all'}_${params.direction || 'all'}`;
	}

	private areParamsEqual(params1: any, params2: any): boolean {
		if (!params2) return false;
		return params1.mois === params2.mois &&
			   params1.annee === params2.annee &&
			   params1.tension === params2.tension &&
			   params1.direction === params2.direction;
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

	private processData(anneeCourante: any): void {
		this.loadingProgress = 100;
		this.loadingMessage = "Finalisation...";
		this.cdr.markForCheck();

		// Traitement optimisé avec requestAnimationFrame pour éviter le blocage UI
		requestAnimationFrame(() => {
			// Année courante
			this.niveauxTension = anneeCourante.niveauxTension;
			this.modesFacturation = anneeCourante.modesFacturation;
            this.directions = anneeCourante.directions
			this.donneesMensuelleAnneeCourante = anneeCourante;


			// Construire les Maps pour optimiser les recherches
			this.buildLookupMaps();

			// Mettre à jour les headers mémorisés
			this.updateHeaders();

			// Mettre à jour tous les graphiques
			this.updateChartData();

			// Finaliser
			this.loading = false;
			this.loadingProgress = 0;
			this.cdr.markForCheck();
		});
	}

	private buildLookupMaps(): void {
		// Construire les Maps une seule fois pour éviter les find() répétés
		this.niveauxTensionMap.clear();
		this.niveauxTension.forEach(nt => this.niveauxTensionMap.set(nt.id, nt));

		this.directionsMap.clear();
		this.directions.forEach(d => this.modesFacturationMap.set(d.id, d));
	}

	updateHeaders(): void {
		// Calculer les unités optimales basées sur les données
		//this.calculateOptimalUnits();
		this.cdr.markForCheck(); // Forcer la détection des changements de headers
	}

	private calculateOptimalUnits(): void {
		// Calculer les unités optimales basées sur les données maximales
		let maxEnergyValue = 0;
		let maxCurrencyValue = 0;

		// Analyser les données pour trouver les valeurs maximales
		/*this.donneesMensuelleAnneeCourante?.donneesMensuelleGenerale.forEach(d => {
			if (d.consommationKwh > maxEnergyValue) maxEnergyValue = d.consommationKwh;
			if (d.montantConsomme > maxCurrencyValue) maxCurrencyValue = d.montantConsomme;
		});*/

		/*this.donneesMensuelleAnneePrecedente?.donneesMensuelleGenerale.forEach(d => {
			if (d.consommationKwh > maxEnergyValue) maxEnergyValue = d.consommationKwh;
			if (d.montantConsomme > maxCurrencyValue) maxCurrencyValue = d.montantConsomme;
		});

		// Déterminer les unités optimales
		const energyOptimal = this.getOptimalEnergyUnit(maxEnergyValue);
		const currencyOptimal = this.getOptimalCurrencyUnit(maxCurrencyValue);

		this.currentEnergyUnit = energyOptimal.unit;
		this.currentCurrencyUnit = currencyOptimal.unit;
		this.currentEnergyDivisor = energyOptimal.divisor;
		this.currentCurrencyDivisor = currencyOptimal.divisor;*/
	}

	private calculateOptimalStepSize(data1: number[], data2: number[]): number {
		// Trouver la valeur maximale dans les deux datasets
		const allValues = [...data1, ...data2].filter(v => v !== null && v !== undefined);
		if (allValues.length === 0) return 1;

		const maxValue = Math.max(...allValues);

		// Calculer un step size optimal pour avoir environ 5-6 graduations pour une meilleure lisibilité
		const targetTicks = 5;
		const rawStep = maxValue / targetTicks;

		// Arrondir à une valeur "propre" (1, 2, 5, 10, 20, 50, 100, etc.)
		const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
		const normalizedStep = rawStep / magnitude;

		let step;
		if (normalizedStep <= 1) step = 1;
		else if (normalizedStep <= 2) step = 2;
		else if (normalizedStep <= 5) step = 5;
		else step = 10;

		return step * magnitude;
	}

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

	updateChartData(): void {
		// Calculer les KPI mensuels
		//this.calculerKPIMensuels();

		// 1 - Courbe d'évolution recouvrement général
		this.updataChartTauxRecouvrementGeneral()

        // 2 - Diagramme Bar taux recouvrement par direction
        this.chartTauxRecouvrementParDirection()
		this.cdr.markForCheck(); // Forcer la détection des changements de graphiques
	}

	updataChartTauxRecouvrementGeneral() {

		const labels = this.moisLabels;

		// Créer un tableau de données pour tous les mois (12 mois) - utiliser null pour les valeurs manquantes
		const dataAnneeCouranteTauxRecouvrementGeneral = new Array(12).fill(null);

		// Remplir les données année courante (utiliser null pour les valeurs 0)
		this.donneesMensuelleAnneeCourante?.donneesMensuellesKpiRecouvrementGeneral.forEach(d => {
			const moisIndex = d.mois - 1;
			if (moisIndex >= 0 && moisIndex < 12) {
				const valeur = d.tauxRecouvrement.toFixed(2);
				// Convertir selon l'unité optimale et utiliser null pour les valeurs 0
				if (valeur) {
                    dataAnneeCouranteTauxRecouvrementGeneral[moisIndex] = valeur
				} else {
                    dataAnneeCouranteTauxRecouvrementGeneral[moisIndex] = null;
				}
			}
		});
        const newArray= [... dataAnneeCouranteTauxRecouvrementGeneral].reverse()
        let lastIndex = newArray.findIndex(d => !!d)
        if(lastIndex !==-1) lastIndex = dataAnneeCouranteTauxRecouvrementGeneral.length-lastIndex-1
        for(let j=0; j<=lastIndex; j++) {
            if(!dataAnneeCouranteTauxRecouvrementGeneral[j] && j+1>this.moisSelectionne)  dataAnneeCouranteTauxRecouvrementGeneral[j]= 0
        }



		console.log('Données année courante:', dataAnneeCouranteTauxRecouvrementGeneral);
		this.aucuneDonneeDisponible = [...dataAnneeCouranteTauxRecouvrementGeneral].every(v => !v);
		console.log('Aucune donnée disponible:', this.aucuneDonneeDisponible);

		// Calculer les valeurs dynamiques pour l'échelle Y
		const validDataCourante = dataAnneeCouranteTauxRecouvrementGeneral.filter(v => v !== null && v !== undefined);
		const allValidData = [...validDataCourante];

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


		this.chartDonneesMensuellesTauxRecouvrementGneneral = {
			labels,
			datasets: [
				{
					label: `Taux recouvrement ${this.anneeSelectionnee}`,
					data: dataAnneeCouranteTauxRecouvrementGeneral,
					borderColor: '#FF6B6B',
					backgroundColor: 'rgba(255, 107, 107, 0.2)',
					fill: false,
					tension: 0.3,
					spanGaps: false // Ne pas connecter les lignes entre les points null
				},
			]
		};

		this.chartOptionsDonneesMensuellesTauxRecouvremenGneneral  = {
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
							return `${new Intl.NumberFormat('fr-FR', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							}).format(val)} %`;
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
						text: 'Taux de recouvrement (%)',
						...this.STANDARD_AXIS_STYLES
					},
					ticks: {
						...this.STANDARD_TICK_STYLES,
						stepSize: dynamicStepSize, // StepSize dynamique optimisé
						maxTicksLimit: 5, // Limite à 5 graduations maximum pour éviter les valeurs inutiles
						callback: function(value: any) {
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

		this.cdr.markForCheck(); // Forcer la mise à jour du graphique
	}

    chartTauxRecouvrementParDirection(): void {
        // Si les données sont vides, on définit la variable de contrôle
        this.aucuneDonneeTauxRecouvrementParDirection =
            !this.donneesMensuelleAnneeCourante ||
            !this.donneesMensuelleAnneeCourante.donneesKpiTauxRecouvrementParDirectionGeneral ||
            this.donneesMensuelleAnneeCourante.donneesKpiTauxRecouvrementParDirectionGeneral.length === 0;

        console.log("aucune donnée r par direction:", this.aucuneDonneeTauxRecouvrementParDirection)
        // Si aucune donnée, on initialise avec un tableau vide pour éviter les erreurs
        const dataSource = this.aucuneDonneeTauxRecouvrementParDirection
            ? []
            : this.donneesMensuelleAnneeCourante.donneesKpiTauxRecouvrementParDirectionGeneral;

        // Définition des couleurs par direction (exemple simple)
        const couleurs = [
            '#4caf50', '#2196f3', '#ff9800', '#9c27b0',
            '#f44336', '#03a9f4', '#8bc34a'
        ];

        // Construction des labels et données pour Chart.js
        this.chartDonneesTauxRecouvrementParDirection = {
            labels: dataSource.map(d => d.direction),
            datasets: [{
                label: 'Taux de recouvrement (%)',
                data: dataSource.map(d => +d.tauxRecouvrement.toFixed(2)), // fix à 2 décimales
                backgroundColor: dataSource.map((_, i) => couleurs[i % couleurs.length]),
                borderColor: dataSource.map((_, i) => this.assombrirCouleur(couleurs[i % couleurs.length])),
                borderWidth: 1
            }]
        };

        // Configuration des options Chart.js
        this.chartOptionsTauxRecouvrementParDirection = {
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
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }).format(val)} %`;
                        },
                        title: (tooltipItems: any) => {
                            const item = tooltipItems[0];
                            return item.label || 'Direction';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Taux de recouvrement (%)',
                        ...this.STANDARD_AXIS_STYLES
                    },
                    ticks: {
                        ...this.STANDARD_TICK_STYLES,
                        maxTicksLimit: 5,
                        callback: (value: any) =>
                            new Intl.NumberFormat('fr-FR', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(value)
                    },
                    grid: {
                        drawTicks: false
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Directions',
                        ...this.STANDARD_AXIS_STYLES
                    },
                    ticks: {
                        ...this.STANDARD_TICK_STYLES,
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: false
                    },
                    grid: {
                        display: false
                    }
                }
            }
        };

    }





    // Méthode pour formater les valeurs KPI (afficher '-' si 0)
	formatKPIValue(value: number | null | undefined): string {
		if (value === null || value === undefined || value === 0) {
			return '-';
		}
		return value.toLocaleString('fr-FR');
	}

	// Méthode pour formater les valeurs KWh en GWh
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

	// Méthode pour déterminer l'unité optimale pour l'énergie (MWh ou GWh)
	getOptimalEnergyUnit(value: number): { unit: string, divisor: number, label: string } {
		if (value >= 1000000) { // >= 1 GWh
			return { unit: 'GWh', divisor: 1000000, label: 'GWh' };
		} else if (value >= 1000) { // >= 1 MWh
			return { unit: 'MWh', divisor: 1000, label: 'MWh' };
		} else {
			return { unit: 'kWh', divisor: 1, label: 'kWh' };
		}
	}

	// Méthode pour déterminer l'unité optimale pour FCFA (Millions ou Milliards)
	getOptimalCurrencyUnit(value: number): { unit: string, divisor: number, label: string } {
		if (value >= 1000000000) { // >= 1 milliard
			return { unit: 'Milliards', divisor: 1000000000, label: 'Milliards FCFA' };
		} else if (value >= 1000000) { // >= 1 million
			return { unit: 'Millions', divisor: 1000000, label: 'Millions FCFA' };
		} else {
			return { unit: 'FCFA', divisor: 1, label: 'FCFA' };
		}
	}


	reinitialiserFiltres(): void {
		this.anneeSelectionnee = 2025;
		this.moisSelectionne = null;
		this.niveauTensionSelectionne = null;
		this.modeFacturationSelectionne = null;
		this.aucuneDonneeDisponible = false;
        this.aucuneDonneeTauxRecouvrementParDirection = false

		// Vider le cache pour forcer le rechargement
		this.clearCache();
		this.chargerStatistiques();
	}

	private clearCache(): void {
		this.cache.clear();
		this.lastRequestParams = null;
	}


    private assombrirCouleur(couleur: string): string {
        // Fonction simple pour assombrir une couleur hexadécimale
        const hex = couleur.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 30);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 30);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 30);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}
