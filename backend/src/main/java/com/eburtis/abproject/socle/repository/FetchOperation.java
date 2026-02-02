package com.eburtis.abproject.socle.repository;


import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.metamodel.Attribute;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static jakarta.persistence.criteria.JoinType.INNER;
import static java.util.Arrays.asList;
import static java.util.Collections.unmodifiableList;


/**
 * Opération de fetch à effectuer.
 *
 * @param <T> le type de donnée à partir de laquelle on effectue un fetch.
 */
public class FetchOperation<T> {

	/**
	 * Type de jointure par défaut.
	 * Il est identique à celui utilisé par JPA.
	 */
	static final JoinType DEFAULT_JOIN = INNER;

	private final JoinType joinType;
	private final List<Attribute<?, ?>> attributes;

	/**
	 * Crée une FetchOperation avec une jointure de type {@link JoinType#INNER}.
	 *
	 * @param attribute        l'attribut sur lequel sera effectué le fetch.
	 * @param nestedAttributes les attributs relatifs à attribute sur lesquels seront successivement effectués les fetchs. (Optionnel).
	 */
	public FetchOperation(Attribute<? super T, ?> attribute, Attribute<?, ?>... nestedAttributes) {
		this(DEFAULT_JOIN, attribute, nestedAttributes);
	}

	/**
	 * Crée une FetchOperation.
	 *
	 * @param joinType         le type de jointure.
	 * @param attribute        l'attribut sur lequel sera effectué le fetch.
	 * @param nestedAttributes les attributs relatifs à attribute sur lesquels seront successivement effectués les fetchs. (Optionnel).
	 */
	public FetchOperation(JoinType joinType, Attribute<? super T, ?> attribute, Attribute<?, ?>... nestedAttributes) {
		this.joinType = joinType;
		this.attributes = new ArrayList<>(1 + nestedAttributes.length);
		this.attributes.add(attribute);
		this.attributes.addAll(asList(nestedAttributes));
	}

	public JoinType getJoinType() {
		return joinType;
	}

	public List<Attribute<?, ?>> getAttributes() {
		return unmodifiableList(attributes);
	}

	Attribute<? super T, ?> getFirstAttribute() {
		return (Attribute<? super T, ?>) attributes.get(0);
	}

	List<Attribute<?, ?>> getNestedAttributes() {
		return unmodifiableList(attributes.subList(1, attributes.size()));
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) {
			return true;
		}
		if (!(o instanceof FetchOperation that)) {
			return false;
		}
		return Objects.equals(attributes, that.attributes) && Objects.equals(joinType, that.joinType);
	}

	@Override
	public int hashCode() {
		return Objects.hash(attributes, joinType);
	}

	public static class FetchOperationBuilder<T> {

		private final JoinType joinType;
		private final Attribute<? super T, ?> firstAttribute;
		private final List<Attribute<?, ?>> nestedAttributes;

		public FetchOperationBuilder(JoinType joinType, Attribute<? super T, ?> firstAttribute) {
			this.joinType = joinType;
			this.firstAttribute = firstAttribute;
			this.nestedAttributes = new ArrayList<>();
		}

		public FetchOperationBuilder<T> addAttribute(Attribute<?, ?> attribute) {
			this.nestedAttributes.add(attribute);
			return this;
		}

		public FetchOperationBuilder<T> addAttributes(List<Attribute<?, ?>> attributes) {
			this.nestedAttributes.addAll(attributes);
			return this;
		}

		public FetchOperationBuilder<T> addAttributes(Attribute<?, ?>... attributes) {
			addAttributes(asList(attributes));
			return this;
		}

		public FetchOperation<T> build() {
			Attribute<?, ?>[] attributes = new Attribute<?, ?>[nestedAttributes.size()];
			nestedAttributes.toArray(attributes);
			return new FetchOperation<>(joinType, firstAttribute, attributes);
		}
	}
}