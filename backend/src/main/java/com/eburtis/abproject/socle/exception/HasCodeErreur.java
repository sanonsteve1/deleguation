package com.eburtis.abproject.socle.exception;

/**
 * Interface utilisée pour tous les codes erreurs.<br/>
 * Il est recommandé d'implémenter cette interface avec des enum.<br/>
 * Chaque enum doit implémenter un code erreur unique.
 */
public interface HasCodeErreur {

	/**
	 * Code de l'erreur.
	 *
	 * @return Code de l'erreur.
	 */
	Long getCode();
}