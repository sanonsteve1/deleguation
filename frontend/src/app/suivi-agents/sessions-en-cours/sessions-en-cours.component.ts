import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { SessionTravailService } from '../../../services/session-travail.service';
import { SessionTravail, estSessionEnCours } from '../../../models/session-travail.model';
import { forkJoin, interval, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-sessions-en-cours',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        CardModule,
        TableModule,
        ButtonModule,
        BadgeModule,
        ProgressSpinnerModule,
        TooltipModule
    ],
    templateUrl: './sessions-en-cours.component.html',
    styleUrls: ['./sessions-en-cours.component.scss']
})
export class SessionsEnCoursComponent implements OnInit, OnDestroy {
    loading = false;
    sessions: SessionTravail[] = [];
    sessionsEnCours: SessionTravail[] = [];
    
    // Auto-refresh
    private refreshSubscription?: Subscription;
    autoRefreshEnabled = true;
    refreshInterval = 30000; // 30 secondes

    constructor(
        private sessionTravailService: SessionTravailService,
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
        
        this.sessionTravailService.getHistoriqueSessions()
        .pipe(
            finalize(() => {
                this.loading = false;
                this.cdr.markForCheck();
            })
        )
        .subscribe({
            next: (sessions) => {
                console.log('Sessions reçues:', sessions);
                console.log('Nombre de sessions:', sessions?.length || 0);
                this.sessions = sessions || [];
                this.filtrerSessionsEnCours();
            },
            error: (error) => {
                console.error('Erreur lors du chargement des sessions:', error);
                this.sessions = [];
                this.sessionsEnCours = [];
            }
        });
    }

    filtrerSessionsEnCours(): void {
        this.sessionsEnCours = this.sessions.filter(session => estSessionEnCours(session));
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
        
        const fin = new Date(); // Session en cours
        
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

    formaterDate(dateValue: string | number[] | undefined | null): string {
        if (!dateValue) {
            return '-';
        }

        const date = this.convertirDateEnDate(dateValue);
        if (!date || isNaN(date.getTime())) {
            return '-';
        }

        const jour = date.getDate().toString().padStart(2, '0');
        const mois = (date.getMonth() + 1).toString().padStart(2, '0');
        const annee = date.getFullYear();
        const heures = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const secondes = date.getSeconds().toString().padStart(2, '0');
        return `${jour}/${mois}/${annee} ${heures}:${minutes}:${secondes}`;
    }

    getNomUtilisateur(session: SessionTravail): string {
        if (session.utilisateur) {
            return `${session.utilisateur.prenoms || ''} ${session.utilisateur.nom || ''}`.trim();
        }
        return 'Utilisateur inconnu';
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
}
