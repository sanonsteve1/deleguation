export interface EffectifCumul {
    nombreDirections: number;
    nombreDepartements: number;
    nombreServices: number;
    totalEffectifServices: number;
    totalEffectifTranchesAges: number;
    totalEffectifCategoriesAgents: number;
    totalEffectifGeneral: number;
    totalParTrancheAge: Record<string, number>;
    totalParCategorieAgent: Record<string, number>;
    densiteParCategorieParDirection: Record<string, Record<string, number>>;
    densiteTrancheParDirection: Record<string, Record<string, number>>;
    totalEffectifParDirection: Record<string, number>;
    densiteParDirection: Record<string, number>;
    totalParDepartement: Record<string, number>;
    densiteParDepartement: Record<string, number>;
}
