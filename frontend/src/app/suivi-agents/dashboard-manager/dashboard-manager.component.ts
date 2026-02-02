import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { SessionTravailService } from '../../../services/session-travail.service';
import { PositionGpsService } from '../../../services/position-gps.service';
import { StatutService } from '../../../services/statut.service';
import { SessionTravail, calculerDureeSession, estSessionEnCours, formaterDuree } from '../../../models/session-travail.model';
import { Statut } from '../../../models/statut.model';
import { forkJoin, interval, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-dashboard-manager',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        CardModule,
        TableModule,
        ButtonModule,
        BadgeModule,
        ProgressSpinnerModule,
        CalendarModule,
        DropdownModule,
        TooltipModule
    ],
    templateUrl: './dashboard-manager.component.html',
    styleUrls: ['./dashboard-manager.component.scss']
})
export class DashboardManagerComponent implements OnInit, OnDestroy {
    loading = false;
    sessions: SessionTravail[] = [];
    sessionsFiltrees: SessionTravail[] = []; // Sessions après application des filtres
    statuts: Statut[] = [];
    agents: { id: number; nom: string; prenoms: string; fullName: string }[] = [];
    
    // Filtres
    dateDebut?: Date;
    dateFin?: Date;
    statutFiltre?: Statut;
    agentFiltre?: { id: number; nom: string; prenoms: string; fullName: string };
    
    // Statistiques
    nombreAgentsActifs = 0;
    nombreSessionsAujourdhui = 0;
    heuresTotalesTravaillees = 0;
    sessionsNonSynchronisees = 0;
    
    // Auto-refresh
    private refreshSubscription?: Subscription;
    autoRefreshEnabled = true;
    refreshInterval = 30000; // 30 secondes

    constructor(
        private sessionTravailService: SessionTravailService,
        private positionGpsService: PositionGpsService,
        private statutService: StatutService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.chargerDonnees();
        this.demarrerAutoRefresh();
    }

    ngOnDestroy(): void {
        this.arreterAutoRefresh();
    }

    chargerDonnees(): void {
        this.loading = true;
        
        forkJoin({
            sessions: this.sessionTravailService.getHistoriqueSessions(),
            statuts: this.statutService.getAllStatuts()
        })
        .pipe(
            finalize(() => {
                this.loading = false;
                this.cdr.markForCheck();
            })
        )
        .subscribe({
            next: (data) => {
                console.log('Données reçues:', data);
                console.log('Nombre de sessions:', data.sessions?.length || 0);
                this.sessions = data.sessions || [];
                this.statuts = data.statuts || [];
                this.chargerAgents();
                this.appliquerFiltres();
            },
            error: (error) => {
                console.error('Erreur lors du chargement des données:', error);
                console.error('Détails de l\'erreur:', error.error || error.message || error);
                this.sessions = [];
                this.statuts = [];
            }
        });
    }

    private convertirDateEnDate(dateValue: string | number[] | undefined | null): Date | null {
        if (!dateValue) {
            return null;
        }

        if (Array.isArray(dateValue)) {
            if (dateValue.length < 3) {
                return null;
            }
            const [annee, mois, jour, heure = 0, minute = 0, seconde = 0] = dateValue;
            return new Date(annee, mois - 1, jour, heure, minute, seconde);
        } else if (typeof dateValue === 'string') {
            return new Date(dateValue);
        }
        return null;
    }

    chargerAgents(): void {
        const agentsMap = new Map<number, { id: number; nom: string; prenoms: string; fullName: string }>();
        
        this.sessions.forEach(session => {
            if (session.utilisateur && !agentsMap.has(session.utilisateur.id)) {
                const nomComplet = `${session.utilisateur.prenoms || ''} ${session.utilisateur.nom || ''}`.trim();
                agentsMap.set(session.utilisateur.id, {
                    id: session.utilisateur.id,
                    nom: session.utilisateur.nom || '',
                    prenoms: session.utilisateur.prenoms || '',
                    fullName: nomComplet || 'Utilisateur inconnu'
                });
            }
        });
        
        this.agents = Array.from(agentsMap.values()).sort((a, b) => 
            a.fullName.localeCompare(b.fullName)
        );
    }

    calculerStatistiques(): void {
        // Utiliser les sessions filtrées pour les statistiques
        const sessionsPourStats = this.sessionsFiltrees.length > 0 ? this.sessionsFiltrees : this.sessions;
        
        // Nombre d'agents actifs (sessions en cours)
        this.nombreAgentsActifs = sessionsPourStats.filter(s => estSessionEnCours(s)).length;
        
        // Nombre de sessions aujourd'hui
        const aujourdhui = new Date();
        aujourdhui.setHours(0, 0, 0, 0);
        this.nombreSessionsAujourdhui = sessionsPourStats.filter(session => {
            if (!session.heureDebut) return false;
            const dateDebut = this.convertirDateEnDate(session.heureDebut);
            return dateDebut !== null && !isNaN(dateDebut.getTime()) && dateDebut >= aujourdhui;
        }).length;
        
        // Heures totales travaillées (sessions terminées)
        const sessionsTerminees = sessionsPourStats.filter(s => !estSessionEnCours(s));
        let totalSecondes = 0;
        sessionsTerminees.forEach(session => {
            if (session.heureDebut && session.heureFin) {
                const debut = this.convertirDateEnDate(session.heureDebut);
                const fin = this.convertirDateEnDate(session.heureFin);
                if (debut !== null && fin !== null && !isNaN(debut.getTime()) && !isNaN(fin.getTime())) {
                    const dureeMs = fin.getTime() - debut.getTime();
                    if (dureeMs > 0) {
                        totalSecondes += Math.floor(dureeMs / 1000);
                    }
                }
            }
        });
        this.heuresTotalesTravaillees = totalSecondes; // Stocker en secondes pour le formatage
        
        // Sessions non synchronisées
        this.sessionsNonSynchronisees = sessionsPourStats.filter(s => !s.synchronise).length;
    }
    
    formaterHeuresTravailees(): string {
        const heures = Math.floor(this.heuresTotalesTravaillees / 3600);
        const minutes = Math.floor((this.heuresTotalesTravaillees % 3600) / 60);
        const secondes = this.heuresTotalesTravaillees % 60;
        
        if (heures > 0) {
            return `${heures}h ${minutes}mn ${secondes}s`;
        } else if (minutes > 0) {
            return `${minutes}mn ${secondes}s`;
        } else {
            return `${secondes}s`;
        }
    }

    getStatutBadgeSeverity(session: SessionTravail): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        if (estSessionEnCours(session)) {
            return 'success';
        }
        if (!session.synchronise) {
            return 'warn';
        }
        return 'info';
    }

    getStatutBadgeLabel(session: SessionTravail): string {
        if (estSessionEnCours(session)) {
            return 'En cours';
        }
        if (!session.synchronise) {
            return 'Non synchronisé';
        }
        return 'Terminé';
    }

    formaterDureeSession(session: SessionTravail): string {
        if (!session.heureDebut) {
            return '-';
        }
        
        const debut = this.convertirDateEnDate(session.heureDebut);
        if (!debut || isNaN(debut.getTime())) {
            return '-';
        }
        
        let fin: Date;
        if (session.heureFin) {
            const finConvertie = this.convertirDateEnDate(session.heureFin);
            if (!finConvertie || isNaN(finConvertie.getTime())) {
                return '-';
            }
            fin = finConvertie;
        } else {
            fin = new Date(); // Session en cours
        }
        
        const dureeMs = fin.getTime() - debut.getTime();
        if (dureeMs < 0) {
            return '-';
        }
        
        const totalSecondes = Math.floor(dureeMs / 1000);
        const heures = Math.floor(totalSecondes / 3600);
        const minutes = Math.floor((totalSecondes % 3600) / 60);
        const secondes = totalSecondes % 60;
        
        if (heures > 0) {
            return `${heures}h ${minutes}mn ${secondes}s`;
        } else if (minutes > 0) {
            return `${minutes}mn ${secondes}s`;
        } else {
            return `${secondes}s`;
        }
    }

    formaterDate(dateValue: string | number[] | undefined | null): string {
        if (!dateValue) {
            return '-';
        }

        let date: Date;
        
        // Si c'est un tableau (format LocalDateTime de Spring Boot: [année, mois-1, jour, heure, minute, seconde, nanoseconde])
        if (Array.isArray(dateValue)) {
            if (dateValue.length < 3) {
                return '-';
            }
            // Format: [année, mois-1, jour, heure, minute, seconde, nanoseconde]
            const [annee, mois, jour, heure = 0, minute = 0, seconde = 0] = dateValue;
            date = new Date(annee, mois - 1, jour, heure, minute, seconde);
        } else if (typeof dateValue === 'string') {
            // Si c'est une chaîne ISO
            date = new Date(dateValue);
        } else {
            return '-';
        }

        if (isNaN(date.getTime())) {
            return '-';
        }

        const jourFormate = date.getDate().toString().padStart(2, '0');
        const moisFormate = (date.getMonth() + 1).toString().padStart(2, '0');
        const anneeFormatee = date.getFullYear();
        const heuresFormatees = date.getHours().toString().padStart(2, '0');
        const minutesFormatees = date.getMinutes().toString().padStart(2, '0');
        const secondesFormatees = date.getSeconds().toString().padStart(2, '0');
        return `${jourFormate}/${moisFormate}/${anneeFormatee} ${heuresFormatees}:${minutesFormatees}:${secondesFormatees}`;
    }

    getNomUtilisateur(session: SessionTravail): string {
        if (session.utilisateur) {
            return `${session.utilisateur.prenoms || ''} ${session.utilisateur.nom || ''}`.trim();
        }
        return 'Utilisateur inconnu';
    }

    appliquerFiltres(): void {
        let sessionsFiltrees = [...this.sessions];

        // Filtre par agent
        if (this.agentFiltre) {
            sessionsFiltrees = sessionsFiltrees.filter(session => 
                session.utilisateur && session.utilisateur.id === this.agentFiltre!.id
            );
        }

        // Filtre par date de début
        if (this.dateDebut) {
            const dateDebut = new Date(this.dateDebut);
            dateDebut.setHours(0, 0, 0, 0);
            sessionsFiltrees = sessionsFiltrees.filter(session => {
                if (!session.heureDebut) return false;
                const dateDebutSession = this.convertirDateEnDate(session.heureDebut);
                return dateDebutSession !== null && !isNaN(dateDebutSession.getTime()) && dateDebutSession >= dateDebut;
            });
        }

        // Filtre par date de fin
        if (this.dateFin) {
            const dateFin = new Date(this.dateFin);
            dateFin.setHours(23, 59, 59, 999);
            sessionsFiltrees = sessionsFiltrees.filter(session => {
                if (!session.heureDebut) return false;
                const dateDebutSession = this.convertirDateEnDate(session.heureDebut);
                return dateDebutSession !== null && !isNaN(dateDebutSession.getTime()) && dateDebutSession <= dateFin;
            });
        }

        // Filtre par statut
        if (this.statutFiltre) {
            // Le filtre par statut dépend de la logique métier
            // Pour l'instant, on peut filtrer par synchronisé/non synchronisé
            if (this.statutFiltre.libelle?.toLowerCase().includes('synchron')) {
                sessionsFiltrees = sessionsFiltrees.filter(s => s.synchronise);
            } else if (this.statutFiltre.libelle?.toLowerCase().includes('non synchron')) {
                sessionsFiltrees = sessionsFiltrees.filter(s => !s.synchronise);
            }
        }

        this.sessionsFiltrees = sessionsFiltrees;
        this.calculerStatistiques();
    }

    reinitialiserFiltres(): void {
        this.dateDebut = undefined;
        this.dateFin = undefined;
        this.statutFiltre = undefined;
        this.agentFiltre = undefined;
        this.sessionsFiltrees = [];
        this.calculerStatistiques();
    }

    demarrerAutoRefresh(): void {
        if (this.autoRefreshEnabled) {
            this.refreshSubscription = interval(this.refreshInterval).subscribe(() => {
                this.chargerDonnees();
            });
        }
    }

    arreterAutoRefresh(): void {
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
    }

    toggleAutoRefresh(): void {
        this.autoRefreshEnabled = !this.autoRefreshEnabled;
        if (this.autoRefreshEnabled) {
            this.demarrerAutoRefresh();
        } else {
            this.arreterAutoRefresh();
        }
    }

    rafraichir(): void {
        this.chargerDonnees();
    }
}
