import { StatistiqueAmperage } from './statistique-amperage';
import { StatistiqueRegion } from './statistique-region';
import { StatistiqueAgence } from './statistique-agence';

export interface ResumeStatistiques {
    totalBranchements: number;
    nombreRegions: number;
    nombreAgences: number;
    statistiquesAmperage: StatistiqueAmperage[];
    statistiquesRegions: StatistiqueRegion[];
    statistiquesAgences: StatistiqueAgence[];
    listePhases: string[];
    listeTypesBranchement: string[];
    listeSourcesDonnees: string[];
}
