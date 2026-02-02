import { Utilisateur } from './utilisateur.model';

export interface SessionTravail {
    id: number;
    utilisateur: Utilisateur;
    heureDebut: string | number[]; // ISO date string ou tableau [année, mois, jour, heure, minute, seconde]
    heureFin?: string | number[]; // ISO date string ou tableau (nullable)
    latitudeDebut: number;
    longitudeDebut: number;
    latitudeFin?: number; // nullable
    longitudeFin?: number; // nullable
    synchronise: boolean;
}

export interface SessionTravailDto {
    id: number;
    utilisateur: {
        id: number;
        nom: string;
        prenoms: string;
        login: string;
    };
    heureDebut: string;
    heureFin?: string;
    latitudeDebut: number;
    longitudeDebut: number;
    latitudeFin?: number;
    longitudeFin?: number;
    synchronise: boolean;
}

/**
 * Convertit une date (string ou tableau) en objet Date
 */
function convertirDateEnDate(dateValue: string | number[] | undefined | null): Date | null {
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

/**
 * Calcule la durée d'une session en heures
 */
export function calculerDureeSession(session: SessionTravail): number {
    const debut = convertirDateEnDate(session.heureDebut);
    if (!debut || isNaN(debut.getTime())) {
        return 0;
    }

    if (!session.heureFin) {
        // Session en cours - calculer depuis le début jusqu'à maintenant
        const maintenant = new Date();
        return (maintenant.getTime() - debut.getTime()) / (1000 * 60 * 60); // en heures
    }
    
    const fin = convertirDateEnDate(session.heureFin);
    if (!fin || isNaN(fin.getTime())) {
        return 0;
    }
    
    return (fin.getTime() - debut.getTime()) / (1000 * 60 * 60); // en heures
}

/**
 * Vérifie si une session est en cours
 */
export function estSessionEnCours(session: SessionTravail): boolean {
    return !session.heureFin;
}

/**
 * Formate la durée en heures et minutes
 */
export function formaterDuree(dureeHeures: number): string {
    const heures = Math.floor(dureeHeures);
    const minutes = Math.floor((dureeHeures - heures) * 60);
    return `${heures}h ${minutes}min`;
}
