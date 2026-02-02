package com.eburtis.abproject.utils;

public class StatutUtils {

    public static String formatProjetStatut(String statut) {

        if (statut == null) {
            return "Aucun statut";
        }
        switch (statut) {
            case "NON_DEMARREE":
                return "Non démarrée";
            case "EN_COURS":
                return "En cours";
            case "TERMINEwE":
                return "Terminée";
            case "SUSPENDUE":
                return "Suspendue";
            default:
                return statut;
        }
    }


    public static String formatProjetCriticite(String criticite) {
        if (criticite == null) {
            return "Aucune criticité";
        }

        switch (criticite.toUpperCase()) {
            case "NEGLIGEABLE":
                return "Négligeable";
            case "MINEUR":
                return "Mineure";
            case "MODERE":
                return "Modérée";
            case "MAJEUR":
                return "Majeure";
            case "CRITIQUE":
                return "Critique";
            case "HAUTE":
                return "Haute";
            case "MOYENNE":
                return "Moyenne";
            case "FAIBLE":
                return "Faible";
            default:
                return criticite;
        }
    }

    public static String formatProjetProbabilite(String probabilite) {
        if (probabilite == null) {
            return "Non définie";
        }

        switch (probabilite.toUpperCase()) {
            case "FAIBLE":
                return "Faible";
            case "MOYEN":
            case "MOYENNE":
                return "Moyenne";
            case "ELEVE":
            case "ELEVEE":
                return "Élevée";
            default:
                return probabilite;
        }
    }

    public static String formatProjetImpact(String impact) {
        if (impact == null) {
            return "Non défini";
        }

        switch (impact.toUpperCase()) {
            case "FAIBLE":
                return "Faible";
            case "MOYEN":
                return "Moyen";
            case "GRAVE":
                return "Grave";
            case "MAJEUR":
                return "Majeur";
            default:
                return impact;
        }
    }

}
