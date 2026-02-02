import { RepartitionAmperage } from './repartition-amperage';

export interface StatistiqueRegion {
    departementId: number;
    codeDepartement: string;
    nomDepartement: string;
    nombreBranchements: number;
    partNational: number;
    rang: number;
    repartitionAmperages: RepartitionAmperage[];
}
