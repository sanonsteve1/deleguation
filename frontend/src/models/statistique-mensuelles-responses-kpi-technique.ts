import {DonneesMensuellesKPITechnique} from "./donnees-mensuselle-kpi-technique";

export interface StatistiqueMensuelleResponsesKpiTechnique {
    // Liste des données mensuelles
    donneesMensuelleGenerale: DonneesMensuellesKPITechnique[];

    // Valeurs du mois sélectionné
    extensionReseauxMois: number;
    longueurReseauKmMois: number;
    quantiteEnergieNonDistribueeKwhMois: number;
    montantEnergieNonDistribueeFcfaMois: number;
    importationEnergieKwhMois: number;
    dureeIndiceInterruptionMois: number;
    frequenceIndiceInterruptionMois: number;

    // Valeurs cumulées
    cumulExtensionReseaux: number;
    cumulLongueurReseauKm: number;
    cumulQuantiteEnergieNonDistribueeKwh: number;
    cumulMontantEnergieNonDistribueeFcfa: number;
    cumulImportationEnergieKwh: number;
    cumulDureeIndiceInterruption: number;
    cumulFrequenceIndiceInterruption: number;
}
