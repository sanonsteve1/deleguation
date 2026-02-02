import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { StatistiquesConsommationService } from '../../../services/statistiques-consommation.service';
import { StatistiquesConsommationResponse } from '../../../models/statistiques-consommation-response';
import { StatistiquesMensuellesResponse } from '../../../models/statistiques-mensuelles-response';
import { Direction } from '../../../models/direction';
import { NiveauTension } from '../../../models/niveau-tension';
import { ModeFacturation } from '../../../models/mode-facturation';
import { CategorieClient } from '../../../models/categorie-client';
import {StatistiquesKPICommercialService} from "../../../services/statistiques-kpi-commercial.service";
import {
	StatistiqueMensuelleResponsesKPICommercial
} from "../../../models/statistique-mensuelles-responses-kpi-commercial";
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import {TaxePostpaye} from "../../../models/taxe-postpaye";
import {TaxePrepaye} from "../../../models/taxe-prepaye";
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-kpi-commercial',
  imports: [ButtonModule,ChartModule, FormsModule, DropdownModule,CardModule,CommonModule, ToggleSwitchModule, ProgressSpinnerModule],
  templateUrl: './kpi-commercial.component.html',
  styleUrl: './kpi-commercial.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiCommercialComponent implements OnInit {

	// Données du graphique
	chartData: any;
	chartOptions: any;

	// Totaux pour la légende


	// Indicateurs pour savoir si aucune donnée n'est disponible pour chaque graphique
	aucuneDonneeDisponible: boolean = false;
	aucuneDonneeDisponibleMTBTConsommation: boolean = false;
	aucuneDonneeDisponibleEvolutionAbonnes: boolean = false;

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

	// Maps pour optimiser les recherches
	private niveauxTensionMap = new Map<number, NiveauTension>();
	private modesFacturationMap = new Map<number, ModeFacturation>();

	// Valeurs sélectionnées
	anneeSelectionnee: number = 2025;
	moisSelectionne: number | null = null;
	modeFacturationSelectionne: number | null = null;
	niveauTensionSelectionne: number | null = null;

	loading: boolean = false;
	loadingProgress: number = 0;
	loadingMessage: string = "Chargement des statistiques...";

	// Données pour les KPI du mois
	consommationKwhMois: number = 0;
	consommationFcfaMois: number = 0;
	cumulConsommationKwh: number = 0;
	cumulConsommationFcfa: number = 0;

	nombreAbonnesMois: number = 0;
	tauxCroissanceAbonnes: number = 0;

	nombreBranchementsMois: number = 0;
	tauxCroissanceBranchements: number = 0;

	chiffreAffairesTotal: number = 0;
	tauxRendementMois: number | null = null;
	tauxRecouvrementMois: number | null = null;
	tauxRecouvrementCumule: number | null = null;

	donneesMensuelleAnneePrecedente: StatistiqueMensuelleResponsesKPICommercial;
	donneesMensuelleAnneeCourante: StatistiqueMensuelleResponsesKPICommercial;

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
	chartRepartitionAbonnesPostpayeEtPrepaye: any;
	chartOptionsRepartitionAbonnesPostpayeEtPrepaye: any;

	// Graphique des branchements
	aucuneDonneeBranchementsDisponible: boolean = false;
	chartBranchements: any;
	chartOptionsBranchements: any;

	// Headers mémorisés pour éviter les recalculs
	headerMensuellesMTBTConsommation: string = "Evolution des ventes";
	headerRepartitionMTBT: string = "Répartition MT vs BT";
	headerEvolutionAbonne: string = "Evolution des clients";
	headerBranchements: string = "Branchements";
	headerRepartitionTaxes: string = "Répartition Globale des Taxes Prépayés+Postpayés";
	headerRepartitionAbonneMTBT: string = "Répartition des abonnés BT/MT";
	headerRepartitionAbonnePostpayePrepaye: string = "Répartition des abonnés Postpayé/Prépayé";
	chiffreAffaireMtEtBt: string = "Chiffres d'affaires ventes BT+MT";

	// Unités dynamiques pour les graphiques
	currentEnergyUnit: string = 'kWh';
	currentCurrencyUnit: string = 'FCFA';
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

	constructor(
		private statistiquesKpiCommercialService: StatistiquesKPICommercialService,
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
			mode: this.modeFacturationSelectionne
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
				this.processData(cachedCourant, cachedPrecedent);
			}, 50); // Petit délai pour afficher le message
			return;
		}

		// Préparer les observables (utiliser le cache si disponible)
		const anneeCourante$ = cachedCourant
			? Promise.resolve(cachedCourant)
			: this.statistiquesKpiCommercialService.getStatistiquesMensuellesKPI(
				this.moisSelectionne,
				this.anneeSelectionnee,
				this.niveauTensionSelectionne,
				this.modeFacturationSelectionne
			);

		const anneePrecedente$ = cachedPrecedent
			? Promise.resolve(cachedPrecedent)
			: this.statistiquesKpiCommercialService.getStatistiquesMensuellesKPI(
				this.moisSelectionne,
				this.anneeSelectionnee - 1,
				this.niveauTensionSelectionne,
				this.modeFacturationSelectionne
			);

		// Simuler un chargement progressif
		this.simulateProgress();

		// Charger les données (cache + API)
		forkJoin({
			anneeCourante: anneeCourante$,
			anneePrecedente: anneePrecedente$
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
				if (!cachedPrecedent) this.cache.set(cacheKeyPrecedent, responses.anneePrecedente);

				// Traiter les données
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

	private generateCacheKey(annee: number, params: any): string {
		return `${annee}_${params.mois || 'all'}_${params.tension || 'all'}_${params.mode || 'all'}`;
	}

	private areParamsEqual(params1: any, params2: any): boolean {
		if (!params2) return false;
		return params1.mois === params2.mois &&
			   params1.annee === params2.annee &&
			   params1.tension === params2.tension &&
			   params1.mode === params2.mode;
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

	private processData(anneeCourante: any, anneePrecedente: any): void {
		this.loadingProgress = 100;
		this.loadingMessage = "Finalisation...";
		this.cdr.markForCheck();

		// Traitement optimisé avec requestAnimationFrame pour éviter le blocage UI
		requestAnimationFrame(() => {
			// Année courante
			this.niveauxTension = anneeCourante.niveauxTension;
			this.modesFacturation = anneeCourante.modesFacturation;
			this.donneesMensuelleAnneeCourante = anneeCourante;

			// Année précédente
			this.donneesMensuelleAnneePrecedente = anneePrecedente;

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

		this.modesFacturationMap.clear();
		this.modesFacturation.forEach(mf => this.modesFacturationMap.set(mf.id, mf));
	}

	updateHeaders(): void {
		// Calculer les unités optimales basées sur les données
		this.calculateOptimalUnits();


		// Graphique 1: Évolution des ventes
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

		// Graphique 2: Répartition MT vs BT
		if (this.niveauTensionSelectionne) {
			const niveauCode = this.niveauxTensionMap.get(this.niveauTensionSelectionne)?.code || '';
			this.headerRepartitionMTBT = `Répartition ${niveauCode}`;
		} else {
			this.headerRepartitionMTBT = "Répartition MT vs BT";
		}

		// Graphique 3: Évolution des abonnés
		let label = '';
		if (this.niveauTensionSelectionne && !this.modeFacturationSelectionne) {
			label = 'Abonnés ' + (this.niveauxTensionMap.get(this.niveauTensionSelectionne)?.code || '');
		} else if (!this.niveauTensionSelectionne && this.modeFacturationSelectionne) {
			label = 'Abonnés ' + (this.modesFacturationMap.get(this.modeFacturationSelectionne)?.designation || '') + 's';
		} else if (this.niveauTensionSelectionne && this.modeFacturationSelectionne) {
			const niveauCode = this.niveauxTensionMap.get(this.niveauTensionSelectionne)?.code || '';
			const modeDesignation = this.modesFacturationMap.get(this.modeFacturationSelectionne)?.designation || '';
			label = 'Abonnés ' + niveauCode + ' ' + modeDesignation + 's';
		} else {
			label = 'Abonnés';
		}
		this.headerEvolutionAbonne = 'Evolution des ' + label;

		// Graphique 4: Branchements
		if (this.niveauTensionSelectionne && this.modeFacturationSelectionne) {
			const niveauCode = this.niveauxTensionMap.get(this.niveauTensionSelectionne)?.code || '';
			const modeDesignation = this.modesFacturationMap.get(this.modeFacturationSelectionne)?.designation || '';
			this.headerBranchements = `Branchements ${niveauCode} ${modeDesignation}s`;
		} else if (this.niveauTensionSelectionne) {
			const niveauCode = this.niveauxTensionMap.get(this.niveauTensionSelectionne)?.code || '';
			this.headerBranchements = `Branchements ${niveauCode}`;
		} else if (this.modeFacturationSelectionne) {
			const modeDesignation = this.modesFacturationMap.get(this.modeFacturationSelectionne)?.designation || '';
			this.headerBranchements = `Branchements ${modeDesignation}s`;
		} else {
			this.headerBranchements = "Branchements";
		}

		// Graphique 5: Répartition abonnés BT/MT (désactivé)
		this.headerRepartitionAbonneMTBT = 'Répartition des abonnés ' +
			(this.niveauTensionSelectionne
				? this.niveauxTensionMap.get(this.niveauTensionSelectionne)?.code || ' BT/MT'
				: ' BT/MT');

		// Graphique 6: Répartition abonnés Postpayé/Prépayé
		this.headerRepartitionAbonnePostpayePrepaye = 'Répartition des abonnés ' +
			(this.modeFacturationSelectionne
				? this.modesFacturationMap.get(this.modeFacturationSelectionne)?.designation || ' Postpayé/Prépayé'
				: ' Postpayé/Prépayé');

		// Autres headers
		this.headerRepartitionTaxes = 'Répartition Globale des Taxes ' +
			(this.modeFacturationSelectionne
				? (this.modesFacturationMap.get(this.modeFacturationSelectionne)?.designation || '') + 's'
				: 'Prépayés+Postpayés');

		this.chiffreAffaireMtEtBt = "Chiffres d'affaires ventes " +
			(this.niveauTensionSelectionne
				? this.niveauxTensionMap.get(this.niveauTensionSelectionne)?.code || 'BT+MT'
				: 'BT+MT');

		this.cdr.markForCheck(); // Forcer la détection des changements de headers
	}

	private calculateOptimalUnits(): void {
		// Calculer les unités optimales basées sur les données maximales
		let maxEnergyValue = 0;
		let maxCurrencyValue = 0;

		// Analyser les données pour trouver les valeurs maximales
		this.donneesMensuelleAnneeCourante?.donneesMensuelleGenerale.forEach(d => {
			if (d.consommationKwh > maxEnergyValue) maxEnergyValue = d.consommationKwh;
			if (d.montantConsomme > maxCurrencyValue) maxCurrencyValue = d.montantConsomme;
		});

		this.donneesMensuelleAnneePrecedente?.donneesMensuelleGenerale.forEach(d => {
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
		this.calculerKPIMensuels();

		// 1 - graphique Consommations BT + MT
		this.updataChartRepartitionConsommationBTEtMTGroupe()
		//////// 2 - graphique Consommations BT ET MT en barre  ////////////////////
		this.updataChartRepartitionConsommationBTEtMT()

		//////// 3 - Evolution des abonnés  ////////////////////
		this.updataChartRepartitionAbonne()

		///// 4 - Taxes
		this.updateChartRepartitionTaxes()

		//// 5 - Abonnes BT/MT
		this.updateChartRepartitionAbonnes()

		// 6- Abonnes Postpayé/Prépayé (seulement si pas de filtre MT ni mode de facturation)
		if (!this.shouldHidePostpayePrepayeChart()) {
			this.updateChartRepartitionAbonnesPostpayeEtPrepaye()
		}

		// 7- Branchements
		this.updateChartBranchements()

		this.cdr.markForCheck(); // Forcer la détection des changements de graphiques
	}

	updataChartRepartitionConsommationBTEtMTGroupe() {

		// Courbes MT/BT des consommations Kwh et FCFA
		const labels = this.moisLabels;

		// Créer un tableau de données pour tous les mois (12 mois) - utiliser null pour les valeurs manquantes
		const dataAnneeCouranteConsommationMTBT = new Array(12).fill(null);
		const dataAnneePrecedenteConspmmationMTBT = new Array(12).fill(null);

        // ✅ Nouveau tableau pour le taux de recouvrement (%)
        const dataTauxRecouvrement = new Array(12).fill(null);

        if (this.donneesMensuelleAnneeCourante?.evolutionTauxRecouvrement) {
            this.donneesMensuelleAnneeCourante.evolutionTauxRecouvrement.forEach(d => {
                const moisIndex = d.mois - 1;
                if (moisIndex >= 0 && moisIndex < 12) {
                    dataTauxRecouvrement[moisIndex] = d.tauxRecouvrement ?? null;
                }
            });
        }

        // Remplir les données année courante (utiliser null pour les valeurs 0)
		this.donneesMensuelleAnneeCourante?.donneesMensuelleGenerale.forEach(d => {
			const moisIndex = d.mois - 1;
			if (moisIndex >= 0 && moisIndex < 12) {
				const valeur = this.afficherMontant ? d.montantConsomme : d.consommationKwh;
				// Convertir selon l'unité optimale et utiliser null pour les valeurs 0currentCurrencyDivisor
				if (valeur && valeur > 0) {
					const divisor = this.afficherMontant ? this.currentCurrencyDivisor : this.currentEnergyDivisor;
					dataAnneeCouranteConsommationMTBT[moisIndex] = valeur / divisor;
				} else {
					dataAnneeCouranteConsommationMTBT[moisIndex] = null;
				}
			}
		});

		// Remplir les données année précédente (utiliser null pour les valeurs 0)
		this.donneesMensuelleAnneePrecedente?.donneesMensuelleGenerale.forEach(d => {
			const moisIndex = d.mois - 1;
			if (moisIndex >= 0 && moisIndex < 12) {
				const valeur = this.afficherMontant ? d.montantConsomme : d.consommationKwh;
				// Convertir selon l'unité optimale et utiliser null pour les valeurs 0
				if (valeur && valeur > 0) {
					const divisor = this.afficherMontant ? this.currentCurrencyDivisor : this.currentEnergyDivisor;
					dataAnneePrecedenteConspmmationMTBT[moisIndex] = valeur / divisor;
				} else {
					dataAnneePrecedenteConspmmationMTBT[moisIndex] = null;
				}
			}
		});

		console.log('Données année courante:', dataAnneeCouranteConsommationMTBT);
		console.log('Données année précédente:', dataAnneePrecedenteConspmmationMTBT);
		this.aucuneDonneeDisponible = [...dataAnneeCouranteConsommationMTBT, ...dataAnneePrecedenteConspmmationMTBT].every(v => v === null || v === undefined);
		console.log('Aucune donnée disponible:', this.aucuneDonneeDisponible);

		// Calculer les valeurs dynamiques pour l'échelle Y
		const validDataCourante = dataAnneeCouranteConsommationMTBT.filter(v => v !== null && v !== undefined);
		const validDataPrecedente = dataAnneePrecedenteConspmmationMTBT.filter(v => v !== null && v !== undefined);
		const allValidData = [...validDataCourante, ...validDataPrecedente];

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

		const currentUnit = this.afficherMontant ? this.currentCurrencyUnit : this.currentEnergyUnit;
		const currentUnitLabel = this.afficherMontant ?
			(this.currentCurrencyUnit === 'Milliards' ? 'Montant FCFA' :
			 this.currentCurrencyUnit === 'Millions' ? 'Montant FCFA' : 'FCFA') :
			(this.currentEnergyUnit === 'GWh' ? 'GWh' :
			 this.currentEnergyUnit === 'MWh' ? 'MWh' : 'kWh');

		this.chartDonneesMensuellesMTBTConsommation = {
			labels,
			datasets: [
                {
                    label: 'Taux de recouvrement (%)',
                    data: dataTauxRecouvrement,
                    type: 'line',
                    borderColor: '#FFA726',
                    backgroundColor: 'rgba(255, 167, 38, 0.2)',
                    yAxisID: 'y1',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 3,               // même taille que les autres courbes
                    pointHoverRadius: 5,          // effet au survol
                    pointStyle: 'circle',         // forme identique
                    spanGaps: false               // ne relie pas les points null (très important)
                },
                {
					label: `${currentUnitLabel} ${this.anneeSelectionnee}`,
					data: dataAnneeCouranteConsommationMTBT,
					borderColor: '#FF6B6B',
					backgroundColor: 'rgba(255, 107, 107, 0.2)',
					fill: false,
					tension: 0.3,
					spanGaps: false // Ne pas connecter les lignes entre les points null
				},
				{
					label: `${currentUnitLabel} ${this.anneeSelectionnee - 1}`,
					data: dataAnneePrecedenteConspmmationMTBT,
					borderColor: '#4ECDC4',
					backgroundColor: 'rgba(78, 205, 196, 0.2)',
					fill: false,
					tension: 0.3,
					spanGaps: false // Ne pas connecter les lignes entre les points null
				}
			]
		};

		this.chartOptionsDonneesMensuellesMTBTConsommation = {
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
						callback: function(value: any) {
							// Afficher des entiers pour les graduations (pas de virgules avec zéros)
							return new Intl.NumberFormat('fr-FR', {
								minimumFractionDigits: 0,
								maximumFractionDigits: 0
							}).format(value);
						}
					}
				},
                y1: {
                    position: 'right',
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                    grid: {
                        drawOnChartArea: false // évite la superposition de grilles
                    },
                    title: {
                        display: true,
                        text: 'Taux de recouvrement (%)',
                        color: '#FFA726',
                        ...this.STANDARD_AXIS_STYLES
                    },
                    ticks: {
                        color: '#FFA726',
                        callback: (value: number) => `${value}%`
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

	updataChartRepartitionConsommationBTEtMT() {

		// Labels des mois - tous les mois de l'année
		const labels = this.moisLabels;

		// Créer un tableau de données pour tous les mois (12 mois)
		const dataMT = new Array(12).fill(0);
		const dataBT = new Array(12).fill(0);

		// Remplir les données MT pour les mois disponibles
		this.donneesMensuelleAnneeCourante.donneesMensuelleMT.forEach(d => {
			const moisIndex = d.mois - 1; // mois commence à 1, index commence à 0
			if (moisIndex >= 0 && moisIndex < 12) {
				const valeur = this.afficherMontantRepartitionMensuellesMTBTConsommation ? d.montantConsomme : d.consommationKwh;
				// Convertir selon l'unité optimale
				if (valeur && valeur > 0) {
					const divisor = this.afficherMontantRepartitionMensuellesMTBTConsommation ? this.currentCurrencyDivisor : this.currentEnergyDivisor;
					dataMT[moisIndex] = valeur / divisor;
				} else {
					dataMT[moisIndex] = 0;
				}
			}
		});

		// Remplir les données BT pour les mois disponibles
		this.donneesMensuelleAnneeCourante.donneesMensuelleBT.forEach(d => {
			const moisIndex = d.mois - 1; // mois commence à 1, index commence à 0
			if (moisIndex >= 0 && moisIndex < 12) {
				const valeur = this.afficherMontantRepartitionMensuellesMTBTConsommation ? d.montantConsomme : d.consommationKwh;
				// Convertir selon l'unité optimale
				if (valeur && valeur > 0) {
					const divisor = this.afficherMontantRepartitionMensuellesMTBTConsommation ? this.currentCurrencyDivisor : this.currentEnergyDivisor;
					dataBT[moisIndex] = valeur / divisor;
				} else {
					dataBT[moisIndex] = 0;
				}
			}
		});

		// Vérifier s'il y a des données selon le filtre sélectionné
		if (this.niveauTensionSelectionne) {
			const niveauCode = this.niveauxTensionMap.get(this.niveauTensionSelectionne)?.code;
			if (niveauCode === 'MT') {
				this.aucuneDonneeDisponibleMTBTConsommation = dataMT.every(v => v === null || v === undefined || v === 0);
			} else if (niveauCode === 'BT') {
				this.aucuneDonneeDisponibleMTBTConsommation = dataBT.every(v => v === null || v === undefined || v === 0);
			} else {
				this.aucuneDonneeDisponibleMTBTConsommation = [... dataMT, ... dataBT].every(v => v === null || v === undefined || v === 0);
			}
		} else {
			this.aucuneDonneeDisponibleMTBTConsommation = [... dataMT, ... dataBT].every(v => v === null || v === undefined || v === 0);
		}

		const currentUnit = this.afficherMontantRepartitionMensuellesMTBTConsommation ? this.currentCurrencyUnit : this.currentEnergyUnit;
		const currentUnitLabel = this.afficherMontantRepartitionMensuellesMTBTConsommation ?
			(this.currentCurrencyUnit === 'Milliards' ? 'Montant FCFA' :
			 this.currentCurrencyUnit === 'Millions' ? 'Montant FCFA' : 'FCFA') :
			(this.currentEnergyUnit === 'GWh' ? 'GWh' :
			 this.currentEnergyUnit === 'MWh' ? 'MWh' : 'kWh');

		// Construire les datasets selon le filtre de tension sélectionné
		const datasets: any[] = [];

		// Si un niveau de tension est sélectionné, n'afficher que celui-ci
		if (this.niveauTensionSelectionne) {
			const niveauCode = this.niveauxTensionMap.get(this.niveauTensionSelectionne)?.code;

			if (niveauCode === 'MT') {
				datasets.push({
					label: `${currentUnitLabel} MT`,
					data: dataMT,
					backgroundColor: 'rgba(69, 183, 209, 0.8)', // Bleu pour MT
					borderColor: 'rgb(69, 183, 209)',
					borderWidth: 2
				});
			} else if (niveauCode === 'BT') {
				datasets.push({
					label: `${currentUnitLabel} BT`,
					data: dataBT,
					backgroundColor: 'rgba(150, 206, 180, 0.8)', // Vert pour BT
					borderColor: 'rgb(150, 206, 180)',
					borderWidth: 2
				});
			}
		} else {
			// Si aucun filtre de tension, afficher les deux
			datasets.push(
				{
					label: `${currentUnitLabel} MT`,
					data: dataMT,
					backgroundColor: 'rgba(69, 183, 209, 0.8)', // Bleu pour MT
					borderColor: 'rgb(69, 183, 209)',
					borderWidth: 2
				},
				{
					label: `${currentUnitLabel} BT`,
					data: dataBT,
					backgroundColor: 'rgba(150, 206, 180, 0.8)', // Vert pour BT
					borderColor: 'rgb(150, 206, 180)',
					borderWidth: 2
				}
			);
		}

		// Construction du dataset pour p-chart
		this.chartRepartitionMensuellesMTBTConsommation = {
			labels: labels,
			datasets: datasets
		};

		// Options
		this.chartOptionsRepartitionMensuellesMTBTConsommation = {
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
							const unit = this.afficherMontantRepartitionMensuellesMTBTConsommation ?
								(this.currentCurrencyUnit === 'Milliards' ? 'Milliards FCFA' :
								 this.currentCurrencyUnit === 'Millions' ? 'Millions FCFA' : 'FCFA') :
								(this.currentEnergyUnit === 'GWh' ? 'GWh' :
								 this.currentEnergyUnit === 'MWh' ? 'MWh' : 'kWh');
							const formatted = new Intl.NumberFormat('fr-FR', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							}).format(val);
							return `${context.dataset.label}: ${formatted} ${unit}`;
						},
						title: (tooltipItems: any) => {
							const index = tooltipItems[0].dataIndex;
							return this.mois.slice(1)[index]?.label || `Mois ${index + 1}`;
						}
					}
				}
			},
			scales: {
				y: {
					beginAtZero: true,
					title: {
						display: true,
						text: this.afficherMontantRepartitionMensuellesMTBTConsommation ?
							(this.currentCurrencyUnit === 'Milliards' ? 'Montant (Milliards FCFA)' :
							 this.currentCurrencyUnit === 'Millions' ? 'Montant (Millions FCFA)' : 'Montant (FCFA)') :
							(this.currentEnergyUnit === 'GWh' ? 'Consommation (GWh)' :
							 this.currentEnergyUnit === 'MWh' ? 'Consommation (MWh)' : 'Consommation (kWh)'),
						...this.STANDARD_AXIS_STYLES
					},
					stacked: true,
					ticks: {
						...this.STANDARD_TICK_STYLES,
						stepSize: this.calculateOptimalStepSize(dataMT, dataBT),
						maxTicksLimit: 8
					}
				},
				x: {
					title: {
						display: false,
						text: 'Mois'
					},
					stacked: true,
					ticks: {
						...this.STANDARD_TICK_STYLES,
						font: {
							size: 12,
							weight: 'bold'
						},
						maxRotation: 45,
						minRotation: 45,
						callback: function(value: any, index: any) {
							return labels[index] || '';
						},
						maxTicksLimit: 12,
						stepSize: 1,
						autoSkip: false
					}
				}
			},
			elements: {
				arc: {
					borderWidth: 2,
					borderColor: '#fff'
				}
			},
			cutout: '50%', // Trou central équilibré
			radius: '70%' // Taille équilibrée du camembert
		};

		this.cdr.markForCheck(); // Forcer la mise à jour du graphique
	}

	updataChartRepartitionAbonne() {
		// Courbe évolution des abonnes
		const labels = this.moisLabels;

		// labélisation
		let label=''

		if(this.niveauTensionSelectionne && !this.modeFacturationSelectionne) {
			label= 'Abonnés '+ this.niveauxTensionMap.get(this.niveauTensionSelectionne)?.code
		}
		else if(!this.niveauTensionSelectionne && this.modeFacturationSelectionne) {
			label= 'Abonnés '+ this.modesFacturationMap.get(this.modeFacturationSelectionne)?.designation +'s'
		}
		else if(this.niveauTensionSelectionne && this.modeFacturationSelectionne) {
			label= 'Abonnés '+ this.niveauxTensionMap.get(this.niveauTensionSelectionne)?.code + ' '+ this.modesFacturationMap.get(this.modeFacturationSelectionne)?.designation +'s'
		} else label ='Abonnés '

		// Construction du jeu de données
		let baseDataAnneeCouranteEvolutionAbonnes = null
		let baseDataAnneePrecedenteEvolutionAbonnes = null

		if(this.niveauTensionSelectionne) {
			const niveauCode = this.niveauxTensionMap.get(this.niveauTensionSelectionne)?.code;
			if(niveauCode === 'BT') {
				baseDataAnneeCouranteEvolutionAbonnes = this.donneesMensuelleAnneeCourante.donneesMensuelleBT
				baseDataAnneePrecedenteEvolutionAbonnes = this.donneesMensuelleAnneePrecedente.donneesMensuelleBT
			} else if(niveauCode === 'MT') {
				baseDataAnneeCouranteEvolutionAbonnes = this.donneesMensuelleAnneeCourante.donneesMensuelleMT
				baseDataAnneePrecedenteEvolutionAbonnes = this.donneesMensuelleAnneePrecedente.donneesMensuelleMT
			} else {
				// @TODO va evoluer plus tard
				baseDataAnneeCouranteEvolutionAbonnes = this.donneesMensuelleAnneeCourante.donneesMensuelleGenerale
				baseDataAnneePrecedenteEvolutionAbonnes = this.donneesMensuelleAnneePrecedente.donneesMensuelleGenerale
			}
		} else {
			baseDataAnneeCouranteEvolutionAbonnes = this.donneesMensuelleAnneeCourante.donneesMensuelleGenerale
			baseDataAnneePrecedenteEvolutionAbonnes = this.donneesMensuelleAnneePrecedente.donneesMensuelleGenerale
		}

		// Créer un tableau de données pour tous les mois (12 mois) - utiliser null pour les valeurs manquantes
		const dataAnneeCouranteEvolutionAbonnes = new Array(12).fill(null);
		const dataAnneePrecedenteEvolutionAbonnes = new Array(12).fill(null);

		// Remplir les données année courante (utiliser null pour les valeurs 0)
		baseDataAnneeCouranteEvolutionAbonnes?.forEach(d => {
			const moisIndex = d.mois - 1;
			if (moisIndex >= 0 && moisIndex < 12) {
				// Utiliser null pour les valeurs 0, null ou undefined (Chart.js ne les affichera pas)
				dataAnneeCouranteEvolutionAbonnes[moisIndex] = (d.nombreAbonne && d.nombreAbonne > 0) ? d.nombreAbonne : null;
			}
		});

		// Remplir les données année précédente (utiliser null pour les valeurs 0)
		baseDataAnneePrecedenteEvolutionAbonnes?.forEach(d => {
			const moisIndex = d.mois - 1;
			if (moisIndex >= 0 && moisIndex < 12) {
				// Utiliser null pour les valeurs 0, null ou undefined (Chart.js ne les affichera pas)
				dataAnneePrecedenteEvolutionAbonnes[moisIndex] = (d.nombreAbonne && d.nombreAbonne > 0) ? d.nombreAbonne : null;
			}
		});

		//console.log('Données abonnés année courante:', dataAnneeCouranteEvolutionAbonnes);
		//console.log('Données abonnés année précédente:', dataAnneePrecedenteEvolutionAbonnes);
		this.aucuneDonneeDisponibleEvolutionAbonnes = [...dataAnneeCouranteEvolutionAbonnes, ...dataAnneePrecedenteEvolutionAbonnes].every(v => v === null || v === undefined);
		//console.log('Aucune donnée abonnés disponible:', this.aucuneDonneeDisponibleEvolutionAbonnes);

		// Calculer les valeurs dynamiques pour l'échelle Y des abonnés
		const validDataAbonnesCourante = dataAnneeCouranteEvolutionAbonnes.filter(v => v !== null && v !== undefined);
		const validDataAbonnesPrecedente = dataAnneePrecedenteEvolutionAbonnes.filter(v => v !== null && v !== undefined);
		const allValidDataAbonnes = [...validDataAbonnesCourante, ...validDataAbonnesPrecedente];

		const maxValueAbonnes = allValidDataAbonnes.length > 0 ? Math.max(...allValidDataAbonnes) : 0;
		const minValueAbonnes = allValidDataAbonnes.length > 0 ? Math.min(...allValidDataAbonnes) : 0;

		// Calculer une valeur minimale dynamique avec une marge de 5% en dessous
		const dynamicMinAbonnes = minValueAbonnes > 0 ? Math.floor(minValueAbonnes * 0.95) : 0;

		// Calculer une valeur maximale dynamique avec une marge de 5% au-dessus
		const dynamicMaxAbonnes = maxValueAbonnes > 0 ? Math.ceil(maxValueAbonnes * 1.05) : 1000;

		// Calculer un stepSize optimal basé sur la plage dynamique
		// Pour avoir environ 4-5 graduations maximum et éviter les valeurs inutiles
		const rangeAbonnes = dynamicMaxAbonnes - dynamicMinAbonnes;
		const targetTicksAbonnes = 4;
		const rawStepAbonnes = rangeAbonnes / targetTicksAbonnes;

		// Arrondir à une valeur "propre" qui évite les graduations inutiles
		const magnitudeAbonnes = Math.pow(10, Math.floor(Math.log10(rawStepAbonnes)));
		const normalizedStepAbonnes = rawStepAbonnes / magnitudeAbonnes;

		let stepAbonnes;
		if (normalizedStepAbonnes <= 1.5) stepAbonnes = 1;
		else if (normalizedStepAbonnes <= 3) stepAbonnes = 2;
		else if (normalizedStepAbonnes <= 7) stepAbonnes = 5;
		else stepAbonnes = 10;

		const dynamicStepSizeAbonnes = stepAbonnes * magnitudeAbonnes;

		console.log('Évolution abonnés - Min:', minValueAbonnes, 'Max:', maxValueAbonnes, 'Dynamic min:', dynamicMinAbonnes, 'Dynamic max:', dynamicMaxAbonnes, 'Step size:', dynamicStepSizeAbonnes);

		this.chartEvolutionAbonnes = {
			labels,
			datasets: [
				{
					label: `${label} ${this.anneeSelectionnee}`,
					data: dataAnneeCouranteEvolutionAbonnes,
					borderColor: '#FF6B6B',
					backgroundColor: 'rgba(255, 107, 107, 0.2)',
					fill: false,
					tension: 0.3,
					spanGaps: false // Ne pas connecter les lignes entre les points null
				},
				{
					label: `${label} ${this.anneeSelectionnee - 1}`,
					data: dataAnneePrecedenteEvolutionAbonnes,
					borderColor: '#4ECDC4',
					backgroundColor: 'rgba(78, 205, 196, 0.2)',
					fill: false,
					tension: 0.3,
					spanGaps: false // Ne pas connecter les lignes entre les points null
				}
			]
		};

		this.chartOptionsEvolutionAbonne = {
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
								 `${new Intl.NumberFormat('fr-FR').format(val)}`;
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
					min: dynamicMinAbonnes, // Valeur minimale dynamique
					max: dynamicMaxAbonnes, // Valeur maximale dynamique pour une meilleure lisibilité
					title: {
						display: true,
						text: 'Nombre d\'abonnés',
						...this.STANDARD_AXIS_STYLES
					},
					ticks: {
						...this.STANDARD_TICK_STYLES,
						stepSize: dynamicStepSizeAbonnes, // StepSize dynamique optimisé
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
			elements: {
				line: {
					borderWidth: 2,
					tension: 0.4
				},
				point: {
					radius: 4,
					hoverRadius: 6,
					borderWidth: 2
				}
			}
		};
	}

	updateChartRepartitionTaxes(): void {
		const taxesPostpaye: TaxePostpaye = this.donneesMensuelleAnneeCourante?.taxePostpaye;
		const taxesPrepaye: TaxePrepaye = this.donneesMensuelleAnneeCourante?.taxePrepaye;

		// Fusion des 2 objets de taxes
		const taxesCombinees: Record<string, number> = {};

		for (const [key, value] of Object.entries(taxesPostpaye)) {
			if (value && value > 0) taxesCombinees[key] = (taxesCombinees[key] || 0) + value;
		}

		for (const [key, value] of Object.entries(taxesPrepaye)) {
			if (value && value > 0) taxesCombinees[key] = (taxesCombinees[key] || 0) + value;
		}


		if (Object.keys(taxesCombinees).length === 0) {
			this.aucuneDonneeTaxesDisponible = true;
			return;
		}
		this.aucuneDonneeTaxesDisponible = false;

		// Génération des labels & valeurs
		const labels: string[] = [];
		const valeurs: number[] = [];

		Object.entries(taxesCombinees).forEach(([cle, valeur]) => {
			const labelFormate = cle
				.replace('Mois', '')
				.replace(/([A-Z])/g, ' $1')
				.trim()
				.replace(/\b\w/g, l => l.toUpperCase());
			labels.push(labelFormate);
			valeurs.push(valeur);
		});

		// Jeu de données du graphique
		this.chartRepartitionTaxes = {
			labels,
			datasets: [
				{
					data: valeurs,
					backgroundColor: [
						'#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
						'#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
						'#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA', '#F1948A'
					],
					hoverOffset: 10
				}
			]
		};

		// Options du graphique
		this.chartOptionsRepartitionTaxes = {
			responsive: true,
			maintainAspectRatio: false,
			aspectRatio: 0.7, // Aspect ratio équilibré
			layout: {
				padding: {
					left: 20,
					right: 20,
					top: 20,
					bottom: 20
				}
			},
			plugins: {
				legend: {
					position: 'right',
					labels: {
						generateLabels: (chart: any) => {
							const data = chart.data;
							if (data.labels.length && data.datasets.length) {
								const dataset = data.datasets[0];
								const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
								return data.labels.map((label: string, i: number) => {
									const value = dataset.data[i];
									const pourcentage = ((value / total) * 100).toFixed(1);
									return {
										text: `${label}: (${pourcentage}%)`,
										fillStyle: dataset.backgroundColor[i]
									};
								});
							}
							return [];
						},
						usePointStyle: true,
						padding: 3,
						font: { size: 7 },
						boxWidth: 3,
						boxHeight: 3
					}
				},
				tooltip: {
					callbacks: {
						label: (context: any) => {
							const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
							const value = context.parsed;
							const pourcentage = ((value / total) * 100).toFixed(1);
							return `${new Intl.NumberFormat('fr-FR').format(value)} FCFA (${pourcentage}%)`;
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
			cutout: '50%', // Trou central équilibré
			radius: '70%' // Taille équilibrée du camembert
		};
	}

	updateChartRepartitionAbonnes(): void {
		const labels = ['MT', 'BT'];
		const data = [
			this.donneesMensuelleAnneeCourante?.abonnesMoisMT || 0,
			this.donneesMensuelleAnneeCourante?.abonnesMoisBT || 0
		];
		this.aucuneDonneeAbonnesDisponible = data.every(v=> !v)
		this.chartRepartitionAbonnes = {
			labels,
			datasets: [
				{
					data,
					backgroundColor: ['#4ECDC4', '#FF6B6B'], // Couleurs vives MT et BT
					hoverBackgroundColor: ['#26A69A', '#E57373']
				}
			]
		};

		this.chartOptionsRepartitionAbonnes = {
			responsive: true,
			maintainAspectRatio: false,
			aspectRatio: 1, // Aspect ratio équilibré
			layout: {
				padding: {
					left: 5,
					right: 5,
					top: 5,
					bottom: 105
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
									text: `${label}: ${(value / 1000).toFixed(0)}k (${pourcentage}%)`,
									fillStyle: dataset.backgroundColor[i]
								};
							});
						},
						usePointStyle: true,
						padding: 8,
						font: { size: 10 },
						boxWidth: 5,
						boxHeight: 5
					}
				},
				tooltip: {
					callbacks: {
						label: (context: any) => {
							const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
							const value = context.parsed;
							const pourcentage = total ? ((value / total) * 100).toFixed(1) : '0';
							return `${value} abonnés (${pourcentage}%)`;
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
			cutout: '50%', // Trou central équilibré
			radius: '70%' // Taille équilibrée du camembert
		};
	}

	updateChartRepartitionAbonnesPostpayeEtPrepaye(): void {
		const labels = ['Postpayé', 'Prépayé'];
		const data = [
			this.donneesMensuelleAnneeCourante?.abonneMoisPostpaye || 0,
			this.donneesMensuelleAnneeCourante?.abonneMoisPrepaye || 0
		];
		this.aucuneDonneeAbonnesPostpayeEtPrepayeDisponible = data.every(v=> !v)
		this.chartRepartitionAbonnesPostpayeEtPrepaye = {
			labels,
			datasets: [
				{
					data,
					backgroundColor: ['#4ECDC4', '#FF6B6B'], // Couleurs vives Postpayé et Prépayé
					hoverBackgroundColor: ['#26A69A', '#E57373']
				}
			]
		};

		this.chartOptionsRepartitionAbonnesPostpayeEtPrepaye = {
			responsive: true,
			maintainAspectRatio: false,
			aspectRatio: 1, // Aspect ratio équilibré
			layout: {
				padding: {
					left: 5,
					right: 5,
					top: 5,
					bottom: 105
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
									text: `${label}: ${(value / 1000).toFixed(0)}k (${pourcentage}%)`,
									fillStyle: dataset.backgroundColor[i]
								};
							});
						},
						usePointStyle: true,
						padding: 8,
						font: { size: 10 },
						boxWidth: 5,
						boxHeight: 5
					}
				},
				tooltip: {
					callbacks: {
						label: (context: any) => {
							const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
							const value = context.parsed;
							const pourcentage = total ? ((value / total) * 100).toFixed(1) : '0';
							return `${value} abonnés (${pourcentage}%)`;
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
			cutout: '50%', // Trou central équilibré
			radius: '70%' // Taille équilibrée du camembert
		};
	}


	calculerKPIMensuels(): void {
		// Récupérer les données du mois sélectionné (ou totaux si pas de mois sélectionné)
		this.consommationKwhMois = this.donneesMensuelleAnneeCourante?.consommationKwhMois || 0;
		this.consommationFcfaMois = this.donneesMensuelleAnneeCourante?.consommationFcfaMois || 0;
		this.cumulConsommationKwh = this.donneesMensuelleAnneeCourante?.cumulConsommationKwh || 0;
		this.cumulConsommationFcfa = this.donneesMensuelleAnneeCourante?.cumulConsommationFcfa || 0;

		this.nombreAbonnesMois = this.donneesMensuelleAnneeCourante?.abonnesMois || 0;
		this.nombreBranchementsMois = this.donneesMensuelleAnneeCourante?.nombreBranchementMois || 0;
		this.tauxRendementMois = this.donneesMensuelleAnneeCourante?.tauxRendementMois || null;
		this.tauxRecouvrementMois = this.donneesMensuelleAnneeCourante?.tauxRecouvrementMois || null;
		this.tauxRecouvrementCumule = this.donneesMensuelleAnneeCourante?.tauxRecouvrementCumule || null;

		// Chiffre d'affaires total (ventes MT + BT)
		this.chiffreAffairesTotal = (this.donneesMensuelleAnneeCourante?.totalVenteMT || 0) +
									(this.donneesMensuelleAnneeCourante?.totalVenteBT || 0);

		// Calculer taux de croissance des abonnés (mois actuel vs mois précédent de l'année précédente)
		if (this.moisSelectionne && this.donneesMensuelleAnneePrecedente) {
			const abonnesMoisPrecedent = this.donneesMensuelleAnneePrecedente?.abonnesMois || 0;
			if (abonnesMoisPrecedent > 0) {
				this.tauxCroissanceAbonnes = ((this.nombreAbonnesMois - abonnesMoisPrecedent) / abonnesMoisPrecedent) * 100;
			} else {
				this.tauxCroissanceAbonnes = 0;
			}

			// Calculer taux de croissance des branchements
			const branchementsMoisPrecedent = this.donneesMensuelleAnneePrecedente?.nombreBranchementsMois || 0;
			if (branchementsMoisPrecedent > 0) {
				this.tauxCroissanceBranchements = ((this.nombreBranchementsMois - branchementsMoisPrecedent) / branchementsMoisPrecedent) * 100;
			} else {
				this.tauxCroissanceBranchements = 0;
			}
		} else {
			// Si pas de mois sélectionné, on compare les totaux annuels
			const totalAbonnesAnneePrecedente = this.donneesMensuelleAnneePrecedente?.donneesMensuelleGenerale
				?.reduce((sum, d) => sum + d.nombreAbonne, 0) || 0;
			const totalAbonnesAnneeCourante = this.donneesMensuelleAnneeCourante?.donneesMensuelleGenerale
				?.reduce((sum, d) => sum + d.nombreAbonne, 0) || 0;

			if (totalAbonnesAnneePrecedente > 0) {
				this.tauxCroissanceAbonnes = ((totalAbonnesAnneeCourante - totalAbonnesAnneePrecedente) / totalAbonnesAnneePrecedente) * 100;
			}
		}
	}

	updateChartBranchements(): void {
		// Graphique des branchements sur l'année
		const labels = this.moisLabels;

		// Créer un tableau de données pour tous les mois (12 mois) - utiliser null pour les valeurs manquantes
		const dataBranchements = new Array(12).fill(null);

		// Remplir les données si disponibles (utiliser null pour les valeurs 0)
		this.donneesMensuelleAnneeCourante?.donneesMensuelleGenerale.forEach(d => {
			const moisIndex = d.mois - 1;
			if (moisIndex >= 0 && moisIndex < 12) {
				// Utiliser null pour les valeurs 0, null ou undefined (Chart.js ne les affichera pas)
				dataBranchements[moisIndex] = (d.nombreBranchements && d.nombreBranchements > 0) ? d.nombreBranchements : null;
			}
		});

		this.aucuneDonneeBranchementsDisponible = dataBranchements.every(v => v === null || v === undefined);

		// Calculer les valeurs dynamiques pour l'échelle Y
		const validData = dataBranchements.filter(v => v !== null && v !== undefined);
		const maxValue = validData.length > 0 ? Math.max(...validData) : 0;
		const minValue = validData.length > 0 ? Math.min(...validData) : 0;

		// Calculer un stepSize dynamique basé sur les données réelles
		const dynamicStepSize = this.calculateOptimalStepSize(dataBranchements, []);

		// Calculer une valeur maximale dynamique avec une marge de 20%
		const dynamicMax = maxValue > 0 ? Math.ceil(maxValue * 1.2) : 1000;

		this.chartBranchements = {
			labels,
			datasets: [
				{
					label: `Branchements ${this.anneeSelectionnee}`,
					data: dataBranchements, // Utiliser null pour les valeurs 0
					borderColor: '#4ECDC4',
					backgroundColor: 'rgba(78, 205, 196, 0.2)',
					fill: false,
					tension: 0.3,
					spanGaps: false, // Ne pas connecter les lignes entre les points null
					pointBackgroundColor: '#4ECDC4',
					pointBorderColor: '#4ECDC4',
					pointHoverBackgroundColor: '#45B7AA',
					pointHoverBorderColor: '#45B7AA'
				}
			]
		};

		console.log('Chart branchements final:', this.chartBranchements);
		console.log('Données branchements:', dataBranchements);
		console.log('Max value:', maxValue, 'Dynamic max:', dynamicMax, 'Step size:', dynamicStepSize);

		this.chartOptionsBranchements = {
			responsive: true,
			maintainAspectRatio: false,
			aspectRatio: 1.2, // Augmenté pour plus de hauteur
			layout: {
				padding: {
					left: 20,
					right: 20,
					top: 20,
					bottom: 80 // Augmenté pour la légende et l'axe X
				}
			},
			plugins: {
				legend: this.STANDARD_LEGEND_STYLES,
				tooltip: {
					callbacks: {
						label: (context: any) => {
							const val = context.parsed.y;
							return `${new Intl.NumberFormat('fr-FR').format(val)} branchements`;
						},
						title: (tooltipItems: any) => {
							const item = tooltipItems[0];
							const moisIndex = item.dataIndex;
							return this.mois.slice(1)[moisIndex]?.label || `Mois ${item.label}`;
						}
					}
				}
			},
			scales: {
				y: {
					beginAtZero: true,
					max: dynamicMax, // Valeur maximale dynamique
					title: {
						display: true,
						text: 'Nombre de branchements',
						...this.STANDARD_AXIS_STYLES
					},
					ticks: {
						...this.STANDARD_TICK_STYLES,
						stepSize: dynamicStepSize, // StepSize dynamique
						maxTicksLimit: 8, // Maximum 8 lignes pour une meilleure lisibilité
						callback: function(value: any) {
							return new Intl.NumberFormat('fr-FR').format(value);
						}
					}
				},
				x: {
					title: {
						display: false
					},
					ticks: {
						...this.STANDARD_TICK_STYLES,
						font: {
							size: 10,
							weight: 'bold'
						},
						maxRotation: 45,
						minRotation: 45,
						callback: (value: any, index: number) => {
							const moisLabels = this.mois.slice(1);
							return moisLabels[index]?.label || '';
						}
					}
				}
			},
			elements: {
				line: {
					borderWidth: 2,
					tension: 0.4
				},
				point: {
					radius: 4,
					hoverRadius: 6,
					borderWidth: 2
				}
			}
		};
	}

	// Méthode pour vérifier si le graphique Postpayé/Prépayé doit être masqué
	// Masquer si : tension = MT OU mode de facturation spécifique sélectionné
	shouldHidePostpayePrepayeChart(): boolean {
		// Masquer si tension = MT
		const isTensionMT = this.niveauTensionSelectionne !== null &&
							this.niveauxTensionMap.get(this.niveauTensionSelectionne)?.code === 'MT';

		// Masquer si un mode de facturation spécifique est sélectionné
		const isModeFacturationFiltered = this.modeFacturationSelectionne !== null;

		return isTensionMT || isModeFacturationFiltered;
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
		}) + ' Gwh';
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

	// Méthode pour formater les valeurs selon l'unité optimale
	formatOptimalValue(value: number, isCurrency: boolean = false): { formatted: string, unit: string, label: string } {
		if (value === null || value === undefined || value === 0) {
			return { formatted: '-', unit: '', label: '' };
		}

		if (isCurrency) {
			const optimal = this.getOptimalCurrencyUnit(value);
			const formatted = (value / optimal.divisor).toLocaleString('fr-FR', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			});
			return { formatted, unit: optimal.unit, label: optimal.label };
		} else {
			const optimal = this.getOptimalEnergyUnit(value);
			const formatted = (value / optimal.divisor).toLocaleString('fr-FR', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			});
			return { formatted, unit: optimal.unit, label: optimal.label };
		}
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

	reinitialiserFiltres(): void {
		this.anneeSelectionnee = 2025;
		this.moisSelectionne = null;
		this.niveauTensionSelectionne = null;
		this.modeFacturationSelectionne = null;
		this.aucuneDonneeDisponible = false;
		this.aucuneDonneeAbonnesDisponible = false
		this.aucuneDonneeAbonnesPostpayeEtPrepayeDisponible = false
		this.aucuneDonneeTaxesDisponible = false
		this.aucuneDonneeBranchementsDisponible = false
		this.tauxRecouvrementMois = null
		this.tauxRecouvrementCumule = null

		// Vider le cache pour forcer le rechargement
		this.clearCache();
		this.chargerStatistiques();
	}

	private clearCache(): void {
		this.cache.clear();
		this.lastRequestParams = null;
	}
}
