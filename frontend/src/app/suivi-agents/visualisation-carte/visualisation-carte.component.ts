import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { SessionTravailService } from '../../../services/session-travail.service';
import { PositionGpsService } from '../../../services/position-gps.service';
import { SessionTravail, estSessionEnCours } from '../../../models/session-travail.model';
import { PositionGps } from '../../../models/position-gps.model';
import { Utilisateur } from '../../../models/utilisateur.model';
import { forkJoin, interval, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

declare var L: any;

@Component({
    selector: 'app-visualisation-carte',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        CardModule,
        ButtonModule,
        ProgressSpinnerModule,
        CalendarModule,
        DropdownModule,
        BadgeModule,
        TooltipModule
    ],
    templateUrl: './visualisation-carte.component.html',
    styleUrls: ['./visualisation-carte.component.scss']
})
export class VisualisationCarteComponent implements OnInit, AfterViewInit, OnDestroy {
    sessionId?: number; // Pour l'affichage d'une session spécifique
    sessions: SessionTravail[] = [];
    sessionsActives: SessionTravail[] = []; // Sessions en cours pour suivi temps réel
    agents: { id: number; nom: string; prenoms: string; fullName: string }[] = [];
    selectedAgent?: { id: number; nom: string; prenoms: string; fullName: string };
    dateFiltre?: Date;
    loading = false;
    isFollowingActive = false; // Suivi automatique des agents actifs
    selectedSessionId?: number; // Session sélectionnée pour afficher son itinéraire
    private map: any;
    private markers: any[] = [];
    private activeMarkers: Map<number, any> = new Map(); // Marqueurs pour agents actifs
    private polylines: any[] = [];
    private sessionPositions: Map<number, PositionGps[]> = new Map();
    private activePositions: Map<number, PositionGps> = new Map(); // Dernière position de chaque agent actif
    private colors = ['#E53935', '#667eea', '#f5576c', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];
    private refreshSubscription?: Subscription;
    private autoRefreshInterval = 10000; // Rafraîchir toutes les 10 secondes pour les sessions actives

    constructor(
        private route: ActivatedRoute,
        private sessionTravailService: SessionTravailService,
        private positionGpsService: PositionGpsService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.sessionId = +params['id'];
            }
            this.chargerAgents();
            this.chargerDonnees();
            // Démarrer le rafraîchissement automatique pour les sessions actives
            this.demarrerAutoRefresh();
        });
    }

    ngAfterViewInit(): void {
        // Délai pour s'assurer que la div map est créée et que le layout est rendu
        setTimeout(() => {
            this.initialiserCarte();
            // Recalculer la taille de la carte après initialisation
            setTimeout(() => {
                if (this.map) {
                    this.map.invalidateSize();
                }
            }, 300);
        }, 100);
    }

    ngOnDestroy(): void {
        this.arreterAutoRefresh();
        if (this.map) {
            this.map.remove();
        }
    }

    demarrerAutoRefresh(): void {
        if (this.refreshSubscription) {
            return;
        }
        this.refreshSubscription = interval(this.autoRefreshInterval).subscribe(() => {
            this.chargerSessionsActives();
        });
    }

    arreterAutoRefresh(): void {
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
            this.refreshSubscription = undefined;
        }
    }

    chargerSessionsActives(): void {
        // Charger uniquement les sessions en cours pour le suivi temps réel
        this.sessionTravailService.getHistoriqueSessions().subscribe({
            next: (sessions) => {
                const actives = sessions.filter(s => estSessionEnCours(s));
                this.sessionsActives = actives;
                
                // Charger les dernières positions des agents actifs
                if (actives.length > 0) {
                    const observables = actives.map(session => 
                        this.positionGpsService.getPositionsParSession(session.id!)
                    );
                    
                    forkJoin(observables).subscribe({
                        next: (positionsArray) => {
                            positionsArray.forEach((positions, index) => {
                                const sessionId = actives[index].id!;
                                if (positions.length > 0) {
                                    // Prendre la dernière position (la plus récente)
                                    const dernierePosition = positions.sort((a, b) => 
                                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                                    )[0];
                                    this.activePositions.set(sessionId, dernierePosition);
                                }
                            });
                            this.afficherAgentsActifs();
                        },
                        error: (error) => {
                            console.error('Erreur lors du chargement des positions actives:', error);
                        }
                    });
                } else {
                    // Supprimer les marqueurs actifs s'il n'y a plus de sessions actives
                    this.activeMarkers.forEach(marker => this.map?.removeLayer(marker));
                    this.activeMarkers.clear();
                }
            },
            error: (error) => {
                console.error('Erreur lors du chargement des sessions actives:', error);
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
        // Charger toutes les sessions pour extraire la liste des agents
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
        
        // Charger toutes les sessions, le filtrage se fera côté client
        this.sessionTravailService.getHistoriqueSessions().subscribe({
            next: (sessions) => {
                console.log('Sessions reçues (carte):', sessions);
                console.log('Nombre de sessions:', sessions?.length || 0);
                let sessionsFiltrees = sessions;
                
                // Filtre par sessionId si spécifié (depuis l'URL)
                if (this.sessionId) {
                    sessionsFiltrees = sessionsFiltrees.filter(s => s.id === this.sessionId);
                    // Si un sessionId est fourni, tracer automatiquement son itinéraire
                    this.selectedSessionId = this.sessionId;
                } else {
                    // Appliquer les filtres et exclure les sessions actives (elles sont gérées séparément)
                    sessionsFiltrees = this.appliquerFiltresClient(sessionsFiltrees)
                        .filter(s => !estSessionEnCours(s));
                }
                
                console.log('Sessions filtrées:', sessionsFiltrees.length);
                this.sessions = sessionsFiltrees;
                this.chargerPositionsToutes();
                
                // Charger aussi les sessions actives
                this.chargerSessionsActives();
            },
            error: (error) => {
                console.error('Erreur lors du chargement des sessions:', error);
                this.loading = false;
                this.sessions = [];
            }
        });
    }

    private appliquerFiltresClient(sessions: SessionTravail[]): SessionTravail[] {
        let resultat = [...sessions];

        // Filtre par agent
        if (this.selectedAgent) {
            resultat = resultat.filter(session => 
                session.utilisateur && session.utilisateur.id === this.selectedAgent!.id
            );
        }

        // Filtre par date
        if (this.dateFiltre) {
            const dateDebut = new Date(this.dateFiltre);
            dateDebut.setHours(0, 0, 0, 0);
            const dateFin = new Date(this.dateFiltre);
            dateFin.setHours(23, 59, 59, 999);

            resultat = resultat.filter(session => {
                const dateDebutSession = this.convertirDateEnDate(session.heureDebut);
                if (!dateDebutSession) return false;
                
                return dateDebutSession >= dateDebut && dateDebutSession <= dateFin;
            });
        }

        return resultat;
    }

    chargerPositionsToutes(): void {
        if (this.sessions.length === 0) {
            this.loading = false;
            this.afficherItineraires();
            return;
        }

        const observables = this.sessions.map(session => 
            this.positionGpsService.getPositionsParSession(session.id)
        );

        forkJoin(observables).pipe(
            finalize(() => {
                this.loading = false;
                this.afficherItineraires();
            })
        ).subscribe({
            next: (positionsArray) => {
                console.log(`[VisualisationCarte] ${positionsArray.length} sessions chargées`);
                this.sessionPositions.clear();
                positionsArray.forEach((positions, index) => {
                    const sessionId = this.sessions[index].id;
                    console.log(`[VisualisationCarte] Session ${sessionId}: ${positions.length} positions GPS`);
                    this.sessionPositions.set(sessionId, positions);
                });
                const totalPositions = positionsArray.reduce((sum, pos) => sum + pos.length, 0);
                console.log(`[VisualisationCarte] Total: ${totalPositions} positions GPS chargées`);
            },
            error: (error) => {
                console.error('[VisualisationCarte] Erreur lors du chargement des positions:', error);
            }
        });
    }

    initialiserCarte(): void {
        // Configuration des icônes par défaut de Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
        });

        // Initialiser la carte centrée sur Abidjan par défaut
        this.map = L.map('map').setView([5.3600, -4.0083], 13);

        // Ajouter la couche de tuiles OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);
    }

    afficherItineraires(): void {
        if (!this.map) {
            return;
        }

        // Nettoyer les marqueurs et polylines existants (sauf les marqueurs actifs)
        this.markers.forEach(marker => this.map!.removeLayer(marker));
        this.markers = [];
        this.polylines.forEach(polyline => this.map!.removeLayer(polyline));
        this.polylines = [];

        // S'assurer que la carte est bien dimensionnée
        setTimeout(() => {
            if (this.map) {
                this.map.invalidateSize();
            }
        }, 100);

        if (this.sessions.length === 0) {
            // Si aucune session, centrer sur Abidjan
            this.map.setView([5.3600, -4.0083], 13);
            return;
        }

        const allBounds: any[] = [];

        // Si une session est sélectionnée, afficher uniquement son itinéraire
        if (this.selectedSessionId) {
            const selectedSession = this.sessions.find(s => s.id === this.selectedSessionId);
            if (selectedSession) {
                this.afficherItineraireSession(selectedSession, allBounds);
            }
        } else {
            // Afficher toutes les sessions avec une couleur différente
            this.sessions.forEach((session, index) => {
                // Ne pas afficher les sessions actives ici (elles sont gérées par afficherAgentsActifs)
                if (estSessionEnCours(session)) {
                    return;
                }

                const color = this.colors[index % this.colors.length];
                const positions = this.sessionPositions.get(session.id!) || [];
                
                if (positions.length === 0 && session.latitudeDebut && session.longitudeDebut) {
                    // Si pas de positions GPS, afficher juste le point de départ
                    const startMarker = this.creerMarqueurDepart(session);
                    this.markers.push(startMarker);
                    allBounds.push(L.latLng(session.latitudeDebut, session.longitudeDebut));
                } else if (positions.length > 0) {
                    // Créer les points pour la polyline
                    const latlngs: any[] = positions.map(pos => 
                        L.latLng(pos.latitude, pos.longitude)
                    );

                    // Ajouter le point de départ
                    if (session.latitudeDebut && session.longitudeDebut) {
                        const startMarker = this.creerMarqueurDepart(session);
                        this.markers.push(startMarker);
                        allBounds.push(...latlngs);
                    }

                    // Ajouter le point d'arrivée si disponible
                    if (session.latitudeFin && session.longitudeFin) {
                        const endMarker = this.creerMarqueurArrivee(session);
                        this.markers.push(endMarker);
                    }

                    // Créer la polyline (ligne de l'itinéraire) avec style moderne
                    const polyline = L.polyline(latlngs, {
                        color: color,
                        weight: 3,
                        opacity: 0.5,
                        lineJoin: 'round',
                        lineCap: 'round'
                    }).addTo(this.map!);
                    this.polylines.push(polyline);
                }
            });
        }

        // Ajuster la vue pour afficher tous les itinéraires
        if (allBounds.length > 0) {
            const bounds = L.latLngBounds(allBounds);
            this.map.fitBounds(bounds, { padding: [50, 50] });
        } else {
            // Si aucune position, centrer sur Abidjan
            this.map.setView([5.3600, -4.0083], 13);
        }
    }

    afficherItineraireSession(session: SessionTravail, allBounds: any[]): void {
        const positions = this.sessionPositions.get(session.id!) || [];
        const color = '#E53935'; // Couleur principale pour l'itinéraire sélectionné
        
        if (positions.length === 0 && session.latitudeDebut && session.longitudeDebut) {
            // Si pas de positions GPS, afficher juste le point de départ
            const startMarker = this.creerMarqueurDepart(session);
            this.markers.push(startMarker);
            allBounds.push(L.latLng(session.latitudeDebut, session.longitudeDebut));
        } else if (positions.length > 0) {
            // Créer les points pour la polyline
            const latlngs: any[] = positions.map(pos => 
                L.latLng(pos.latitude, pos.longitude)
            );

            // Ajouter le point de départ
            if (session.latitudeDebut && session.longitudeDebut) {
                const startMarker = this.creerMarqueurDepart(session);
                this.markers.push(startMarker);
                allBounds.push(...latlngs);
            }

            // Ajouter le point d'arrivée si disponible
            if (session.latitudeFin && session.longitudeFin) {
                const endMarker = this.creerMarqueurArrivee(session);
                this.markers.push(endMarker);
                allBounds.push(L.latLng(session.latitudeFin, session.longitudeFin));
            }

            // Créer la polyline (ligne de l'itinéraire) avec style mis en évidence
            const polyline = L.polyline(latlngs, {
                color: color,
                weight: 6,
                opacity: 0.9,
                lineJoin: 'round',
                lineCap: 'round'
            }).addTo(this.map!);
            this.polylines.push(polyline);
        }
    }

    afficherAgentsActifs(): void {
        if (!this.map) {
            return;
        }

        // Supprimer les anciens marqueurs actifs
        this.activeMarkers.forEach(marker => this.map?.removeLayer(marker));
        this.activeMarkers.clear();

        // Afficher les agents actifs avec des marqueurs animés
        this.sessionsActives.forEach(session => {
            const position = this.activePositions.get(session.id!);
            if (position) {
                const marker = this.creerMarqueurActif(session, position);
                this.activeMarkers.set(session.id!, marker);
                
                // Si le suivi automatique est activé, centrer sur les agents actifs
                if (this.isFollowingActive && this.activeMarkers.size === 1) {
                    this.map.setView([position.latitude, position.longitude], 16, {
                        animate: true,
                        duration: 0.5
                    });
                }
            }
        });
    }

    creerMarqueurDepart(session: SessionTravail): any {
        const nomAgent = this.getNomUtilisateur(session);
        const dateDebut = this.convertirDateEnDate(session.heureDebut);
        const isSelected = this.selectedSessionId === session.id;
        
        const icon = L.divIcon({
            className: 'custom-marker-start',
            html: `
                <div class="marker-container">
                    <div class="marker-pulse"></div>
                    <div class="marker-icon marker-start ${isSelected ? 'marker-selected' : ''}">
                        <i class="pi pi-map-marker"></i>
                    </div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40]
        });

        const marker = L.marker([session.latitudeDebut!, session.longitudeDebut!], { icon })
            .addTo(this.map!);
        
        const popupContent = `
            <div class="popup-content">
                <b>${nomAgent}</b><br>
                <small>Session #${session.id}</small><br>
                <small>Début: ${dateDebut ? dateDebut.toLocaleString('fr-FR') : '-'}</small>
                ${isSelected ? '<br><span class="badge-selected">✓ Itinéraire tracé</span>' : '<br><button class="btn-tracer" data-session-id="' + session.id + '">Tracer l\'itinéraire</button>'}
            </div>
        `;
        
        const popup = marker.bindPopup(popupContent);
        
        // Ajouter un gestionnaire de clic sur le popup pour le bouton
        marker.on('popupopen', () => {
            const btn = document.querySelector('.btn-tracer[data-session-id="' + session.id + '"]');
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.tracerItineraire(session.id!);
                });
            }
        });
        
        // Ajouter aussi un double-clic sur le marqueur pour tracer l'itinéraire
        marker.on('dblclick', () => {
            this.tracerItineraire(session.id!);
        });
        
        return marker;
    }

    tracerItineraire(sessionId: number): void {
        this.selectedSessionId = sessionId;
        this.afficherItineraires();
        
        // Fermer tous les popups
        this.map.closePopup();
    }

    reinitialiserVue(): void {
        this.selectedSessionId = undefined;
        this.afficherItineraires();
    }

    creerMarqueurArrivee(session: SessionTravail): any {
        const dateFin = session.heureFin ? this.convertirDateEnDate(session.heureFin) : null;
        
        const icon = L.divIcon({
            className: 'custom-marker-end',
            html: `
                <div class="marker-container">
                    <div class="marker-pulse"></div>
                    <div class="marker-icon marker-end">
                        <i class="pi pi-map-marker"></i>
                    </div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40]
        });

        const marker = L.marker([session.latitudeFin!, session.longitudeFin!], { icon })
            .addTo(this.map!);
        
        marker.bindPopup(`
            <div class="popup-content">
                <b>${this.getNomUtilisateur(session)}</b><br>
                <small>Session #${session.id}</small><br>
                <small>Fin: ${dateFin ? dateFin.toLocaleString('fr-FR') : 'En cours'}</small>
            </div>
        `);
        
        return marker;
    }

    creerMarqueurActif(session: SessionTravail, position: PositionGps): any {
        const nomAgent = this.getNomUtilisateur(session);
        const color = this.colors[0]; // Utiliser la couleur primaire
        
        const icon = L.divIcon({
            className: 'custom-marker-active',
            html: `
                <div class="marker-container-active">
                    <div class="marker-pulse-active"></div>
                    <div class="marker-icon-active" style="background-color: ${color};">
                        <i class="pi pi-navigation"></i>
                    </div>
                </div>
            `,
            iconSize: [50, 50],
            iconAnchor: [25, 50]
        });

        const marker = L.marker([position.latitude, position.longitude], { 
            icon,
            zIndexOffset: 1000 // Au-dessus des autres marqueurs
        }).addTo(this.map!);
        
        marker.bindPopup(`
            <div class="popup-content-active">
                <div class="popup-header">
                    <b>${nomAgent}</b>
                    <span class="badge-active">En cours</span>
                </div>
                <small>Session #${session.id}</small><br>
                <small>Dernière position: ${new Date(position.timestamp).toLocaleString('fr-FR')}</small><br>
                <small>Précision: ${position.precision ? position.precision.toFixed(0) : '-'}m</small>
            </div>
        `);
        
        return marker;
    }

    getNomUtilisateur(session: SessionTravail): string {
        if (session.utilisateur) {
            return `${session.utilisateur.prenoms || ''} ${session.utilisateur.nom || ''}`.trim();
        }
        return 'Utilisateur inconnu';
    }

    appliquerFiltres(): void {
        // Recharger toutes les sessions et appliquer les filtres
        this.loading = true;
        this.sessionTravailService.getHistoriqueSessions().subscribe({
            next: (sessions) => {
                this.sessions = this.appliquerFiltresClient(sessions);
                this.chargerPositionsToutes();
            },
            error: (error) => {
                console.error('Erreur lors du chargement des sessions:', error);
                this.loading = false;
                this.sessions = [];
            }
        });
    }

    reinitialiserFiltres(): void {
        this.selectedAgent = undefined;
        this.dateFiltre = undefined;
        this.sessionId = undefined;
        this.chargerDonnees();
    }

    getAgentsDistincts(): number {
        const agentsIds = new Set<number>();
        this.sessions.forEach(session => {
            if (session.utilisateur) {
                agentsIds.add(session.utilisateur.id);
            }
        });
        return agentsIds.size;
    }

    getTotalPositions(): number {
        let total = 0;
        this.sessionPositions.forEach(positions => {
            total += positions.length;
        });
        return total;
    }
}
