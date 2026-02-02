import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
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
import {StatistiquesKPITechniqueService} from "../../../services/statistiques-kpi-technique.service";
import {
    StatistiqueMensuelleResponsesKpiTechnique
} from "../../../models/statistique-mensuelles-responses-kpi-technique";
import {ProgressSpinnerModule} from "primeng/progressspinner";

@Component({
  selector: 'app-kpi-technique',
    imports: [ButtonModule,ChartModule, FormsModule, DropdownModule,CardModule,CommonModule, ToggleSwitchModule, ProgressSpinnerModule],
  templateUrl: './kpi-technique.component.html',
  styleUrl: './kpi-technique.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiTechniqueComponent implements OnInit {

    // Filtres
    annees: number[] = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
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


    constructor(
        private statistiquesKpiTechniqueService: StatistiquesKPITechniqueService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        // Charger les données initiales
        this.chargerStatistiques();
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
            tension: this.niveauTensionSelectionne,
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
            : this.statistiquesKpiTechniqueService.getStatistiquesMensuellesKPI(
                this.moisSelectionne,
                this.anneeSelectionnee,
                this.niveauTensionSelectionne,
            );

        const anneePrecedente$ = cachedPrecedent
            ? Promise.resolve(cachedPrecedent)
            : this.statistiquesKpiTechniqueService.getStatistiquesMensuellesKPI(
                this.moisSelectionne,
                this.anneeSelectionnee - 1,
                this.niveauTensionSelectionne,
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

    private processData(anneeCourante: any, anneePrecedente: any): void {
        this.loadingProgress = 100;
        this.loadingMessage = "Finalisation...";
        this.cdr.markForCheck();

        // Traitement optimisé avec requestAnimationFrame pour éviter le blocage UI
        requestAnimationFrame(() => {
            // Année courante
            this.niveauxTension = anneeCourante.niveauxTension;
            this.donneesMensuelleAnneeCourante = anneeCourante;

            // Année précédente
            this.donneesMensuelleAnneePrecedente = anneePrecedente;

            // Construire les Maps pour optimiser les recherches
           // this.buildLookupMaps();

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
        this.updataChartIndiceInterruption()

        // 2 - Energie non distribuée
        this.updataChartEnergieNonDistribuee()

        // 3 - Energie importee
        this.updataChartEnergieImportee()
    }

    updataChartIndiceInterruption() {
        //this.updateHeaders()
        this.headerMensuellesIndiceInterruption = this.afficherIndiceDuree? 'SAIDI': 'SAIFI'

        // Courbes indices interruption duree/frequence
        const labels = this.moisLabels;

        // Créer un tableau de données pour tous les mois (12 mois) - utiliser null pour les valeurs manquantes
        const dataAnneeCouranteIndiceInterruption = new Array(12).fill(null);
        const dataAnneePrecedenteIndiceInterruption = new Array(12).fill(null);

        // Remplir les données année courante (utiliser null pour les valeurs 0)
        this.donneesMensuelleAnneeCourante?.donneesMensuelleGenerale.forEach(d => {
            const moisIndex = d.mois - 1;
            if (moisIndex >= 0 && moisIndex < 12) {
                const valeur = this.afficherIndiceDuree ? d.dureeIndiceInterruption : d.frequenceIndiceInterruption;
                // Utiliser null pour les valeurs 0, null ou undefined (Chart.js ne les affichera pas)
                dataAnneeCouranteIndiceInterruption[moisIndex] = (valeur >= 0) ? valeur : null;
            }
        });

        // Remplir les données année précédente (utiliser null pour les valeurs 0)
        this.donneesMensuelleAnneePrecedente?.donneesMensuelleGenerale.forEach(d => {
            const moisIndex = d.mois - 1;
            if (moisIndex >= 0 && moisIndex < 12) {
                const valeur = this.afficherIndiceDuree ? d.dureeIndiceInterruption : d.frequenceIndiceInterruption;
                // Utiliser null pour les valeurs 0, null ou undefined (Chart.js ne les affichera pas)
                dataAnneePrecedenteIndiceInterruption[moisIndex] = (valeur >= 0) ? valeur : null;
            }
        });

        /*console.log('Données année courante:', dataAnneeCouranteConsommationMTBT);
        console.log('Données année précédente:', dataAnneePrecedenteConspmmationMTBT);*/
        this.aucuneDonneeIndiceInterruptionDisponible = [...dataAnneeCouranteIndiceInterruption, ...dataAnneePrecedenteIndiceInterruption].every(v => v === null || v === undefined);
        console.log('Aucune donnée disponible:', this.aucuneDonneeIndiceInterruptionDisponible);

        this.chartDonneesMensuellesIndiceInterruption = {
            labels,
            datasets: [
                {
                    label: `${(this.afficherIndiceDuree ? 'SAIDI (h) ' : 'SAIFI ')} ${this.anneeSelectionnee}`,
                    data: dataAnneeCouranteIndiceInterruption,
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.2)',
                    fill: false,
                    tension: 0.3,
                    spanGaps: false // Ne pas connecter les lignes entre les points null
                },
                {
                    label: `${(this.afficherIndiceDuree ? 'SAIDI (h) ' : 'SAIFI ')} ${this.anneeSelectionnee - 1}`,
                    data: dataAnneePrecedenteIndiceInterruption,
                    borderColor: '#4ECDC4',
                    backgroundColor: 'rgba(78, 205, 196, 0.2)',
                    fill: false,
                    tension: 0.3,
                    spanGaps: false // Ne pas connecter les lignes entre les points null
                }
            ]
        };

        this.chartOptionsDonneesMensuellesIndiceInterruption = {
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

    updataChartEnergieNonDistribuee() {
        //this.updateHeaders()
       // this.headerMensuellesIndiceInterruption = this.afficherIndiceDuree? 'durée': 'fréquence'

        // Courbes indices interruption duree/frequence
        const labels = this.moisLabels;

        // Créer un tableau de données pour tous les mois (12 mois) - utiliser null pour les valeurs manquantes
        const dataAnneeCouranteEnergieNonDistribuee = new Array(12).fill(null);
        const dataAnneePrecedenteEnergieNonDistribuee = new Array(12).fill(null);

        // Remplir les données année courante (utiliser null pour les valeurs 0)
        this.donneesMensuelleAnneeCourante?.donneesMensuelleGenerale.forEach(d => {
            const moisIndex = d.mois - 1;
            if (moisIndex >= 0 && moisIndex < 12) {
                const valeur = this.afficherEnergieNonDistribueeKwh ? d.quantiteEnergieNonDistribueeKwh : d.montantEnergieNonDistribueeFcfa;
                const divisor = this.afficherEnergieNonDistribueeKwh ? 10**6 : 10**9
                // Utiliser null pour les valeurs 0, null ou undefined (Chart.js ne les affichera pas)
                dataAnneeCouranteEnergieNonDistribuee[moisIndex] = (valeur && valeur > 0) ? valeur/divisor : null;
            }
        });

        // Remplir les données année précédente (utiliser null pour les valeurs 0)
        this.donneesMensuelleAnneePrecedente?.donneesMensuelleGenerale.forEach(d => {
            const moisIndex = d.mois - 1;
            if (moisIndex >= 0 && moisIndex < 12) {
                const valeur = this.afficherEnergieNonDistribueeKwh ? d.quantiteEnergieNonDistribueeKwh : d.montantEnergieNonDistribueeFcfa;
                const divisor = this.afficherEnergieNonDistribueeKwh ? 10**6 : 10**9
                // Utiliser null pour les valeurs 0, null ou undefined (Chart.js ne les affichera pas)
                dataAnneePrecedenteEnergieNonDistribuee[moisIndex] = (valeur && valeur > 0) ? valeur/divisor : null;
            }
        });

        /*console.log('Données année courante:', dataAnneeCouranteConsommationMTBT);
        console.log('Données année précédente:', dataAnneePrecedenteConspmmationMTBT);*/
        this.aucuneDonneeEnergieNonDistribueeDisponible = [...dataAnneeCouranteEnergieNonDistribuee, ...dataAnneePrecedenteEnergieNonDistribuee].every(v => v === null || v === undefined);
        console.log('Aucune donnée disponible:', this.aucuneDonneeIndiceInterruptionDisponible);

        this.chartDonneesMensuellesEnergieNonDistribuee = {
            labels,
            datasets: [
                {
                    label: `${(this.afficherEnergieNonDistribueeKwh ? 'Energie non distribuée (GWh)': 'Montant (FCFA)' )} ${this.anneeSelectionnee}`,
                    data: dataAnneeCouranteEnergieNonDistribuee,
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.2)',
                    fill: false,
                    tension: 0.3,
                    spanGaps: false // Ne pas connecter les lignes entre les points null
                },
                {
                    label: `${(this.afficherEnergieNonDistribueeKwh ? 'Energie non distribuée (GWh)': 'Montant (FCFA)')} ${this.anneeSelectionnee - 1}`,
                    data: dataAnneePrecedenteEnergieNonDistribuee,
                    borderColor: '#4ECDC4',
                    backgroundColor: 'rgba(78, 205, 196, 0.2)',
                    fill: false,
                    tension: 0.3,
                    spanGaps: false // Ne pas connecter les lignes entre les points null
                }
            ]
        };

        this.chartOptionsDonneesMensuellesEnergieNonDistribuee = {
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
                            return this.afficherEnergieNonDistribueeKwh
                                ? `${new Intl.NumberFormat('fr-FR').format(val)} GWh`
                                : `${new Intl.NumberFormat('fr-FR').format(val)} Milliards FCFA`;
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
                        text: !this.afficherEnergieNonDistribueeKwh ? 'Montant (Milliards FCFA)' : 'Energie non distribuée'
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

    updataChartEnergieImportee() {
        //this.updateHeaders()
        // this.headerMensuellesIndiceInterruption = this.afficherIndiceDuree? 'durée': 'fréquence'

        // Courbes indices interruption duree/frequence
        const labels = this.moisLabels;

        // Créer un tableau de données pour tous les mois (12 mois) - utiliser null pour les valeurs manquantes
        const dataAnneeCouranteEnergieImportee = new Array(12).fill(null);
        const dataAnneePrecedenteEnergieImportee = new Array(12).fill(null);

        // Remplir les données année courante (utiliser null pour les valeurs 0)
        this.donneesMensuelleAnneeCourante?.donneesMensuelleGenerale.forEach(d => {
            const moisIndex = d.mois - 1;
            if (moisIndex >= 0 && moisIndex < 12) {
                const valeur = d.importationEnergieKwh
                // Utiliser null pour les valeurs 0, null ou undefined (Chart.js ne les affichera pas)
                dataAnneeCouranteEnergieImportee[moisIndex] = (valeur && valeur > 0) ? valeur/(10**6) : null;
            }
        });

        // Remplir les données année précédente (utiliser null pour les valeurs 0)
        this.donneesMensuelleAnneePrecedente?.donneesMensuelleGenerale.forEach(d => {
            const moisIndex = d.mois - 1;
            if (moisIndex >= 0 && moisIndex < 12) {
                const valeur = d.importationEnergieKwh
                // Utiliser null pour les valeurs 0, null ou undefined (Chart.js ne les affichera pas)
                dataAnneePrecedenteEnergieImportee[moisIndex] = (valeur && valeur > 0) ? valeur/(10**6) : null;
            }
        });

        /*console.log('Données année courante:', dataAnneeCouranteConsommationMTBT);
        console.log('Données année précédente:', dataAnneePrecedenteConspmmationMTBT);*/
        this.aucuneDonneeEnergieImporteeDisponible = [...dataAnneeCouranteEnergieImportee, ...dataAnneePrecedenteEnergieImportee].every(v => v === null || v === undefined);
        console.log('Aucune donnée disponible:', this.aucuneDonneeIndiceInterruptionDisponible);

        this.chartDonneesMensuellesEnergieImportee = {
            labels,
            datasets: [
                {
                    label: `Energie importée (GWh) ${this.anneeSelectionnee}`,
                    data: dataAnneeCouranteEnergieImportee,
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.2)',
                    fill: false,
                    tension: 0.3,
                    spanGaps: false // Ne pas connecter les lignes entre les points null
                },
                {
                    label: `Energie importée (GWh) ${this.anneeSelectionnee - 1}`,
                    data: dataAnneePrecedenteEnergieImportee,
                    borderColor: '#4ECDC4',
                    backgroundColor: 'rgba(78, 205, 196, 0.2)',
                    fill: false,
                    tension: 0.3,
                    spanGaps: false // Ne pas connecter les lignes entre les points null
                }
            ]
        };

        this.chartOptionsDonneesMensuellesEnergieImportee = {
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
                            return `${new Intl.NumberFormat('fr-FR').format(val)} GWh`;
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
                        text:  'Energie importée (GWh)'
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

    reinitialiserFiltres(): void {
        this.anneeSelectionnee = 2025;
        this.moisSelectionne = null;
        this.niveauTensionSelectionne = null;
        this.aucuneDonneeIndiceInterruptionDisponible= false
        this.aucuneDonneeEnergieNonDistribueeDisponible= false
        this.aucuneDonneeEnergieImporteeDisponible= false
        /*this.aucuneDonneeAbonnesDisponible = false
        this.aucuneDonneeAbonnesPostpayeEtPrepayeDisponible = false
        this.aucuneDonneeTaxesDisponible = false
        this.aucuneDonneeBranchementsDisponible = false*/

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

    // Méthode pour formater les valeurs FCFA en milliards
    formatFcfaToMilliards(value: number | null | undefined): string {
        if (value === null || value === undefined) {
            return '-';
        }
        const milliards = value / 1000000000; // Conversion FCFA vers milliards
        return milliards.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
}
