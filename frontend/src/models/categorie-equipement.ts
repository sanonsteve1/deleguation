export interface CategorieEquipement {
    id: number;
    code: string;
    libelle: string;
    description?: string;
    niveau?: string;
    idCategorieParente?: number;
    libelleCategorieParente?: string;
    ordreAffichage?: number;
    sousCategories?: CategorieEquipement[];
    nombreEquipements?: number;
}

