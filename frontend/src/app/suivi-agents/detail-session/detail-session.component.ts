import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SessionTravailService } from '../../../services/session-travail.service';
import { PositionGpsService } from '../../../services/position-gps.service';
import { StatutService } from '../../../services/statut.service';
import { SessionTravail, calculerDureeSession, formaterDuree } from '../../../models/session-travail.model';
import { PositionGps } from '../../../models/position-gps.model';
import { ChangementStatut } from '../../../models/changement-statut.model';

@Component({
    selector: 'app-detail-session',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        CardModule,
        TableModule,
        ButtonModule,
        BadgeModule,
        ProgressSpinnerModule
    ],
    templateUrl: './detail-session.component.html',
    styleUrls: ['./detail-session.component.scss']
})
export class DetailSessionComponent implements OnInit {
    sessionId!: number;
    session?: SessionTravail;
    positions: PositionGps[] = [];
    changementsStatut: ChangementStatut[] = [];
    loading = false;
    distanceTotale = 0;

    constructor(
        private route: ActivatedRoute,
        private sessionTravailService: SessionTravailService,
        private positionGpsService: PositionGpsService,
        private statutService: StatutService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.sessionId = +params['id'];
            this.chargerDonnees();
        });
    }

    chargerDonnees(): void {
        this.loading = true;
        
        this.sessionTravailService.getSessionById(this.sessionId).subscribe({
            next: (session) => {
                this.session = session;
                this.chargerPositions();
                this.chargerChangementsStatut();
            },
            error: (error) => {
                console.error('Erreur lors du chargement de la session:', error);
                this.loading = false;
            }
        });
    }

    chargerPositions(): void {
        this.positionGpsService.getPositionsAvecDistance(this.sessionId).subscribe({
            next: (data) => {
                this.positions = data.positions;
                this.distanceTotale = data.distance;
                this.loading = false;
            },
            error: (error) => {
                console.error('Erreur lors du chargement des positions:', error);
                this.loading = false;
            }
        });
    }

    chargerChangementsStatut(): void {
        this.statutService.getChangementsParSession(this.sessionId).subscribe({
            next: (changements) => {
                this.changementsStatut = changements;
            },
            error: (error) => {
                console.error('Erreur lors du chargement des changements de statut:', error);
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

    formaterDuree(): string {
        if (this.session) {
            return formaterDuree(calculerDureeSession(this.session));
        }
        return '-';
    }

    getNomUtilisateur(): string {
        if (this.session?.utilisateur) {
            return `${this.session.utilisateur.prenoms || ''} ${this.session.utilisateur.nom || ''}`.trim();
        }
        return 'Utilisateur inconnu';
    }
}
