package com.eburtis.abproject.socle.repository;


import com.eburtis.abproject.socle.exception.FetchBuilderException;
import jakarta.persistence.criteria.Fetch;
import jakarta.persistence.criteria.FetchParent;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.metamodel.Attribute;
import jakarta.persistence.metamodel.PluralAttribute;
import jakarta.persistence.metamodel.SingularAttribute;
import org.apache.tomcat.util.buf.StringUtils;


import java.util.*;
import java.util.stream.Collectors;

/**
 * Classe utilitaire permettant d'automatiser la gestion des fetchs.
 */
public final class FetchBuilder {

	private FetchBuilder() {
		// Util class
	}

	/**
	 * Effectue les fetchs correspondants sur le from.
	 *
	 * @param from            le from.
	 * @param fetchOperations les fetchs à effectuer.
	 * @param <T>             le (super) type de donnée.
	 * @param <U>             le type qui étend T à partir duquel on effectue un fetch.
	 * @return true si au moins un des fetch concerne une jointure avec un {@link PluralAttribute}, false sinon.
	 */

	public static <T, U extends T> boolean buildFetchs(FetchParent<?, T> from, FetchOperation<U>... fetchOperations) {
		boolean hasPluralAttribute = false;
		if (fetchOperations != null) {
			Map<FetchMapKey, FetchParent<?, ?>> fetchParentsMap = new HashMap<>();

			for (FetchOperation<U> fetchOperation : fetchOperations) {
				JoinType joinType = fetchOperation.getJoinType();
				List<Attribute<?, ?>> fetchedAttributes = fetchOperation.getAttributes();

				// Tous les attributs précédents
				List<Attribute<?, ?>> previousAttributes = new ArrayList<>(fetchedAttributes.size());

				// On affecte le from avec une clé vide
				fetchParentsMap.put(new FetchMapKey(previousAttributes), from);

				for (Attribute<?, ?> attribute : fetchedAttributes) {

					// On ajoute l'attribut courant
					previousAttributes.add(attribute);

					// Clé constituée de tous les attributs précédents
					FetchMapKey currentKey = new FetchMapKey(previousAttributes);
					if (!fetchParentsMap.containsKey(currentKey)) {
						// Le fetch n'a pas encore effectué

						// On récupère le parent sur lequel va être effectué le fetch
						FetchMapKey previousKey = currentKey.previousKey();
						FetchParent<?, ?> fetchParent = fetchParentsMap.get(previousKey);

						// Fetch et stockage dans la map
						Fetch<?, ?> newFetch = doFetch(fetchParent, attribute, joinType);
						fetchParentsMap.put(currentKey, newFetch);

						// On vérifie si au moins un attribut plural a été fetché
						hasPluralAttribute |= isPluralAttribute(attribute);
					}
				}
			}
		}
		return hasPluralAttribute;
	}

	/**
	 * Effectue un fetch à partir de 'from' pour l'attribut avec le joinType approprié.
	 *
	 * @param from      le from.
	 * @param attribute l'attribut.
	 * @param joinType  le joinType.
	 * @return le fetch résultant de l'opération.
	 * @throws FetchBuilderException si jamais l'attribut n'est ni un {@link SingularAttribute}, ni un {@link PluralAttribute}.
	 */
	private static Fetch<?, ?> doFetch(FetchParent<?, ?> from, Attribute<?, ?> attribute, JoinType joinType) {
		if (isSingularAttribute(attribute)) {
			return from.fetch(((SingularAttribute) attribute), joinType);
		} else if (isPluralAttribute(attribute)) {
			return from.fetch(((PluralAttribute) attribute), joinType);
		} else {
			throw new FetchBuilderException(from, attribute);
		}
	}

	private static boolean isPluralAttribute(Attribute<?, ?> attribute) {
		return attribute instanceof PluralAttribute;
	}

	private static boolean isSingularAttribute(Attribute<?, ?> attribute) {
		return attribute instanceof SingularAttribute;
	}

	private static class FetchMapKey {

		private final List<Attribute<?, ?>> attributes;

		private FetchMapKey(List<Attribute<?, ?>> attributes) {
			this.attributes = new ArrayList<>(attributes);
		}

		public FetchMapKey previousKey() {
			List<Attribute<?, ?>> previousAttributes = new ArrayList<>(attributes);
			previousAttributes.remove(attributes.size() - 1);
			return new FetchMapKey(previousAttributes);
		}

		@Override
		public boolean equals(Object o) {
			if (this == o) {
				return true;
			}
			if (!(o instanceof FetchMapKey that)) {
				return false;
			}

			return Objects.equals(attributes, that.attributes);
		}

		@Override
		public int hashCode() {
			return Objects.hash(attributes);
		}

		@Override
		public String toString() {
			List<String> attributeNames = attributes.stream().map(Attribute::getName).collect(Collectors.toList());
			return "FetchMapKey{" + StringUtils.join(attributeNames, '.') + '}';
		}
	}
}