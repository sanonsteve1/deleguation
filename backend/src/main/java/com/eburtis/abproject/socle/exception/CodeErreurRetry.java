package com.eburtis.abproject.socle.exception;

public enum CodeErreurRetry {
    UPLOAD_FICHIER_ERREUR(9003),
    TROP_REQUETES(429),
    ERREUR_INTERNE_SERVEUR(500),
    GATEWAY_INVALIDE(502),
    SERVICE_INDISPONIBLE(503),
    GATEWAY_TIMEOUT(504),
    AUTRE_ERREUR_TECHNIQUE(506);
    private final int code;

    CodeErreurRetry(int code) {
        this.code = code;
    }

    static public CodeErreurRetry fromCode(int code) {
        return switch (code) {
            case 500 -> CodeErreurRetry.ERREUR_INTERNE_SERVEUR;
            case 502 -> CodeErreurRetry.GATEWAY_INVALIDE;
            case 503 -> CodeErreurRetry.SERVICE_INDISPONIBLE;
            case 504 -> CodeErreurRetry.GATEWAY_TIMEOUT;
            case 9003 -> CodeErreurRetry.UPLOAD_FICHIER_ERREUR;
            case 429 -> CodeErreurRetry.TROP_REQUETES;
            case 506 -> CodeErreurRetry.AUTRE_ERREUR_TECHNIQUE;
            default -> null;
        };
    }

    public int getCode() {
        return code;
    }
}
