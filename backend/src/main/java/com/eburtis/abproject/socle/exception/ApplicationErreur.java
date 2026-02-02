package com.eburtis.abproject.socle.exception;

import java.text.MessageFormat;

/**
 * Objet utilisé pour transporter une erreur de l'application, spécifiés par son type, son code et son message.<br/>
 */
public class ApplicationErreur {

	private Long code;
	private String type;
	private String message;
	private ExceptionUserDisplay display;

	public ApplicationErreur(String type, String message, Long code, ExceptionUserDisplay display) {
		this.type = type;
		this.message = message;
		this.code = code;
		this.display = display;
	}

	public ApplicationErreur(String type, String message, Long code) {
		this.type = type;
		this.message = message;
		this.code = code;
	}

	public String getType() {
		return type;
	}

	public String getMessage() {
		return message;
	}

	public Long getCode() {
		return code;
	}

	public ExceptionUserDisplay getDisplay() {
		return display;
	}

	/**
	 * Retourne le message préfixé par le code de l'erreur
	 *
	 * @return
	 */
	public String getMessageAvecCode() {
		return MessageFormat.format("[{0,number,0000}] {1}", getCode(), getMessage());
	}
}