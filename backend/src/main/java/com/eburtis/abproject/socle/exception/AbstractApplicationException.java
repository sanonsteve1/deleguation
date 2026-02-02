package com.eburtis.abproject.socle.exception;

import java.text.MessageFormat;

/**
 * Classe parente pour toutes les exceptions liées à un code erreur.<br/>
 * Le code erreur doit implémenter l'interface HasCodeErreur.<br/>
 * Chaque code erreur doit être utilisé par une et une seule exception.
 *
 * @see HasCodeErreur
 * @see ApplicationErreur
 */
@SuppressWarnings("serial")

public abstract class AbstractApplicationException extends RuntimeException {

	private String messageTraduit;

	/**
	 * Chaque exception étendant cette classe doit définir un code unique permettant de retrouver rapidement le type d'erreur applicative rencontrée. Le code doit être déclaré dans l'enum code erreur
	 * afin d'assurer l'unicité du code.
	 */
	private HasCodeErreur codeErreur;


	/**
	 * Les paramètres éventuels pour créer le message de l'exception.
	 */
	private Object[] params;


	/**
	 * La façon dont l'exception est prévue pour être affichée à l'utilisateur.
	 */
	protected ExceptionUserDisplay display;

	public AbstractApplicationException(HasCodeErreur codeErreur, String messageTraduit, Object... params) {
		this.codeErreur = codeErreur;
		this.params = params;
		this.messageTraduit = messageTraduit;
		this.display = ExceptionUserDisplay.ERROR;
	}

	public HasCodeErreur getCodeErreur() {
		return codeErreur;
	}


	/**
	 * Retourne l'ApplicationErreur correspondant à cette exception <br>
	 * composée du code au format string, du message de l'exception et du code au format long
	 *
	 * @return le message d'erreur.
	 */
	public ApplicationErreur getApplicationErreur() {

		return new ApplicationErreur(codeErreur.toString(), getMessage(), codeErreur.getCode(), display);
	}

	/**
	 * Retourne un message préformaté avec le code erreur et le message.
	 *
	 * @return le message d'erreur.
	 */
	public final String getMessageAvecCode() {
		return MessageFormat.format("[{0,number,0000}] {1}", codeErreur.getCode(), getMessage());
	}

	public ExceptionUserDisplay getDisplay() {
		return display;
	}

	public Object[] getParams() {
		return params;
	}

	private String getMessageTraduit() {
		return messageTraduit;
	}

	public void setMessageTraduit(String messageTraduit) {
		this.messageTraduit = messageTraduit;
	}

	@Override

	public String getMessage() {
		return getMessageTraduit() == null ? super.getMessage() : getMessageTraduit();
	}
}
