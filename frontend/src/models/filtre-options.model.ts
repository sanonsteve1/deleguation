// Types pour les données brutes du backend (clés en minuscules comme retourné par le backend)
export interface RegionData {
    departementid: number;
    nomdepartement: string;
}

export interface AgenceData {
    agenceid: number;
    nomagence: string;
    departementid: number;
    nomdepartement: string;
}

export interface AmperageData {
    amperageid: number;
    libelleamperage: string;
}

export interface PhaseData {
    phase: string;
}

export interface TypeBranchementData {
    typebranchement: string;
}

export interface SourceDonneesData {
    sourcedonnees: string;
}

export interface AnneeData {
    annee: number;
}

export interface MoisData {
    mois: number;
    nomMois: string;
}

// Types pour les options des dropdowns
export interface DropdownOption {
    label: string;
    value: any;
}
