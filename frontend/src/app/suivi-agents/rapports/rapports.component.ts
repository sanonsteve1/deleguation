import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import * as XLSX from 'xlsx';
import { SessionTravailService } from '../../../services/session-travail.service';
import { PositionGpsService } from '../../../services/position-gps.service';
import { StatutService } from '../../../services/statut.service';
import { SessionTravail, calculerDureeSession, estSessionEnCours } from '../../../models/session-travail.model';
import { PositionGps } from '../../../models/position-gps.model';
import { ChangementStatut } from '../../../models/changement-statut.model';
import { Utilisateur } from '../../../models/utilisateur.model';
import { forkJoin } from 'rxjs';

interface StatistiqueAgent {
    agent: Utilisateur;
    nombreSessions: number;
    heuresTravailles: number;
    distanceTotale: number;
    nombreChangementsStatut: number;
}

interface StatistiquePeriode {
    date: string;
    nombreSessions: number;
    heuresTravailles: number;
    nombreAgents: number;
}

@Component({
    selector: 'app-rapports',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        TableModule,
        ButtonModule,
        CalendarModule,
        DropdownModule,
        ChartModule,
        ProgressSpinnerModule,
        TooltipModule,
        ToastModule
    ],
    providers: [MessageService],
    templateUrl: './rapports.component.html',
    styleUrls: ['./rapports.component.scss']
})
export class RapportsComponent implements OnInit {
    loading = false;
    sessions: SessionTravail[] = [];
    agents: { id: number; nom: string; prenoms: string; fullName: string }[] = [];
    
    // Filtres
    selectedAgent?: { id: number; nom: string; prenoms: string; fullName: string };
    dateDebut?: Date;
    dateFin?: Date;
    periode: 'jour' | 'semaine' | 'mois' = 'semaine';
    
    // Statistiques
    statistiquesAgents: StatistiqueAgent[] = [];
    statistiquesPeriode: StatistiquePeriode[] = [];
    
    // Graphiques
    chartHeures: any;
    chartStatuts: any;
    chartEvolution: any;
    
    // Options des graphiques
    chartOptions: any;

    constructor(
        private sessionTravailService: SessionTravailService,
        private positionGpsService: PositionGpsService,
        private statutService: StatutService,
        private messageService: MessageService
    ) {
        this.initChartOptions();
    }

    ngOnInit(): void {
        this.chargerAgents();
        this.chargerDonnees();
    }

    initChartOptions(): void {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder
                    }
                }
            }
        };
    }

    chargerAgents(): void {
        this.sessionTravailService.getHistoriqueSessions().subscribe({
            next: (sessions) => {
                const agentsMap = new Map<number, { id: number; nom: string; prenoms: string; fullName: string }>();
                
                sessions.forEach(session => {
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
            },
            error: (error) => {
                console.error('Erreur lors du chargement des agents:', error);
            }
        });
    }

    chargerDonnees(): void {
        this.loading = true;
        
        this.sessionTravailService.getHistoriqueSessions().subscribe({
            next: (sessions) => {
                console.log('Sessions reçues (rapports):', sessions);
                console.log('Nombre de sessions:', sessions?.length || 0);
                // Appliquer les filtres côté client
                this.sessions = this.filtrerSessions(sessions);
                this.calculerStatistiques();
                this.loading = false;
            },
            error: (error) => {
                console.error('Erreur lors du chargement des données:', error);
                this.loading = false;
            }
        });
    }

    private filtrerSessions(sessions: SessionTravail[]): SessionTravail[] {
        let resultat = [...sessions];

        // Filtre par agent
        if (this.selectedAgent) {
            resultat = resultat.filter(session => 
                session.utilisateur && session.utilisateur.id === this.selectedAgent!.id
            );
        }

        // Filtre par dates
        if (this.dateDebut || this.dateFin) {
            resultat = resultat.filter(session => {
                const dateDebutSession = this.convertirDateEnDate(session.heureDebut);
                if (!dateDebutSession) return false;
                
                if (this.dateDebut) {
                    const debut = new Date(this.dateDebut);
                    debut.setHours(0, 0, 0, 0);
                    if (dateDebutSession < debut) return false;
                }
                
                if (this.dateFin) {
                    const fin = new Date(this.dateFin);
                    fin.setHours(23, 59, 59, 999);
                    if (dateDebutSession > fin) return false;
                }
                
                return true;
            });
        }

        return resultat;
    }

    calculerStatistiques(): void {
        this.calculerStatistiquesParPeriode();
        this.calculerStatistiquesParAgent(); // Cette méthode appelle mettreAJourGraphiques() à la fin
    }

    calculerStatistiquesParAgent(): void {
        const statsMap = new Map<number, StatistiqueAgent>();

        // Initialiser les statistiques par agent
        this.sessions.forEach(session => {
            if (!session.utilisateur) return;

            const agentId = session.utilisateur.id;
            
            if (!statsMap.has(agentId)) {
                statsMap.set(agentId, {
                    agent: session.utilisateur,
                    nombreSessions: 0,
                    heuresTravailles: 0,
                    distanceTotale: 0,
                    nombreChangementsStatut: 0
                });
            }

            const stats = statsMap.get(agentId)!;
            stats.nombreSessions++;

            // Calculer les heures travaillées
            if (!estSessionEnCours(session)) {
                const duree = calculerDureeSession(session);
                stats.heuresTravailles += duree;
            }
        });

        // Charger toutes les positions et changements de statut en parallèle
        if (this.sessions.length > 0) {
            const positionsObservables = this.sessions.map(session => 
                this.positionGpsService.getPositionsParSession(session.id)
            );
            const statutsObservables = this.sessions.map(session => 
                this.statutService.getChangementsParSession(session.id)
            );

            forkJoin([
                forkJoin(positionsObservables),
                forkJoin(statutsObservables)
            ]).subscribe({
                next: ([positionsArray, statutsArray]) => {
                    // Calculer les distances
                    positionsArray.forEach((positions, index) => {
                        const session = this.sessions[index];
                        if (!session.utilisateur) return;

                        const agentId = session.utilisateur.id;
                        const stats = statsMap.get(agentId);
                        if (!stats) return;

                        if (positions.length > 1) {
                            let distance = 0;
                            for (let i = 1; i < positions.length; i++) {
                                distance += this.calculerDistance(
                                    positions[i - 1].latitude,
                                    positions[i - 1].longitude,
                                    positions[i].latitude,
                                    positions[i].longitude
                                );
                            }
                            stats.distanceTotale += distance;
                        }
                    });

                    // Ajouter les changements de statut
                    statutsArray.forEach((changements, index) => {
                        const session = this.sessions[index];
                        if (!session.utilisateur) return;

                        const agentId = session.utilisateur.id;
                        const stats = statsMap.get(agentId);
                        if (!stats) return;

                        stats.nombreChangementsStatut += changements.length;
                    });

                    this.statistiquesAgents = Array.from(statsMap.values());
                    this.mettreAJourGraphiques();
                },
                error: (error) => {
                    console.error('Erreur lors du calcul des statistiques:', error);
                    this.statistiquesAgents = Array.from(statsMap.values());
                    this.mettreAJourGraphiques();
                }
            });
        } else {
            this.statistiquesAgents = Array.from(statsMap.values());
            this.mettreAJourGraphiques();
        }
    }

    calculerStatistiquesParPeriode(): void {
        const statsMap = new Map<string, StatistiquePeriode>();
        const agentsSet = new Set<number>();

        this.sessions.forEach(session => {
            const dateDebut = this.convertirDateEnDate(session.heureDebut);
            if (!dateDebut) return;

            let dateCle: string;
            
            if (this.periode === 'jour') {
                dateCle = dateDebut.toISOString().split('T')[0];
            } else if (this.periode === 'semaine') {
                const semaine = this.getSemaine(dateDebut);
                dateCle = `${semaine.annee}-S${semaine.semaine}`;
            } else {
                dateCle = `${dateDebut.getFullYear()}-${String(dateDebut.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!statsMap.has(dateCle)) {
                statsMap.set(dateCle, {
                    date: dateCle,
                    nombreSessions: 0,
                    heuresTravailles: 0,
                    nombreAgents: 0
                });
            }

            const stats = statsMap.get(dateCle)!;
            stats.nombreSessions++;
            
            if (!estSessionEnCours(session)) {
                const duree = calculerDureeSession(session);
                stats.heuresTravailles += duree;
            }

            if (session.utilisateur) {
                agentsSet.add(session.utilisateur.id);
            }
        });

        statsMap.forEach(stat => {
            stat.nombreAgents = agentsSet.size;
        });

        this.statistiquesPeriode = Array.from(statsMap.values()).sort((a, b) => 
            a.date.localeCompare(b.date)
        );
    }

    mettreAJourGraphiques(): void {
        this.mettreAJourGraphiqueHeures();
        this.mettreAJourGraphiqueEvolution();
    }

    mettreAJourGraphiqueHeures(): void {
        const labels = this.statistiquesAgents.map(s => 
            `${s.agent.prenoms || ''} ${s.agent.nom || ''}`.trim()
        );
        const heures = this.statistiquesAgents.map(s => s.heuresTravailles);

        this.chartHeures = {
            labels: labels,
            datasets: [
                {
                    label: 'Heures travaillées',
                    data: heures,
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(118, 75, 162, 0.8)',
                        'rgba(17, 153, 142, 0.8)',
                        'rgba(245, 87, 108, 0.8)',
                        'rgba(51, 245, 255, 0.8)'
                    ]
                }
            ]
        };
    }

    mettreAJourGraphiqueEvolution(): void {
        const labels = this.statistiquesPeriode.map(s => s.date);
        const heures = this.statistiquesPeriode.map(s => s.heuresTravailles);
        const sessions = this.statistiquesPeriode.map(s => s.nombreSessions);

        this.chartEvolution = {
            labels: labels,
            datasets: [
                {
                    label: 'Heures travaillées',
                    data: heures,
                    fill: false,
                    borderColor: 'rgb(102, 126, 234)',
                    tension: 0.4
                },
                {
                    label: 'Nombre de sessions',
                    data: sessions,
                    fill: false,
                    borderColor: 'rgb(118, 75, 162)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        };
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

    private getSemaine(date: Date): { annee: number; semaine: number } {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return {
            annee: d.getUTCFullYear(),
            semaine: Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
        };
    }

    private calculerDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Rayon de la Terre en km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    formaterHeures(heures: number): string {
        const h = Math.floor(heures);
        const m = Math.floor((heures - h) * 60);
        return `${h}h ${m}min`;
    }

    formaterDistance(km: number): string {
        if (km < 1) {
            return `${Math.round(km * 1000)}m`;
        }
        return `${km.toFixed(2)} km`;
    }

    appliquerFiltres(): void {
        this.chargerDonnees();
    }

    reinitialiserFiltres(): void {
        this.selectedAgent = undefined;
        this.dateDebut = undefined;
        this.dateFin = undefined;
        this.periode = 'semaine';
        this.chargerDonnees();
    }

    exporterExcel(): void {
        try {
            // Préparer les données pour l'export
            const data = this.statistiquesAgents.map(stat => ({
                'Agent': `${stat.agent.prenoms || ''} ${stat.agent.nom || ''}`.trim(),
                'Nombre de Sessions': stat.nombreSessions,
                'Heures Travaillées': this.formaterHeures(stat.heuresTravailles),
                'Distance Parcourue (km)': stat.distanceTotale.toFixed(2),
                'Changements de Statut': stat.nombreChangementsStatut
            }));

            // Créer un workbook
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Statistiques');

            // Ajouter un sheet avec les données par période
            const dataPeriode = this.statistiquesPeriode.map(stat => ({
                'Période': stat.date,
                'Nombre de Sessions': stat.nombreSessions,
                'Heures Travaillées': this.formaterHeures(stat.heuresTravailles),
                'Nombre d\'Agents': stat.nombreAgents
            }));

            if (dataPeriode.length > 0) {
                const wsPeriode = XLSX.utils.json_to_sheet(dataPeriode);
                XLSX.utils.book_append_sheet(wb, wsPeriode, 'Statistiques par Période');
            }

            // Générer le nom du fichier avec la date
            const dateStr = new Date().toISOString().split('T')[0];
            const fileName = `Rapport_Sessions_${dateStr}.xlsx`;

            // Télécharger le fichier
            XLSX.writeFile(wb, fileName);
            
            this.messageService.add({
                severity: 'success',
                summary: 'Export réussi',
                detail: 'Le fichier Excel a été téléchargé avec succès',
                life: 3000
            });
        } catch (error) {
            console.error('Erreur lors de l\'export Excel:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur d\'export',
                detail: 'Une erreur est survenue lors de l\'export Excel',
                life: 3000
            });
        }
    }

    exporterPDF(): void {
        try {
            // Créer un contenu HTML pour le PDF
            let htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Rapport des Sessions de Travail</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                            color: #333;
                        }
                        h1 {
                            color: #667eea;
                            border-bottom: 3px solid #667eea;
                            padding-bottom: 10px;
                            margin-bottom: 30px;
                        }
                        h2 {
                            color: #764ba2;
                            margin-top: 30px;
                            margin-bottom: 15px;
                        }
                        .info-section {
                            background: #f9fafb;
                            padding: 15px;
                            border-radius: 8px;
                            margin-bottom: 20px;
                        }
                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            margin: 8px 0;
                        }
                        .info-label {
                            font-weight: bold;
                            color: #6b7280;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 20px;
                        }
                        th {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 12px;
                            text-align: left;
                        }
                        td {
                            padding: 10px;
                            border-bottom: 1px solid #e5e7eb;
                        }
                        tr:nth-child(even) {
                            background-color: #f9fafb;
                        }
                        .footer {
                            margin-top: 40px;
                            text-align: center;
                            color: #6b7280;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <h1>📊 Rapport des Sessions de Travail</h1>
                    
                    <div class="info-section">
                        <div class="info-row">
                            <span class="info-label">Date de génération:</span>
                            <span>${new Date().toLocaleString('fr-FR')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Nombre d'agents:</span>
                            <span>${this.statistiquesAgents.length}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Total sessions:</span>
                            <span>${this.getTotalSessions()}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Total heures:</span>
                            <span>${this.formaterHeures(this.getTotalHeures())}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Distance totale:</span>
                            <span>${this.formaterDistance(this.getTotalDistance())}</span>
                        </div>
                    </div>

                    <h2>Statistiques par Agent</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Agent</th>
                                <th>Nombre de Sessions</th>
                                <th>Heures Travaillées</th>
                                <th>Distance (km)</th>
                                <th>Changements de Statut</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            this.statistiquesAgents.forEach(stat => {
                htmlContent += `
                    <tr>
                        <td>${(stat.agent.prenoms || '') + ' ' + (stat.agent.nom || '')}</td>
                        <td>${stat.nombreSessions}</td>
                        <td>${this.formaterHeures(stat.heuresTravailles)}</td>
                        <td>${stat.distanceTotale.toFixed(2)}</td>
                        <td>${stat.nombreChangementsStatut}</td>
                    </tr>
                `;
            });

            htmlContent += `
                        </tbody>
                    </table>

                    <h2>Statistiques par Période</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Période</th>
                                <th>Nombre de Sessions</th>
                                <th>Heures Travaillées</th>
                                <th>Nombre d'Agents</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            this.statistiquesPeriode.forEach(stat => {
                htmlContent += `
                    <tr>
                        <td>${stat.date}</td>
                        <td>${stat.nombreSessions}</td>
                        <td>${this.formaterHeures(stat.heuresTravailles)}</td>
                        <td>${stat.nombreAgents}</td>
                    </tr>
                `;
            });

            htmlContent += `
                        </tbody>
                    </table>

                    <div class="footer">
                        <p>Généré par ablink - ${new Date().toLocaleDateString('fr-FR')}</p>
                    </div>
                </body>
                </html>
            `;

            // Créer une nouvelle fenêtre pour imprimer en PDF
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                
                // Attendre que le contenu soit chargé puis imprimer
                printWindow.onload = () => {
                    setTimeout(() => {
                        printWindow.print();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Export réussi',
                            detail: 'Le PDF est prêt à être imprimé ou enregistré',
                            life: 3000
                        });
                    }, 250);
                };
            }
        } catch (error) {
            console.error('Erreur lors de l\'export PDF:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur d\'export',
                detail: 'Une erreur est survenue lors de l\'export PDF',
                life: 3000
            });
        }
    }

    getTotalSessions(): number {
        return this.statistiquesAgents.reduce((sum, s) => sum + s.nombreSessions, 0);
    }

    getTotalHeures(): number {
        return this.statistiquesAgents.reduce((sum, s) => sum + s.heuresTravailles, 0);
    }

    getTotalDistance(): number {
        return this.statistiquesAgents.reduce((sum, s) => sum + s.distanceTotale, 0);
    }
}
