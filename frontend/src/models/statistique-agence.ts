import { RepartitionAmperage } from './repartition-amperage';

export interface StatistiqueAgence {
    agenceId: number;
    codeAgence: string;
    nomAgence: string;
    departementId: number;
    nomDepartement: string;
    nombreBranchements: number;
    contributionRegion: number;
    rang: number;
    repartitionAmperages: RepartitionAmperage[];
}
