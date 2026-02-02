package com.eburtis.abproject.socle.model;


import jakarta.persistence.Embeddable;

import java.time.Instant;

/**
 * Objet de gestion d'un couple (date, login)
 */
@Embeddable
public class DateEtLogin {
	private Instant date;
	private String login;

	public DateEtLogin() {
		super();
	}

	public DateEtLogin(Instant date, String login) {
		super();
		this.date = date;
		this.login = login;
	}

	public Instant getDate() {
		return date;
	}

	public String getLogin() {
		return login;
	}

	/**
	 * Permet de modifier l'objet en affectant une date et un login
	 *
	 * @param date  la date que l'on souhaite affecter
	 * @param login le login que l'on veut affeter
	 */
	public void update(Instant date, String login) {
		this.date = date;
		this.login = login;
	}
}
