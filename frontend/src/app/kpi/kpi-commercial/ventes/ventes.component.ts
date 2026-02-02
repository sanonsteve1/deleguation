import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { StatistiquesKPICommercialService } from '../../../../services/statistiques-kpi-commercial.service';
import { StatistiqueMensuelleResponsesKPICommercial } from '../../../../models/statistique-mensuelles-responses-kpi-commercial';
import { NiveauTension } from '../../../../models/niveau-tension';
import { ModeFacturation } from '../../../../models/mode-facturation';
import { StatistiquesConsommationService } from '../../../../services/statistiques-consommation.service';
import { ConsommationParDirection } from '../../../../models/consommation-par-direction';
import { CategorieClient } from '../../../../models/categorie-client';
import { Direction } from '../../../../models/direction';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
	selector: 'app-ventes',
	standalone: true,
	imports: [CommonModule, FormsModule, DropdownModule, MultiSelectModule, ButtonModule, ChartModule, ToggleSwitchModule, ProgressSpinnerModule],
	templateUrl: './ventes.component.html',
	styleUrls: ['./ventes.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class VentesComponent implements OnInit {
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
	niveauxTension: NiveauTension[] = [];
	modesFacturation: ModeFacturation[] = [];
	categoriesClient: CategorieClient[] = [];
	directions: Direction[] = [];
	
	// Valeurs sélectionnées
	anneeSelectionnee: number = 2025;
	moisSelectionne: number | null = null;
	niveauTensionSelectionne: number | null = null;
	modeFacturationSelectionne: number | null = null;
	categorieClientSelectionnee: number | null = null;
	directionsSelectionnees: number[] = [];

	// Toggle pour afficher montant ou énergie
	afficherMontant: boolean = false;

	// Données du graphique
	chartDonneesMensuellesMTBTConsommation: any;
	chartOptionsDonneesMensuellesMTBTConsommation: any;
	aucuneDonneeDisponible: boolean = false;
	headerMensuellesMTBTConsommation: string = "Evolution des ventes";

	// Unités dynamiques
	currentEnergyUnit: string = 'GWh';
	currentCurrencyUnit: string = 'Milliards';
	currentEnergyDivisor: number = 1000000;
	currentCurrencyDivisor: number = 1000000000;

	// Données mensuelles
	donneesMensuelleAnneePrecedente: StatistiqueMensuelleResponsesKPICommercial;
	donneesMensuelleAnneeCourante: StatistiqueMensuelleResponsesKPICommercial;

	// Données par direction
	donneesDirection: ConsommationParDirection[] = [];
	chartDataDirection: any;
	chartOptionsDirection: any;
	aucuneDonneeDisponibleDirection: boolean = false;
	loadingDirection: boolean = false;

	// Loading
	loading: boolean = false;
	loadingMessage: string = "Chargement des données...";

	// Labels des mois
	private readonly moisLabels: string[] = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

	// Maps pour optimiser les recherches
	private niveauxTensionMap = new Map<number, NiveauTension>();
	private modesFacturationMap = new Map<number, ModeFacturation>();
	private categoriesClientMap = new Map<number, CategorieClient>();
	private directionsMap = new Map<number, Direction>();

	// Styles standardisés pour tous les graphiques (optimisés pour carte 350px)
	private readonly STANDARD_LEGEND_STYLES = {
		display: true,
		position: 'bottom' as const,
		labels: {
			usePointStyle: true,
			pointStyle: 'line' as const,
			padding: 6,
			font: {
				size: 11,
				weight: 'bold' as const
			},
			boxWidth: 8,
			boxHeight: 8,
			color: '#333'
		}
	};

	private readonly STANDARD_AXIS_STYLES = {
		font: {
			size: 10,
			weight: 'bold' as const
		},
		color: '#333'
	};

	private readonly STANDARD_TICK_STYLES = {
		font: {
			size: 9,
			weight: 'bold' as const
		},
		color: '#333',
		padding: 6
	};

	constructor(
		private statistiquesKpiCommercialService: StatistiquesKPICommercialService,
		private statistiquesConsommationService: StatistiquesConsommationService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		// Initialiser les graphiques
		this.initGraphique();
		this.initGraphiqueDirection();
		// Charger les statistiques
		this.chargerStatistiques();
	}

	initGraphique(): void {
		// Initialiser avec des données vides
		this.aucuneDonneeDisponible = true;
		
		this.chartDonneesMensuellesMTBTConsommation = {
			labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
			datasets: []
		};

		this.chartOptionsDonneesMensuellesMTBTConsommation = {
			responsive: true,
			maintainAspectRatio: false,
			aspectRatio: 1,
			layout: {
				padding: {
					left: 10,
					right: 10,
					top: 0,
					bottom: 160
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
							const moisComplet = this.moisLabels[moisIndex] || `Mois ${item.label}`;
							return moisComplet;
						}
					}
				}
			},
			scales: {
				y: {
					beginAtZero: false, // Ne pas commencer à zéro pour mieux voir les variations
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
			}
		};
	}

	initGraphiqueDirection(): void {
		// Initialiser avec des données vides
		this.aucuneDonneeDisponibleDirection = true;
		
		this.chartDataDirection = {
			labels: [],
			datasets: []
		};

		this.chartOptionsDirection = {
			responsive: true,
			maintainAspectRatio: false,
			aspectRatio: 1.2,
			layout: {
				padding: {
					left: 15,
					right: 15,
					top: 10,
					bottom: 60
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
							}).format(val)} GWh`;
						}
					}
				}
			},
			scales: {
				y: {
					beginAtZero: true,
					title: {
						display: true,
						text: 'Consommation (GWh)',
						font: {
							size: 9,
							weight: 'bold' as const
						},
						color: '#333'
					},
					ticks: {
						font: {
							size: 8,
							weight: 'bold' as const
						},
						color: '#333',
						padding: 4,
						callback: function(value: any) {
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
						text: 'Directions'
					},
					ticks: {
						font: {
							size: 9,
							weight: 'bold'
						},
						maxRotation: 45,
						minRotation: 45,
						maxTicksLimit: 12,
						autoSkip: false,
						stepSize: 1,
						padding: 2
					}
				}
			}
		};
	}

	chargerStatistiques(): void {
		this.loading = true;
		this.loadingMessage = "Chargement des données...";
		this.cdr.markForCheck();

		// Charger les données pour l'année courante et précédente
		const anneeCourante$ = this.statistiquesKpiCommercialService.getStatistiquesMensuellesKPI(
			this.moisSelectionne,
			this.anneeSelectionnee,
			this.niveauTensionSelectionne,
			this.modeFacturationSelectionne
		);

		const anneePrecedente$ = this.statistiquesKpiCommercialService.getStatistiquesMensuellesKPI(
			this.moisSelectionne,
			this.anneeSelectionnee - 1,
			this.niveauTensionSelectionne,
			this.modeFacturationSelectionne
		);

		// Charger les données par direction (le filtrage par direction se fait côté client)
		const donneesDirection$ = this.statistiquesConsommationService.getConsommationsParDirection(
			this.anneeSelectionnee,
			this.moisSelectionne || undefined,
			this.niveauTensionSelectionne || undefined,
			this.modeFacturationSelectionne || undefined,
			this.categorieClientSelectionnee || undefined
		);

		// Charger les catégories client et directions depuis le service de consommation
		const categoriesClient$ = this.statistiquesConsommationService.getStatistiquesMensuelles(
			this.anneeSelectionnee,
			undefined, // on ne filtre pas par direction ici pour récupérer toutes les infos
			this.niveauTensionSelectionne || undefined,
			this.modeFacturationSelectionne || undefined,
			undefined // pas de catégorie client spécifique pour récupérer toutes les catégories
		);

		forkJoin({
			anneeCourante: anneeCourante$,
			anneePrecedente: anneePrecedente$,
			donneesDirection: donneesDirection$,
			categoriesClient: categoriesClient$
		}).pipe(
			finalize(() => {
				this.loading = false;
				this.cdr.markForCheck();
			})
		).subscribe({
			next: (responses) => {
				console.log('Réponses reçues:', responses);
				
				// Stocker les données
				this.donneesMensuelleAnneeCourante = responses.anneeCourante;
				this.donneesMensuelleAnneePrecedente = responses.anneePrecedente;
				this.donneesDirection = responses.donneesDirection;

				console.log('Données mensuelles courante:', this.donneesMensuelleAnneeCourante);
				console.log('Données direction:', this.donneesDirection);

				// Vérifier si les données sont vides ou nulles
				const donneesMensuellesVides = !this.donneesMensuelleAnneeCourante?.donneesMensuelleGenerale?.length && 
											  !this.donneesMensuelleAnneePrecedente?.donneesMensuelleGenerale?.length;
				
				const donneesDirectionVides = !this.donneesDirection?.length;

				console.log('Données mensuelles vides:', donneesMensuellesVides);
				console.log('Données direction vides:', donneesDirectionVides);

				// Extraire les listes de référence
				this.niveauxTension = responses.anneeCourante?.niveauxTension || [];
				this.modesFacturation = responses.anneeCourante?.modesFacturation || [];
				this.categoriesClient = responses.categoriesClient?.categoriesClient || [];
				this.directions = responses.categoriesClient?.directions || [];

				console.log('Niveaux tension:', this.niveauxTension);
				console.log('Modes facturation:', this.modesFacturation);
				console.log('Catégories client:', this.categoriesClient);
				console.log('Directions:', this.directions);

				// Construire les Maps pour optimiser les recherches
				this.buildLookupMaps();

				// Mettre à jour le header
				this.updateHeader();

				// Mettre à jour les graphiques
				this.updataChartRepartitionConsommationBTEtMTGroupe();
				this.mettreAJourGraphiqueDirection();

				this.cdr.markForCheck();
			},
			error: (error) => {
				console.error('Erreur lors du chargement des statistiques:', error);
				this.aucuneDonneeDisponible = true;
				this.aucuneDonneeDisponibleDirection = true;
				this.loading = false;
				this.cdr.markForCheck();
			}
		});
	}

	private buildLookupMaps(): void {
		this.niveauxTensionMap.clear();
		this.niveauxTension.forEach(nt => this.niveauxTensionMap.set(nt.id, nt));
		
		this.modesFacturationMap.clear();
		this.modesFacturation.forEach(mf => this.modesFacturationMap.set(mf.id, mf));

		this.categoriesClientMap.clear();
		this.categoriesClient.forEach(cc => this.categoriesClientMap.set(cc.id, cc));

		this.directionsMap.clear();
		this.directions.forEach(d => this.directionsMap.set(d.id, d));
	}

	updateHeader(): void {
		// Calculer les unités optimales basées sur les données
		this.calculateOptimalUnits();

		// Mettre à jour le header du graphique
		if (this.niveauTensionSelectionne && this.modeFacturationSelectionne) {
			const niveauCode = this.niveauxTensionMap.get(this.niveauTensionSelectionne)?.code || '';
			const modeDesignation = this.modesFacturationMap.get(this.modeFacturationSelectionne)?.designation || '';
			this.headerMensuellesMTBTConsommation = `Evolution des ventes ${niveauCode} ${modeDesignation}s`;
		} else if (this.niveauTensionSelectionne) {
			const niveauCode = this.niveauxTensionMap.get(this.niveauTensionSelectionne)?.code || '';
			this.headerMensuellesMTBTConsommation = `Evolution des ventes ${niveauCode}`;
		} else if (this.modeFacturationSelectionne) {
			const modeDesignation = this.modesFacturationMap.get(this.modeFacturationSelectionne)?.designation || '';
			this.headerMensuellesMTBTConsommation = `Evolution des ventes ${modeDesignation}s`;
		} else {
			this.headerMensuellesMTBTConsommation = "Evolution des ventes";
		}
	}

	private calculateOptimalUnits(): void {
		let maxEnergyValue = 0;
		let maxCurrencyValue = 0;

		// Analyser les données pour trouver les valeurs maximales
		this.donneesMensuelleAnneeCourante?.donneesMensuelleGenerale.forEach((d: any) => {
			if (d.consommationKwh > maxEnergyValue) maxEnergyValue = d.consommationKwh;
			if (d.montantConsomme > maxCurrencyValue) maxCurrencyValue = d.montantConsomme;
		});

		this.donneesMensuelleAnneePrecedente?.donneesMensuelleGenerale.forEach((d: any) => {
			if (d.consommationKwh > maxEnergyValue) maxEnergyValue = d.consommationKwh;
			if (d.montantConsomme > maxCurrencyValue) maxCurrencyValue = d.montantConsomme;
		});

		// Déterminer les unités optimales
		const energyOptimal = this.getOptimalEnergyUnit(maxEnergyValue);
		const currencyOptimal = this.getOptimalCurrencyUnit(maxCurrencyValue);

		this.currentEnergyUnit = energyOptimal.unit;
		this.currentCurrencyUnit = currencyOptimal.unit;
		this.currentEnergyDivisor = energyOptimal.divisor;
		this.currentCurrencyDivisor = currencyOptimal.divisor;
	}

	private getOptimalEnergyUnit(value: number): { unit: string, divisor: number } {
		if (value >= 1000000) {
			return { unit: 'GWh', divisor: 1000000 };
		} else if (value >= 1000) {
			return { unit: 'MWh', divisor: 1000 };
		} else {
			return { unit: 'kWh', divisor: 1 };
		}
	}

	private getOptimalCurrencyUnit(value: number): { unit: string, divisor: number } {
		if (value >= 1000000000) {
			return { unit: 'Milliards', divisor: 1000000000 };
		} else if (value >= 1000000) {
			return { unit: 'Millions', divisor: 1000000 };
		} else {
			return { unit: 'FCFA', divisor: 1 };
		}
	}

	updataChartRepartitionConsommationBTEtMTGroupe(): void {
		console.log('Mise à jour du graphique Evolution des ventes');
		console.log('Données année courante:', this.donneesMensuelleAnneeCourante);
		console.log('Données année précédente:', this.donneesMensuelleAnneePrecedente);
		
		// Vérifier si les données sont disponibles
		if (!this.donneesMensuelleAnneeCourante?.donneesMensuelleGenerale && 
			!this.donneesMensuelleAnneePrecedente?.donneesMensuelleGenerale) {
			console.log('Aucune donnée mensuelle disponible');
			this.aucuneDonneeDisponible = true;
			this.cdr.markForCheck();
			return;
		}

		const labels = this.moisLabels;

		// Créer un tableau de données pour tous les mois (12 mois) - utiliser null pour les valeurs manquantes
		const dataAnneeCouranteConsommationMTBT = new Array(12).fill(null);
		const dataAnneePrecedenteConspmmationMTBT = new Array(12).fill(null);

		// Remplir les données année courante
		this.donneesMensuelleAnneeCourante?.donneesMensuelleGenerale?.forEach((d: any) => {
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
		this.donneesMensuelleAnneePrecedente?.donneesMensuelleGenerale?.forEach((d: any) => {
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
		});

		// Vérifier si toutes les données sont nulles
		this.aucuneDonneeDisponible = [...dataAnneeCouranteConsommationMTBT, ...dataAnneePrecedenteConspmmationMTBT].every(v => v === null || v === undefined);

		console.log('Aucune donnée disponible:', this.aucuneDonneeDisponible);

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

		this.chartDonneesMensuellesMTBTConsommation = {
			labels,
			datasets: [
				{
					label: `${currentUnitLabel} ${this.anneeSelectionnee}`,
					data: dataAnneeCouranteConsommationMTBT,
					borderColor: '#FF6B6B',
					backgroundColor: 'rgba(255, 107, 107, 0.2)',
					fill: false,
					tension: 0.3,
					spanGaps: false
				},
				{
					label: `${currentUnitLabel} ${this.anneeSelectionnee - 1}`,
					data: dataAnneePrecedenteConspmmationMTBT,
					borderColor: '#4ECDC4',
					backgroundColor: 'rgba(78, 205, 196, 0.2)',
					fill: false,
					tension: 0.3,
					spanGaps: false
				}
			]
		};

		// Mettre à jour les options du graphique avec les nouvelles unités et valeurs dynamiques
		this.updateChartOptions(dynamicMin, dynamicMax, dynamicStepSize);
		this.cdr.markForCheck();
	}

	private updateChartOptions(dynamicMin?: number, dynamicMax?: number, dynamicStepSize?: number): void {
		const yAxisTitle = this.afficherMontant ? 
			(this.currentCurrencyUnit === 'Milliards' ? 'Montant (Milliards FCFA)' : 
			 this.currentCurrencyUnit === 'Millions' ? 'Montant (Millions FCFA)' : 'Montant (FCFA)') :
			(this.currentEnergyUnit === 'GWh' ? 'Consommation (GWh)' : 
			 this.currentEnergyUnit === 'MWh' ? 'Consommation (MWh)' : 'Consommation (kWh)');

		this.chartOptionsDonneesMensuellesMTBTConsommation.scales.y.title.text = yAxisTitle;
		
		// Mettre à jour les valeurs dynamiques si fournies
		if (dynamicMin !== undefined) {
			this.chartOptionsDonneesMensuellesMTBTConsommation.scales.y.min = dynamicMin;
		}
		if (dynamicMax !== undefined) {
			this.chartOptionsDonneesMensuellesMTBTConsommation.scales.y.max = dynamicMax;
		}
		if (dynamicStepSize !== undefined) {
			this.chartOptionsDonneesMensuellesMTBTConsommation.scales.y.ticks.stepSize = dynamicStepSize;
		}
	}

	mettreAJourGraphiqueDirection(): void {
		console.log('Mise à jour du graphique par direction');
		console.log('Données direction:', this.donneesDirection);
		
		// Vérifier si les données sont disponibles
		if (!this.donneesDirection || this.donneesDirection.length === 0) {
			console.log('Aucune donnée direction disponible');
			this.aucuneDonneeDisponibleDirection = true;
			this.chartDataDirection = {
				labels: [],
				datasets: []
			};
			this.cdr.markForCheck();
			return;
		}

		console.log('Données direction trouvées:', this.donneesDirection.length);
		this.aucuneDonneeDisponibleDirection = false;

		// Filtrer par directions si des directions sont sélectionnées
		let donneesFiltrees = this.donneesDirection;
		if (this.directionsSelectionnees && this.directionsSelectionnees.length > 0) {
			donneesFiltrees = this.donneesDirection.filter(d => this.directionsSelectionnees.includes(d.directionId));
		}

		// Convertir les valeurs de kWh en GWh (diviser par 1,000,000)
		const donneesEnGWh = donneesFiltrees.map(d => d.consommationKwh / 1000000);

		this.chartDataDirection = {
			labels: donneesFiltrees.map(d => d.directionDesignation),
			datasets: [{
				label: 'Consommation GWh',
				data: donneesEnGWh,
				backgroundColor: donneesFiltrees.map(d => d.couleur),
				borderColor: donneesFiltrees.map(d => this.assombrirCouleur(d.couleur)),
				borderWidth: 1
			}]
		};

		this.cdr.markForCheck();
	}

	private assombrirCouleur(couleur: string): string {
		// Fonction simple pour assombrir une couleur hexadécimale
		const hex = couleur.replace('#', '');
		const r = parseInt(hex.substr(0, 2), 16);
		const g = parseInt(hex.substr(2, 2), 16);
		const b = parseInt(hex.substr(4, 2), 16);
		
		const newR = Math.max(0, r - 30);
		const newG = Math.max(0, g - 30);
		const newB = Math.max(0, b - 30);
		
		return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
	}

	getDirectionsFiltrees(): ConsommationParDirection[] {
		// Filtrer par directions si des directions sont sélectionnées
		if (this.directionsSelectionnees && this.directionsSelectionnees.length > 0) {
			return this.donneesDirection.filter(d => this.directionsSelectionnees.includes(d.directionId));
		}
		return this.donneesDirection;
	}

	getTotalConsommationDirection(): number {
		return this.getDirectionsFiltrees().reduce((total, item) => total + item.consommationKwh, 0);
	}

	reinitialiserFiltres(): void {
		this.anneeSelectionnee = 2025;
		this.moisSelectionne = null;
		this.niveauTensionSelectionne = null;
		this.modeFacturationSelectionne = null;
		this.categorieClientSelectionnee = null;
		this.directionsSelectionnees = [];
		this.afficherMontant = false;
		
		// Réinitialiser les états des données
		this.aucuneDonneeDisponible = true;
		this.aucuneDonneeDisponibleDirection = true;
		
		// Réinitialiser les données
		this.donneesMensuelleAnneeCourante = null;
		this.donneesMensuelleAnneePrecedente = null;
		this.donneesDirection = [];
		
		// Charger les nouvelles données
		this.chargerStatistiques();
	}
}
