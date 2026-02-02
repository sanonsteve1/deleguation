export class Utilisateur {
    id?: number;
    username?: string;
    login?: string; // Alias pour username, utilisé dans auth.service
    nom?: string;
    prenoms?: string;
    telephone?: string;
    role?: Role | string; // Peut être string pour compatibilité avec le token JWT
    statut?: StatutUtilisateur | string; // Peut être string pour compatibilité avec le token JWT
    fonctionnalites?: string[]; // Liste des fonctionnalités de l'utilisateur
    entreprise?: { id: number; nom: string; description?: string; adresse?: string; telephone?: string; email?: string } | string; // Entreprise (objet ou string pour compatibilité)

    /**
     * Retourne le nom et prénom abrégés
     */
    nomEtPrenomAbrege(): string {
        if (!this.prenoms || !this.nom) {
            return this.username || this.login || '';
        }
        const prenomInitial = this.prenoms.charAt(0).toUpperCase();
        return `${prenomInitial}. ${this.nom}`;
    }
}

export enum Role {
    ADMIN = 'ADMIN',
    USER = 'USER',
    SUPER_ADMIN = 'SUPER_ADMIN',
    AGENT = 'AGENT'
}

export enum StatutUtilisateur {
    ACTIF = 'ACTIF',
    INACTIF = 'INACTIF'
}

export interface CreateUtilisateurDto {
    username: string;
    password: string;
    nom: string;
    prenoms: string;
    telephone?: string;
    role: Role;
    statut: StatutUtilisateur;
    entrepriseId?: number;
}

export interface UpdateUtilisateurDto {
    nom: string;
    prenoms: string;
    telephone?: string;
    role: Role;
    statut: StatutUtilisateur;
    entrepriseId?: number;
}
