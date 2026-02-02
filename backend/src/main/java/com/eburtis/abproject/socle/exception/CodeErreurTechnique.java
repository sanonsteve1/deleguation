package com.eburtis.abproject.socle.exception;

/**
 * Codes erreurs techniques qui ne sont liés à aucun métier.<br>
 *
 * @see HasCodeErreur
 */
public enum CodeErreurTechnique implements HasCodeErreur {
	ENTITE_NON_CONNUE(9001L),
	PARSE_FICHIER(9002L),
	UPLOAD_FICHIER_ERREUR(9003L),
	NOT_COMPLETED_ERROR(9004L),
	UNAUTHORIZED_ERREUR(9005L),
	FORBIDDEN_ERREUR(9006L),
	PATCH_EXCEPTION(9007L),
	SESSION_EXPIREE_ERREUR(9008L),
	TRANSLATE_ERROR(9009L),
	CONTRAINTE_UNICITE_NON_RESPECTEE(9100L),
	ENCODAGE_INCONNU(9101L),
	ERREUR_VALIDATION(9200L),
	ERREUR_NUXEO(9300L),
	JMS_ERROR(9500L),
	TRADUCTION_HTTP_EXCEPTION(9600L),
	TRADUCTION_INACTIVE(9601L),
	NEED_REPLAY_EXCEPTION(9997L),
	NO_RESULT_ERROR(9998L),
	RUNTIME_ERROR(9999L);

	private final Long code;

	private CodeErreurTechnique(Long code) {
		if (code < 9000 || code >= 10000) {
			throw new IllegalStateException("Les codes d'erreur techniques doivent être compris entre 9000 et 9999");
		}
		this.code = code;
	}

	@Override
	public Long getCode() {
		return code;
	}
}