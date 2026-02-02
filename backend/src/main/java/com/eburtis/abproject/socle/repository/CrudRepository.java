package com.eburtis.abproject.socle.repository;


import com.eburtis.abproject.domain.AbstractEntity;
import com.eburtis.abproject.socle.exception.EntiteNonConnueException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import org.apache.commons.collections4.CollectionUtils;


import java.util.*;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import java.util.stream.Stream;


import static com.eburtis.abproject.socle.utils.CollectionUtils.isNullOrEmpty;
import static java.util.stream.Collectors.toList;

public interface CrudRepository<T extends AbstractEntity, L extends Number> {

	/**
	 * Le nom par défaut de l'attribut id.
	 */
	String ID_ATTRIBUTE_NAME = "id";

	EntityManager getEntityManager();

	Class<T> getClazz();

	/**
	 * Supprime l'entité : attache l'entité à la session JPA puis réalise la suppression.
	 *
	 * @param objet : l'entité à supprimer
	 */
	default void supprimer(T objet) {
		T entite = getEntityManager().merge(objet);
		getEntityManager().remove(entite);
	}

	/**
	 * Supprime une collection d'entité.
	 *
	 * @param collection la liste d'entité à enregistrer.
	 * @return une liste avec les objets à supprimer.
	 */
	default void supprimerBatch(Collection<T> collection) {
		collection.forEach(this::supprimer);
	}

	/**
	 * Enregistre l'entité.
	 *
	 * @param objet l'entité à enregistrer.
	 * @return l'entité enregistré.
	 */
	default T enregistrer(T objet) {
		T entite = getEntityManager().merge(objet);
		getEntityManager().persist(entite);
		return entite;
	}

	/**
	 * Enregistre une collection d'entités.
	 *
	 * @param collection la liste des entités à enregistrer.
	 * @return une liste avec les objets enregistrés.
	 */
	default List<T> enregistrerBatch(Collection<T> collection) {
		return collection.stream()
				.map(this::enregistrer)
				.collect(toList());
	}

	default T save(T entity) {
		if (entity.isNew()) {
			getEntityManager().persist(entity);
			return entity;
		} else {
			return getEntityManager().merge(entity);
		}
	}

	default TypedQuery<T> listerQueryImpl(QueryOptions<T>... queryOptions) {
		Optional<QueryOptions<T>> optionsOpt = queryOptions != null && queryOptions.length > 0 ? Optional.of(queryOptions[0]) : Optional.empty();

		CriteriaBuilder builder = getEntityManager().getCriteriaBuilder();
		CriteriaQuery<T> query = builder.createQuery(getClazz());
		Root<T> root = query.from(getClazz());

		optionsOpt.ifPresent(options -> options.applyFetchOperations(root));

		TypedQuery<T> typedQuery = getEntityManager().createQuery(query);

		optionsOpt.ifPresent(options -> options.applyHints(typedQuery));

		return typedQuery;
	}

	default Stream<T> lister(QueryOptions<T>... queryOptions) {
		return listerQueryImpl(queryOptions).getResultStream().distinct();
	}

	default List<T> listerEnList(QueryOptions<T>... queryOptions) {
		return listerQueryImpl(queryOptions).getResultList().stream().distinct().collect(toList());
	}

	default Optional<T> findByImpl(long id, QueryOptions<T>... queryOptions) {
		Optional<QueryOptions<T>> optionsOpt = queryOptions != null && queryOptions.length > 0 ? Optional.of(queryOptions[0]) : Optional.empty();

		CriteriaBuilder builder = getEntityManager().getCriteriaBuilder();
		CriteriaQuery<T> query = builder.createQuery(getClazz());
		Root<T> root = query.from(getClazz());

		optionsOpt.ifPresent(options -> options.applyFetchOperations(root));

		query.where(builder.equal(root.get(ID_ATTRIBUTE_NAME), id));

		TypedQuery<T> typedQuery = getEntityManager().createQuery(query);

		optionsOpt.ifPresent(options -> options.applyHints(typedQuery));

// avec les FetchOperations, il se peut que le résultat retourné soit démultiplié
// dans tous les cas, on ne retourne que le 1er élément
		Supplier<Stream<T>> results = () -> typedQuery.getResultStream();
		if (!results.get().findAny().isPresent()) {
			if (optionsOpt.isPresent() && optionsOpt.get().isObligatoire()) {
				throw entiteNonTrouveeParId(id);
			}
			return Optional.empty();
		}
		return results.get().findFirst();
	}

	default Optional<T> findById(long id, QueryOptions<T>... queryOptions) {
		return findByImpl(id, queryOptions);
	}

	default Map<Long, T> findByIds(Collection<Long> ids, QueryOptions<T>... queryOptions) {
		if (isNullOrEmpty(ids)) {
			return Collections.emptyMap();
		}

		Optional<QueryOptions<T>> optionsOpt = queryOptions != null && queryOptions.length > 0 ? Optional.of(queryOptions[0]) : Optional.empty();

		CriteriaBuilder builder = getEntityManager().getCriteriaBuilder();
		CriteriaQuery<T> query = builder.createQuery(getClazz());
		Root<T> root = query.from(getClazz());

		optionsOpt.ifPresent(options -> options.applyFetchOperations(root));

		query.where(root.get(ID_ATTRIBUTE_NAME).in(ids));

		TypedQuery<T> typedQuery = getEntityManager().createQuery(query);

		optionsOpt.ifPresent(options -> options.applyHints(typedQuery));

// avec les FetchOperations, il se peut que le résultat retourné soit démultiplié
// dans tous les cas, on ne retourne que le 1er élément
		Set<T> results = typedQuery.getResultStream().collect(Collectors.toSet());
		if (optionsOpt.isPresent() && optionsOpt.get().isObligatoire() && ids.size() != results.size()) {
			Collection<Long> differences = CollectionUtils.subtract(ids, results.stream().map(T::getId).collect(Collectors.toSet()));
			throw entitesNonTrouveesParIds(differences);
		}
		return results.stream().collect(Collectors.toMap(T::getId, Function.identity()));
	}

	default T findByIdObligatoire(long id, QueryOptions<T>... queryOptions) {
		Optional<T> entityOpt = findByImpl(id, queryOptions);
		return entityOpt.orElseThrow(() -> entiteNonTrouveeParId(id));
	}

	default EntiteNonConnueException entiteNonTrouveeParId(long id) {
		return new EntiteNonConnueException("Aucun résultat trouvé pour l'id %s", id);
	}

	default EntiteNonConnueException entitesNonTrouveesParIds(Collection<Long> ids) {
		return new EntiteNonConnueException("Aucun résultat trouvé pour les ids %s", ids.stream().map(Object::toString).collect(Collectors.joining(", ")));
	}

	default void delete(long entityId) {
		getEntityManager().remove(
				getEntityManager().find(getClazz(), entityId)
		);
	}

	default void delete(T entity) {
		getEntityManager().remove(entity);
	}

	default void flush() {
		getEntityManager().flush();
	}

	default void flushAndClear() {
		getEntityManager().flush();
		getEntityManager().clear();
	}
}
