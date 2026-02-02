import { Statut } from './statut.model';

export interface ChangementStatut {
    id: number;
    sessionId: number;
    statut: Statut;
    timestamp: string; // ISO date string
    synchronise: boolean;
}

export interface ChangementStatutDto {
    id: number;
    sessionId: number;
    statut: {
        id: number;
        codeStatut: string;
        libelle: string;
    };
    timestamp: string;
    synchronise: boolean;
}
