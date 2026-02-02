// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ChartModule } from 'primeng/chart';
// import { DropdownModule } from 'primeng/dropdown';
// import { CardModule } from 'primeng/card';
// import { ButtonModule } from 'primeng/button';
// import { ProgressSpinnerModule } from 'primeng/progressspinner';
// import { StatistiquesConsommationService } from '../../../services/statistiques-consommation.service';
// import { StatistiquesConsommationResponse } from '../../../models/statistiques-consommation-response';
// import { StatistiquesMensuellesResponse } from '../../../models/statistiques-mensuelles-response';
// import { ConsommationParDirection } from '../../../models/consommation-par-direction';
// import { NiveauTension } from '../../../models/niveau-tension';
// import { ModeFacturation } from '../../../models/mode-facturation';
// import { CategorieClient } from '../../../models/categorie-client';
//
// @Component({
// 	selector: 'app-tableau-de-bord-statistiques',
// 	standalone: true,
// 	imports: [
// 		CommonModule,
// 		FormsModule,
// 		ChartModule,
// 		DropdownModule,
// 		CardModule,
// 		ButtonModule,
// 		ProgressSpinnerModule
// 	],
// 	templateUrl: './tableau-de-bord.component.html',
// 	styleUrl: './tableau-de-bord.component.scss'
// })
// export class TableauDeBordStatistiquesComponent implements OnInit {
// 	// Données du graphique mensuel
// 	chartData: any;
// 	chartOptions: any;
//
// 	// Données du graphique par direction
// 	chartDataDirection: any;
// 	chartOptionsDirection: any;
// 	donneesDirection: ConsommationParDirection[] = [];
// 	loadingDirection: boolean = false;
//
// 	// Totaux pour la légende
// 	totalConsommationKwh: number = 0;
// 	totalConsommationFcfa: number = 0;
// 	totalPayeFcfa: number = 0;
// 	totalImpayeFcfa: number = 0;
//
// 	// Indicateur pour savoir si aucune donnée n'est disponible
// 	aucuneDonneeDisponible: boolean = false;
//
// 	// Filtres
// 	annees: number[] = [2024, 2025];
// 	mois: any[] = [
// 		{ label: 'Toute l\'année', value: null },
// 		{ label: 'Janvier', value: 1 },
// 		{ label: 'Février', value: 2 },
// 		{ label: 'Mars', value: 3 },
// 		{ label: 'Avril', value: 4 },
// 		{ label: 'Mai', value: 5 },
// 		{ label: 'Juin', value: 6 },
// 		{ label: 'Juillet', value: 7 },
// 		{ label: 'Août', value: 8 },
// 		{ label: 'Septembre', value: 9 },
// 		{ label: 'Octobre', value: 10 },
// 		{ label: 'Novembre', value: 11 },
// 		{ label: 'Décembre', value: 12 }
// 	];
//
// 	// Listes de référence pour les dropdowns
// 	niveauxTension: NiveauTension[] = [];
// 	modesFacturation: ModeFacturation[] = [];
// 	categoriesClient: CategorieClient[] = [];
//
// 	// Valeurs sélectionnées
// 	anneeSelectionnee: number = 2024;
// 	moisSelectionne: number | null = null;
// 	niveauTensionSelectionne: number | null = null;
// 	modeFacturationSelectionne: number | null = null;
// 	categorieClientSelectionnee: number | null = null;
//
// 	loading: boolean = false;
//
// 	constructor(private statistiquesService: StatistiquesConsommationService) {}
//
// 	ngOnInit(): void {
// 		this.chargerStatistiques();
// 		// Charger les données par direction par défaut
// 		this.initialiserOptionsGraphiqueDirection();
// 		this.chargerDonneesParDirection();
// 	}
//
// 	chargerStatistiques(): void {
// 		this.loading = true;
//
// 		this.statistiquesService.getStatistiquesMensuelles(
// 			this.anneeSelectionnee, null, this.niveauTensionSelectionne,
// 			this.modeFacturationSelectionne, this.categorieClientSelectionnee
// 		).subscribe({
// 			next: (response: StatistiquesMensuellesResponse) => {
// 				this.niveauxTension = response.niveauxTension;
// 				this.modesFacturation = response.modesFacturation;
// 				this.categoriesClient = response.categoriesClient;
//
// 				this.updateChartData(response);
// 				this.loading = false;
//
// 				// Recharger les données par direction quand les filtres changent
// 				this.chargerDonneesParDirection();
// 			},
// 			error: (error) => {
// 				console.error('Erreur lors du chargement des statistiques:', error);
// 				this.loading = false;
// 			}
// 		});
// 	}
//
// 	updateChartData(response: StatistiquesMensuellesResponse): void {
// 		const labelsMois = this.mois.filter(m => m.value !== null).map(m => m.label);
//
// 		const donneesConsommationKwh = response.donneesMensuelles.map(d => d.consommationKwh);
// 		const donneesConsommationFcfa = response.donneesMensuelles.map(d => d.montantConsommationFcfa);
// 		const donneesPaye = response.donneesMensuelles.map(d => d.montantPayeFcfa);
// 		const donneesImpaye = response.donneesMensuelles.map(d => d.montantImpayeFcfa);
//
// 		this.totalConsommationKwh = donneesConsommationKwh.reduce((sum, value) => sum + value, 0);
// 		this.totalConsommationFcfa = donneesConsommationFcfa.reduce((sum, value) => sum + value, 0);
// 		this.totalPayeFcfa = donneesPaye.reduce((sum, value) => sum + value, 0);
// 		this.totalImpayeFcfa = donneesImpaye.reduce((sum, value) => sum + value, 0);
//
// 		if (!this.totalConsommationKwh && !this.totalConsommationFcfa && !this.totalPayeFcfa && !this.totalImpayeFcfa) {
// 			this.aucuneDonneeDisponible = true;
// 		}
// 		else {
// 			this.aucuneDonneeDisponible = false;
// 		}
//
// 		this.chartData = {
// 			labels: labelsMois,
// 			datasets: [
// 				{
// 					label: 'Consommation (FCFA)',
// 					data: donneesPaye,
// 					backgroundColor: 'rgba(75, 192, 192, 0.6)',
// 					borderColor: 'rgb(75, 192, 192)',
// 					borderWidth: 2,
// 					type: 'bar'
// 				},
// 				{
// 					label: 'Impayé (FCFA)',
// 					data: donneesImpaye,
// 					backgroundColor: 'rgba(255, 99, 132, 0.6)',
// 					borderColor: 'rgb(255, 99, 132)',
// 					borderWidth: 2,
// 					type: 'bar'
// 				}
// 			]
// 		};
//
//
// 		this.chartOptions = {
// 			responsive: true,
// 			maintainAspectRatio: false,
// 			plugins: {
// 				legend: {
// 					display: true,
// 					position: 'top'
// 				},
// 				/*
// 				title: {
// 					display: true,
// 					text: `Statistiques - ${this.anneeSelectionnee}`,
// 					font: {
// 						size: 18
// 					}
// 				},
// 				*/
// 				tooltip: {
// 					callbacks: {
// 						label: (context: any) => {
// 							let label = context.dataset.label || '';
// 							if (label) {
// 								label += ': ';
// 							}
// 							if (context.parsed.y !== null) {
// 								const value = context.parsed.y;
// 								const millions = value / 1000000;
// 								label += new Intl.NumberFormat('fr-FR', {
// 									minimumFractionDigits: 0,
// 									maximumFractionDigits: 2
// 								}).format(millions) + ' Millions FCFA';
// 							}
// 							return label;
// 						}
// 					}
// 				}
// 			},
// 			scales: {
// 				y: {
// 					beginAtZero: true,
// 					title: {
// 						display: true,
// 						text: 'Montants (Millions FCFA)'
// 					},
// 					ticks: {
// 						callback: (value: any) => {
// 							const millions = value / 1000000;
// 							return new Intl.NumberFormat('fr-FR', {
// 								minimumFractionDigits: 0,
// 								maximumFractionDigits: 1
// 							}).format(millions);
// 						}
// 					}
// 				},
// 				x: {
// 					title: {
// 						display: true,
// 						text: 'Mois'
// 					}
// 				}
// 			}
// 		};
// 	}
//
// 	reinitialiserFiltres(): void {
// 		this.anneeSelectionnee = 2024;
// 		this.moisSelectionne = null;
// 		this.niveauTensionSelectionne = null;
// 		this.modeFacturationSelectionne = null;
// 		this.categorieClientSelectionnee = null;
//
// 		this.totalConsommationKwh = 0;
// 		this.totalConsommationFcfa = 0;
// 		this.totalPayeFcfa = 0;
// 		this.totalImpayeFcfa = 0;
// 		this.aucuneDonneeDisponible = false;
//
// 		this.chargerStatistiques();
// 		// Recharger aussi les données par direction
// 		this.chargerDonneesParDirection();
// 	}
//
//
// 	private initialiserOptionsGraphiqueDirection(): void {
// 		this.chartOptionsDirection = {
// 			responsive: true,
// 			maintainAspectRatio: false,
// 			plugins: {
// 				legend: {
// 					display: false
// 				},
// 				tooltip: {
// 					callbacks: {
// 						label: (context: any) => {
// 							const label = context.label || '';
// 							const value = this.formatNumber(context.parsed.y);
// 							return `${label}: ${value} kWh`;
// 						}
// 					}
// 				}
// 			},
// 			scales: {
// 				x: {
// 					title: {
// 						display: true,
// 						text: 'Directions'
// 					},
// 					ticks: {
// 						maxRotation: 45,
// 						minRotation: 0
// 					}
// 				},
// 				y: {
// 					title: {
// 						display: true,
// 						text: 'Consommation (kWh)'
// 					},
// 					beginAtZero: true,
// 					ticks: {
// 						callback: (value: any) => this.formatNumber(value)
// 					}
// 				}
// 			}
// 		};
// 	}
//
// 	chargerDonneesParDirection(): void {
// 		this.loadingDirection = true;
// 		this.donneesDirection = [];
//
// 		this.statistiquesService.getConsommationsParDirection(
// 			this.anneeSelectionnee,
// 			this.moisSelectionne || undefined,
// 			this.niveauTensionSelectionne || undefined,
// 			this.modeFacturationSelectionne || undefined,
// 			this.categorieClientSelectionnee || undefined
// 		).subscribe({
// 			next: (data: ConsommationParDirection[]) => {
// 				this.donneesDirection = data;
// 				this.mettreAJourGraphiqueDirection();
// 				this.loadingDirection = false;
// 			},
// 			error: (err: any) => {
// 				console.error('Erreur lors du chargement des données par direction:', err);
// 				this.loadingDirection = false;
// 			}
// 		});
// 	}
//
// 	private mettreAJourGraphiqueDirection(): void {
// 		if (!this.donneesDirection.length) {
// 			this.chartDataDirection = {
// 				labels: [],
// 				datasets: []
// 			};
// 			return;
// 		}
//
// 		this.chartDataDirection = {
// 			labels: this.donneesDirection.map(d => d.directionDesignation),
// 			datasets: [{
// 				label: 'Consommation kWh',
// 				data: this.donneesDirection.map(d => d.consommationKwh),
// 				backgroundColor: this.donneesDirection.map(d => d.couleur),
// 				borderColor: this.donneesDirection.map(d => this.assombrirCouleur(d.couleur)),
// 				borderWidth: 1
// 			}]
// 		};
// 	}
//
// 	private assombrirCouleur(couleur: string): string {
// 		// Fonction simple pour assombrir une couleur hexadécimale
// 		const hex = couleur.replace('#', '');
// 		const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 30);
// 		const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 30);
// 		const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 30);
//
// 		return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
// 	}
//
// 	private formatNumber(value: number): string {
// 		return new Intl.NumberFormat('fr-FR').format(value);
// 	}
//
// 	getTotalConsommationDirection(): number {
// 		return this.donneesDirection.reduce((total, item) => total + item.consommationKwh, 0);
// 	}
// }
