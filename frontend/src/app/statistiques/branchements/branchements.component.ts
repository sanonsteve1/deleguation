import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { StatistiqueBranchementService } from '../../../services/statistique-branchement.service';
import { StatistiqueAmperage } from '../../../models/statistique-amperage';
import { StatistiqueRegion } from '../../../models/statistique-region';
import { StatistiqueAgence } from '../../../models/statistique-agence';
import { ResumeStatistiques } from '../../../models/resume-statistiques';
import { DropdownOption } from '../../../models/filtre-options.model';
import { ResumeWidgetComponent } from './components/resume-widget.component';
import { AmperageWidgetComponent } from './components/amperage-widget.component';
import { RegionWidgetComponent } from './components/region-widget.component';
import { AgenceWidgetComponent } from './components/agence-widget.component';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-branchements',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DropdownModule,
        MultiSelectModule,
        CalendarModule,
        ButtonModule,
        ToastModule,
        DialogModule,
        CardModule,
        TableModule,
        TagModule,
        ProgressBarModule,
        TooltipModule,
        ResumeWidgetComponent,
        AmperageWidgetComponent,
        RegionWidgetComponent,
        AgenceWidgetComponent
    ],
    providers: [MessageService],
    templateUrl: './branchements.component.html',
    styleUrls: ['./branchements.component.scss']
})
export class BranchementsComponent implements OnInit {
    // Données
    resume: ResumeStatistiques | null = null;
    statistiquesAmperage: StatistiqueAmperage[] = [];
    statistiquesRegions: StatistiqueRegion[] = [];
    statistiquesAgences: StatistiqueAgence[] = [];

    // Filtres
    regions: DropdownOption[] = [];
    agences: DropdownOption[] = [];
    amperages: DropdownOption[] = [];
    phases: DropdownOption[] = [];
    typesBranchement: DropdownOption[] = [];
    sourcesDonnees: DropdownOption[] = [];
    dateSelectionnee: Date | null = null;
    
    // Plage d'années pour le p-calendar
    yearRange: string = '2020:2030';
    // Année par défaut à afficher dans le calendrier
    defaultYear: number = new Date().getFullYear();
    // Date par défaut pour le p-calendar
    defaultDate: Date = new Date();
    // Années disponibles dans la base de données
    anneesDisponibles: number[] = [];
    // Sélections multiples
    regionsSelectionnees: number[] = [];
    agencesSelectionnees: number[] = [];
    amperagesSelectionnes: number[] = [];
    phasesSelectionnees: string[] = [];
    typesBranchementSelectionnes: string[] = [];
    sourcesSelectionnees: string[] = [];

    // Détail région sélectionnée
    regionDetail: StatistiqueRegion | null = null;
    afficherDetailRegion: boolean = false;

    // État de chargement
    loading = false;

    constructor(
        private statistiqueService: StatistiqueBranchementService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.initialiserFiltres();
        this.initialiserFiltresDisponibles();
        this.chargerDonnees();
    }

    /**
     * Initialise les listes de filtres
     */
    initialiserFiltres(): void {
        // La date sera gérée par le p-calendar
        // Pas besoin d'initialiser des listes d'années et mois
    }

    /**
     * Initialise les filtres avec toutes les données disponibles
     */
    private initialiserFiltresDisponibles(): void {
        // Initialiser la plage d'années pour le p-calendar
        this.statistiqueService.getAnneesDisponibles({}).subscribe({
            next: (annees) => {
                console.log('Années reçues du backend:', annees);
                if (annees && annees.length > 0) {
                    console.log('Nombre d\'années:', annees.length);
                    console.log('Années brutes:', annees.map(a => a.annee));
                    
                    // Filtrer les années invalides (négatives ou trop grandes)
                    const anneesValides = annees
                        .map(a => a.annee)
                        .filter(annee => annee > 0 && annee >= 1900 && annee <= 2100);
                    
                    console.log('Années valides après filtrage:', anneesValides);
                    
                    if (anneesValides.length > 0) {
                        const anneesMin = Math.min(...anneesValides);
                        const anneesMax = Math.max(...anneesValides);
                        this.yearRange = `${anneesMin}:${anneesMax}`;
                        // Stocker les années disponibles pour validation
                        this.anneesDisponibles = anneesValides;
                        // Définir l'année par défaut comme la première année disponible
                        this.defaultYear = anneesMin;
                        // Définir la date par défaut pour le calendrier (1er janvier de la première année)
                        this.defaultDate = new Date(anneesMin, 0, 1);
                        console.log('Plage d\'années définie:', this.yearRange);
                        console.log('Années disponibles stockées:', this.anneesDisponibles);
                        console.log('Année par défaut définie:', this.defaultYear);
                        console.log('Date par défaut définie:', this.defaultDate);
                        console.log('yearRange property:', this.yearRange);
                    } else {
                        console.log('Aucune année valide trouvée après filtrage - utilisation de la plage par défaut');
                        const currentYear = new Date().getFullYear();
                        this.yearRange = `${currentYear - 5}:${currentYear + 5}`;
                        console.log('Plage d\'années par défaut:', this.yearRange);
                    }
                } else {
                    console.log('Aucune année trouvée ou tableau vide - utilisation de la plage par défaut');
                    // Plage par défaut basée sur l'année actuelle
                    const currentYear = new Date().getFullYear();
                    this.yearRange = `${currentYear - 5}:${currentYear + 5}`;
                    console.log('Plage d\'années par défaut:', this.yearRange);
                }
            },
            error: (error) => {
                console.error("Erreur lors de l'initialisation des années:", error);
                // Plage par défaut en cas d'erreur
                const currentYear = new Date().getFullYear();
                this.yearRange = `${currentYear - 5}:${currentYear + 5}`;
                console.log('Plage d\'années par défaut (erreur):', this.yearRange);
            }
        });

        // Initialiser les régions avec toutes les régions disponibles
        this.statistiqueService.getRegionsDisponibles({}).subscribe({
            next: (regions) => {
                console.log('Régions reçues du backend:', regions);
                this.regions = regions.map((r) => {
                    console.log('Mapping région:', r, 'nomdepartement:', r.nomdepartement, 'departementid:', r.departementid);
                    return {
                        label: r.nomdepartement,
                        value: r.departementid
                    };
                });
                console.log('Régions mappées:', this.regions);
            },
            error: (error) => {
                console.error("Erreur lors de l'initialisation des régions:", error);
            }
        });

        // Initialiser les agences avec toutes les agences disponibles
        this.statistiqueService.getAgencesDisponibles({}).subscribe({
            next: (agences) => {
                console.log('Agences reçues du backend:', agences);
                this.agences = agences.map((a) => {
                    console.log('Mapping agence:', a, 'nomagence:', a.nomagence, 'agenceid:', a.agenceid);
                    return {
                        label: a.nomagence,
                        value: a.agenceid
                    };
                });
                console.log('Agences mappées:', this.agences);
            },
            error: (error) => {
                console.error("Erreur lors de l'initialisation des agences:", error);
            }
        });

        // Initialiser les ampérages avec tous les ampérages disponibles
        this.statistiqueService.getAmperagesDisponibles({}).subscribe({
            next: (amperages) => {
                console.log('Ampérages reçus du backend:', amperages);
                this.amperages = amperages.map((a) => {
                    console.log('Mapping ampérage:', a, 'libelleamperage:', a.libelleamperage, 'amperageid:', a.amperageid);
                    return {
                        label: a.libelleamperage,
                        value: a.amperageid
                    };
                });
                console.log('Ampérages mappés:', this.amperages);
            },
            error: (error) => {
                console.error("Erreur lors de l'initialisation des ampérages:", error);
            }
        });

        // Initialiser les phases avec toutes les phases disponibles
        this.statistiqueService.getPhasesDisponibles({}).subscribe({
            next: (phases) => {
                this.phases = phases.map((p) => ({
                    label: p.phase,
                    value: p.phase
                }));
            },
            error: (error) => {
                console.error("Erreur lors de l'initialisation des phases:", error);
            }
        });

        // Initialiser les types de branchement avec tous les types disponibles
        this.statistiqueService.getTypesBranchementDisponibles({}).subscribe({
            next: (typesBranchement) => {
                console.log('Types de branchement reçus du backend:', typesBranchement);
                this.typesBranchement = typesBranchement.map((t) => {
                    console.log('Mapping type branchement:', t, 'typebranchement:', t.typebranchement);
                    return {
                        label: t.typebranchement,
                        value: t.typebranchement
                    };
                });
                console.log('Types de branchement mappés:', this.typesBranchement);
            },
            error: (error) => {
                console.error("Erreur lors de l'initialisation des types de branchement:", error);
            }
        });

        // Initialiser les sources de données avec toutes les sources disponibles
        this.statistiqueService.getSourcesDonneesDisponibles({}).subscribe({
            next: (sourcesDonnees) => {
                console.log('Sources de données reçues du backend:', sourcesDonnees);
                this.sourcesDonnees = sourcesDonnees.map((s) => {
                    console.log('Mapping source données:', s, 'sourcedonnees:', s.sourcedonnees);
                    return {
                        label: s.sourcedonnees,
                        value: s.sourcedonnees
                    };
                });
                console.log('Sources de données mappées:', this.sourcesDonnees);
            },
            error: (error) => {
                console.error("Erreur lors de l'initialisation des sources de données:", error);
            }
        });
    }

    /**
     * Charge toutes les données statistiques
     */
    chargerDonnees(): void {
        this.loading = true;

        this.statistiqueService.getResumeStatistiques().subscribe({
            next: (data) => {
                console.log('BranchementsComponent - Data received:', data);
                this.resume = data;
                this.statistiquesAmperage = data.statistiquesAmperage;
                this.statistiquesRegions = data.statistiquesRegions;
                this.statistiquesAgences = data.statistiquesAgences;

                console.log('BranchementsComponent - statistiquesAmperage assigned:', this.statistiquesAmperage);

                this.loading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Statistiques chargées avec succès'
                });
            },
            error: (error) => {
                console.error('Erreur lors du chargement des statistiques:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les statistiques'
                });
                this.loading = false;
            }
        });
    }

    /**
     * Applique tous les filtres actifs de manière combinée
     */
    private appliquerFiltres(): void {
        this.loading = true;

        // Extraire l'année et le mois de la date sélectionnée
        const annee = this.dateSelectionnee ? this.dateSelectionnee.getFullYear() : undefined;
        const mois = this.dateSelectionnee ? this.dateSelectionnee.getMonth() + 1 : undefined; // +1 car getMonth() retourne 0-11

        // Préparer les paramètres de filtrage
        const filtresAmperage = {
            annee: annee,
            mois: mois,
            departementIds: this.regionsSelectionnees.length > 0 ? this.regionsSelectionnees : undefined,
            agenceIds: this.agencesSelectionnees.length > 0 ? this.agencesSelectionnees : undefined,
            amperageIds: this.amperagesSelectionnes.length > 0 ? this.amperagesSelectionnes : undefined,
            phases: this.phasesSelectionnees.length > 0 ? this.phasesSelectionnees : undefined,
            typeBranchements: this.typesBranchementSelectionnes.length > 0 ? this.typesBranchementSelectionnes : undefined,
            sourceDonnees: this.sourcesSelectionnees.length > 0 ? this.sourcesSelectionnees : undefined
        };

        const filtresRegion = {
            annee: annee,
            mois: mois,
            departementIds: this.regionsSelectionnees.length > 0 ? this.regionsSelectionnees : undefined,
            agenceIds: this.agencesSelectionnees.length > 0 ? this.agencesSelectionnees : undefined,
            amperageIds: this.amperagesSelectionnes.length > 0 ? this.amperagesSelectionnes : undefined,
            phases: this.phasesSelectionnees.length > 0 ? this.phasesSelectionnees : undefined,
            typeBranchements: this.typesBranchementSelectionnes.length > 0 ? this.typesBranchementSelectionnes : undefined,
            sourceDonnees: this.sourcesSelectionnees.length > 0 ? this.sourcesSelectionnees : undefined
        };

        const filtresAgence = {
            annee: annee,
            mois: mois,
            departementIds: this.regionsSelectionnees.length > 0 ? this.regionsSelectionnees : undefined,
            agenceIds: this.agencesSelectionnees.length > 0 ? this.agencesSelectionnees : undefined,
            amperageIds: this.amperagesSelectionnes.length > 0 ? this.amperagesSelectionnes : undefined,
            phases: this.phasesSelectionnees.length > 0 ? this.phasesSelectionnees : undefined,
            typeBranchements: this.typesBranchementSelectionnes.length > 0 ? this.typesBranchementSelectionnes : undefined,
            sourceDonnees: this.sourcesSelectionnees.length > 0 ? this.sourcesSelectionnees : undefined
        };

        // Charger ampérages avec filtres
        this.statistiqueService.getStatistiquesParAmperageAvecFiltres(filtresAmperage).subscribe({
            next: (data) => {
                // Si des ampérages spécifiques sont sélectionnés, ne garder que ceux-ci
                if (this.amperagesSelectionnes.length > 0) {
                    this.statistiquesAmperage = data.filter((a) => this.amperagesSelectionnes.includes(a.amperageId));
                } else {
                    this.statistiquesAmperage = data;
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('Erreur ampérage:', error);
                this.loading = false;
            }
        });

        // Charger régions avec filtres
        this.statistiqueService.getStatistiquesParRegionAvecFiltres(filtresRegion).subscribe({
            next: (data) => {
                if (this.regionsSelectionnees.length > 0) {
                    this.statistiquesRegions = data.filter((r) => this.regionsSelectionnees.includes(r.departementId));
                } else {
                    this.statistiquesRegions = data;
                }
            },
            error: (error) => {
                console.error('Erreur régions:', error);
            }
        });

        // Charger agences avec filtres
        this.statistiqueService.getStatistiquesParAgenceAvecFiltres(filtresAgence).subscribe({
            next: (data) => {
                if (this.agencesSelectionnees.length > 0) {
                    this.statistiquesAgences = data.filter((a) => this.agencesSelectionnees.includes(a.agenceId));
                } else {
                    this.statistiquesAgences = data;
                }
            },
            error: (error) => {
                console.error('Erreur agences:', error);
            }
        });
    }

    /**
     * Filtrer par date (année et mois)
     */
    filtrerParDate(): void {
        if (!this.dateSelectionnee) {
            console.log('Aucune date sélectionnée');
            return;
        }

        // Valider que l'année de la date sélectionnée est disponible
        const anneeSelectionnee = this.dateSelectionnee.getFullYear();
        if (this.anneesDisponibles.length > 0 && !this.anneesDisponibles.includes(anneeSelectionnee)) {
            console.log(`Année ${anneeSelectionnee} non disponible. Années disponibles:`, this.anneesDisponibles);
            // Forcer la sélection de la première année disponible
            const premiereAnnee = Math.min(...this.anneesDisponibles);
            this.dateSelectionnee = new Date(premiereAnnee, this.dateSelectionnee.getMonth(), 1);
            console.log('Date corrigée vers:', this.dateSelectionnee);
        }

        // Réinitialiser les filtres dépendants
        this.regionsSelectionnees = [];
        this.agencesSelectionnees = [];
        this.amperagesSelectionnes = [];

        this.appliquerFiltres();
        this.gererDependancesFiltres();
    }

    /**
     * Gérer le changement d'année dans le calendrier
     */
    onYearChange(event: any): void {
        console.log('Changement d\'année détecté:', event);
        if (event && event.year) {
            const nouvelleAnnee = event.year;
            if (this.anneesDisponibles.length > 0 && !this.anneesDisponibles.includes(nouvelleAnnee)) {
                console.log(`Année ${nouvelleAnnee} non disponible. Années disponibles:`, this.anneesDisponibles);
                // Empêcher le changement vers une année non disponible
                const premiereAnnee = Math.min(...this.anneesDisponibles);
                if (this.dateSelectionnee) {
                    this.dateSelectionnee = new Date(premiereAnnee, this.dateSelectionnee.getMonth(), 1);
                } else {
                    this.dateSelectionnee = new Date(premiereAnnee, 0, 1);
                }
                console.log('Année corrigée vers:', premiereAnnee);
            }
        }
    }

    /**
     * Filtrer par région
     */
    filtrerParRegion(): void {
        // Réinitialiser les filtres dépendants
        this.agencesSelectionnees = [];
        this.amperagesSelectionnes = [];

        if (this.regionsSelectionnees.length === 0 && this.amperagesSelectionnes.length === 0 && this.phasesSelectionnees.length === 0 && this.typesBranchementSelectionnes.length === 0 && this.sourcesSelectionnees.length === 0 && !this.dateSelectionnee) {
            this.chargerDonnees();
            return;
        }

        this.appliquerFiltres();
        this.gererDependancesFiltres();
    }

    /**
     * Filtrer par agence
     */
    filtrerParAgence(): void {
        // Réinitialiser les filtres dépendants
        this.amperagesSelectionnes = [];

        if (this.agencesSelectionnees.length === 0 && this.regionsSelectionnees.length === 0 && this.amperagesSelectionnes.length === 0 && this.phasesSelectionnees.length === 0 && this.typesBranchementSelectionnes.length === 0 && this.sourcesSelectionnees.length === 0 && !this.dateSelectionnee) {
            this.chargerDonnees();
            return;
        }

        this.appliquerFiltres();
        this.gererDependancesFiltres();
    }

    /**
     * Filtrer par ampérage
     */
    filtrerParAmperage(): void {
        // Réinitialiser les filtres dépendants
        this.regionsSelectionnees = [];
        this.agencesSelectionnees = [];

        if (this.amperagesSelectionnes.length === 0 && this.regionsSelectionnees.length === 0 && this.agencesSelectionnees.length === 0 && this.phasesSelectionnees.length === 0 && this.typesBranchementSelectionnes.length === 0 && this.sourcesSelectionnees.length === 0 && !this.dateSelectionnee) {
            this.chargerDonnees();
            return;
        }

        this.appliquerFiltres();
        this.gererDependancesFiltres();
    }

    /**
     * Filtrer par phase
     */
    filtrerParPhase(): void {
        // Réinitialiser les filtres dépendants
        this.regionsSelectionnees = [];
        this.agencesSelectionnees = [];
        this.amperagesSelectionnes = [];

        if (this.phasesSelectionnees.length === 0 && this.regionsSelectionnees.length === 0 && this.agencesSelectionnees.length === 0 && this.amperagesSelectionnes.length === 0 && this.typesBranchementSelectionnes.length === 0 && this.sourcesSelectionnees.length === 0 && !this.dateSelectionnee) {
            this.chargerDonnees();
            return;
        }

        this.appliquerFiltres();
        this.gererDependancesFiltres();
    }

    /**
     * Filtrer par type de branchement
     */
    filtrerParTypeBranchement(): void {
        // Réinitialiser les filtres dépendants
        this.regionsSelectionnees = [];
        this.agencesSelectionnees = [];
        this.amperagesSelectionnes = [];

        if (this.typesBranchementSelectionnes.length === 0 && this.regionsSelectionnees.length === 0 && this.agencesSelectionnees.length === 0 && this.amperagesSelectionnes.length === 0 && this.phasesSelectionnees.length === 0 && this.sourcesSelectionnees.length === 0 && !this.dateSelectionnee) {
            this.chargerDonnees();
            return;
        }

        this.appliquerFiltres();
        this.gererDependancesFiltres();
    }

    /**
     * Filtrer par source de données
     */
    filtrerParSource(): void {
        // Réinitialiser les filtres dépendants
        this.regionsSelectionnees = [];
        this.agencesSelectionnees = [];
        this.amperagesSelectionnes = [];

        if (this.sourcesSelectionnees.length === 0 && this.regionsSelectionnees.length === 0 && this.agencesSelectionnees.length === 0 && this.amperagesSelectionnes.length === 0 && this.phasesSelectionnees.length === 0 && this.typesBranchementSelectionnes.length === 0 && !this.dateSelectionnee) {
            this.chargerDonnees();
            return;
        }

        this.appliquerFiltres();
        this.gererDependancesFiltres();
    }

    /**
     * Voir le détail d'une région
     */
    voirDetailRegion(region: StatistiqueRegion): void {
        // Ne pas ouvrir la modale si pas de détails d'ampérage
        if (!region.repartitionAmperages || region.repartitionAmperages.length === 0) {
            this.messageService.add({
                severity: 'info',
                summary: 'Information',
                detail: 'Détail non disponible en mode filtré. Réinitialisez les filtres pour voir les détails.'
            });
            return;
        }
        this.regionDetail = region;
        this.afficherDetailRegion = true;
    }

    /**
     * Fermer le détail
     */
    fermerDetail(): void {
        this.afficherDetailRegion = false;
        this.regionDetail = null;
    }

    /**
     * Réinitialise les filtres
     */
    reinitialiserFiltres(): void {
        this.dateSelectionnee = null;
        this.regionsSelectionnees = [];
        this.agencesSelectionnees = [];
        this.amperagesSelectionnes = [];
        this.phasesSelectionnees = [];
        this.typesBranchementSelectionnes = [];
        this.sourcesSelectionnees = [];
        this.regionDetail = null;
        this.afficherDetailRegion = false;

        // Réinitialiser les listes d'options
        this.regions = [];
        this.agences = [];
        this.amperages = [];
        this.phases = [];
        this.typesBranchement = [];
        this.sourcesDonnees = [];

        // Recharger les filtres disponibles et les données
        this.initialiserFiltresDisponibles();
        this.chargerDonnees();

        this.messageService.add({
            severity: 'info',
            summary: 'Filtres',
            detail: 'Filtres réinitialisés'
        });
    }

    /**
     * Gère les dépendances entre filtres (filtrage en cascade)
     */
    private gererDependancesFiltres(): void {
        // Extraire l'année et le mois de la date sélectionnée
        const annee = this.dateSelectionnee ? this.dateSelectionnee.getFullYear() : undefined;
        const mois = this.dateSelectionnee ? this.dateSelectionnee.getMonth() + 1 : undefined;

        // Construire les paramètres de filtrage actuels
        const filtresActuels = {
            annee: annee,
            mois: mois,
            departementIds: this.regionsSelectionnees.length > 0 ? this.regionsSelectionnees : undefined,
            agenceIds: this.agencesSelectionnees.length > 0 ? this.agencesSelectionnees : undefined,
            amperageIds: this.amperagesSelectionnes.length > 0 ? this.amperagesSelectionnes : undefined,
            phases: this.phasesSelectionnees.length > 0 ? this.phasesSelectionnees : undefined,
            typeBranchements: this.typesBranchementSelectionnes.length > 0 ? this.typesBranchementSelectionnes : undefined,
            sourceDonnees: this.sourcesSelectionnees.length > 0 ? this.sourcesSelectionnees : undefined
        };

        // Mettre à jour tous les filtres disponibles
        this.mettreAJourRegionsDisponibles(filtresActuels);
        this.mettreAJourAgencesDisponibles(filtresActuels);
        this.mettreAJourAmperagesDisponibles(filtresActuels);
        this.mettreAJourPhasesDisponibles(filtresActuels);
        this.mettreAJourTypesBranchementDisponibles(filtresActuels);
        this.mettreAJourSourcesDonneesDisponibles(filtresActuels);
    }


    /**
     * Met à jour les régions disponibles selon les filtres
     */
    private mettreAJourRegionsDisponibles(filtres: any): void {
        this.statistiqueService
            .getRegionsDisponibles({
                annee: filtres.annee,
                mois: filtres.mois,
                amperageIds: filtres.amperageIds,
                phases: filtres.phases,
                typeBranchements: filtres.typeBranchements,
                sourceDonnees: filtres.sourceDonnees
            })
            .subscribe({
                next: (regions) => {
                    this.regions = regions.map((r) => ({
                        label: r.nomdepartement,
                        value: r.departementid
                    }));

                    // Filtrer les régions sélectionnées qui ne sont plus disponibles
                    this.regionsSelectionnees = this.regionsSelectionnees.filter(id => 
                        regions.some((r) => r.departementid === id)
                    );
                    
                    // Si aucune région n'est plus disponible, réinitialiser aussi les agences
                },
                error: (error) => {
                    console.error('Erreur lors du chargement des régions:', error);
                }
            });
    }

    /**
     * Met à jour les agences disponibles selon les filtres
     */
    private mettreAJourAgencesDisponibles(filtres: any): void {
        this.statistiqueService
            .getAgencesDisponibles({
                annee: filtres.annee,
                mois: filtres.mois,
                departementIds: filtres.departementIds,
                amperageIds: filtres.amperageIds,
                phases: filtres.phases,
                typeBranchements: filtres.typeBranchements,
                sourceDonnees: filtres.sourceDonnees
            })
            .subscribe({
                next: (agences) => {
                    this.agences = agences.map((a) => ({
                        label: a.nomagence,
                        value: a.agenceid
                    }));

                    // Filtrer les agences sélectionnées qui ne sont plus disponibles
                    this.agencesSelectionnees = this.agencesSelectionnees.filter(id => 
                        agences.some((a) => a.agenceid === id)
                    );
                },
                error: (error) => {
                    console.error('Erreur lors du chargement des agences:', error);
                }
            });
    }

    /**
     * Met à jour les ampérages disponibles selon les filtres
     */
    private mettreAJourAmperagesDisponibles(filtres: any): void {
        this.statistiqueService
            .getAmperagesDisponibles({
                annee: filtres.annee,
                mois: filtres.mois,
                departementIds: filtres.departementIds,
                agenceIds: filtres.agenceIds,
                phases: filtres.phases,
                typeBranchements: filtres.typeBranchements,
                sourceDonnees: filtres.sourceDonnees
            })
            .subscribe({
                next: (amperages) => {
                    this.amperages = amperages.map((a) => ({
                        label: a.libelleamperage,
                        value: a.amperageid
                    }));

                    // Filtrer les ampérages sélectionnés qui ne sont plus disponibles
                    this.amperagesSelectionnes = this.amperagesSelectionnes.filter(id => 
                        amperages.some((a) => a.amperageid === id)
                    );
                },
                error: (error) => {
                    console.error('Erreur lors du chargement des ampérages:', error);
                }
            });
    }

    /**
     * Met à jour les phases disponibles selon les filtres
     */
    private mettreAJourPhasesDisponibles(filtres: any): void {
        this.statistiqueService
            .getPhasesDisponibles({
                annee: filtres.annee,
                mois: filtres.mois,
                departementIds: filtres.departementIds,
                agenceIds: filtres.agenceIds,
                amperageIds: filtres.amperageIds,
                typeBranchements: filtres.typeBranchements,
                sourceDonnees: filtres.sourceDonnees
            })
            .subscribe({
                next: (phases) => {
                    this.phases = phases.map((p) => ({
                        label: p.phase,
                        value: p.phase
                    }));

                    // Filtrer les phases sélectionnées qui ne sont plus disponibles
                    this.phasesSelectionnees = this.phasesSelectionnees.filter(phase => 
                        phases.some((p) => p.phase === phase)
                    );
                },
                error: (error) => {
                    console.error('Erreur lors du chargement des phases:', error);
                }
            });
    }

    /**
     * Met à jour les types de branchement disponibles selon les filtres
     */
    private mettreAJourTypesBranchementDisponibles(filtres: any): void {
        this.statistiqueService
            .getTypesBranchementDisponibles({
                annee: filtres.annee,
                mois: filtres.mois,
                departementIds: filtres.departementIds,
                agenceIds: filtres.agenceIds,
                amperageIds: filtres.amperageIds,
                phases: filtres.phases,
                sourceDonnees: filtres.sourceDonnees
            })
            .subscribe({
                next: (typesBranchement) => {
                    this.typesBranchement = typesBranchement.map((t) => ({
                        label: t.typebranchement,
                        value: t.typebranchement
                    }));

                    // Filtrer les types de branchement sélectionnés qui ne sont plus disponibles
                    this.typesBranchementSelectionnes = this.typesBranchementSelectionnes.filter(type => 
                        typesBranchement.some((t) => t.typebranchement === type)
                    );
                },
                error: (error) => {
                    console.error('Erreur lors du chargement des types de branchement:', error);
                }
            });
    }

    /**
     * Met à jour les sources de données disponibles selon les filtres
     */
    private mettreAJourSourcesDonneesDisponibles(filtres: any): void {
        this.statistiqueService
            .getSourcesDonneesDisponibles({
                annee: filtres.annee,
                mois: filtres.mois,
                departementIds: filtres.departementIds,
                agenceIds: filtres.agenceIds,
                amperageIds: filtres.amperageIds,
                phases: filtres.phases,
                typeBranchements: filtres.typeBranchements
            })
            .subscribe({
                next: (sourcesDonnees) => {
                    this.sourcesDonnees = sourcesDonnees.map((s) => ({
                        label: s.sourcedonnees,
                        value: s.sourcedonnees
                    }));

                    // Filtrer les sources sélectionnées qui ne sont plus disponibles
                    this.sourcesSelectionnees = this.sourcesSelectionnees.filter(source => 
                        sourcesDonnees.some((s) => s.sourcedonnees === source)
                    );
                },
                error: (error) => {
                    console.error('Erreur lors du chargement des sources de données:', error);
                }
            });
    }

    /**
     * Exporte les données
     */
    exporterDonnees(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Export',
            detail: "Fonctionnalité d'export en cours de développement"
        });
    }
}
