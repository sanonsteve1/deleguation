export interface Entreprise {
    id: number;
    nom: string;
    description?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
}

export interface CreateEntrepriseDto {
    nom: string;
    description?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
}

export interface UpdateEntrepriseDto {
    nom: string;
    description?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
}
