package com.eburtis.abproject.socle.exception;

import javax.validation.ConstraintViolation;
import java.util.HashSet;
import java.util.Set;

/**
 * Exception lancée en cas d'erreur de validation d'objet.
 *
 * @see AbstractApplicationException
 */
@SuppressWarnings("serial")
public class DataValidationException extends AbstractApplicationException {

	private final Set<ConstraintViolation<?>> constraintViolations;

	/**
	 * Crée une exception dûe à une erreur de validation de données.
	 *
	 * @param msg le message décrivant l'erreur.
	 * @param constraintViolations les violations de contrainte.
	 * @param code code erreur unique.
	 */
	public <T> DataValidationException(String msg, Set<ConstraintViolation<T>> constraintViolations, HasCodeErreur code) {
		super(code, msg);
		this.constraintViolations = new HashSet<>();
		this.constraintViolations.addAll(constraintViolations);
	}

	public Set<ConstraintViolation<?>> getConstraintViolations() {
		return constraintViolations;
	}
}