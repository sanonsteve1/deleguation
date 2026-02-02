package com.eburtis.abproject.socle.repository;

import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.Root;
import org.hibernate.jpa.QueryHints;


import java.util.Arrays;
import java.util.Objects;

public class QueryOptions<T> {

	private FetchOperation<T>[] fetchOperations;

	private boolean obligatoire;

	private boolean hintReadOnly;

	private boolean hintQueryCache;

	private String queryCacheRegion;


	public static <T> QueryOptions<T> builder() {

		return new QueryOptions<>();

	}


	public boolean hasFetchOperations() {

		return fetchOperations != null && fetchOperations.length > 0;

	}


	public boolean applyFetchOperations(Root<T> root) {

		if (this.hasFetchOperations()) {

			return FetchBuilder.buildFetchs(root, this.getFetchOperations());

		}

		return false;

	}


	public void applyHints(TypedQuery<T> typedQuery) {

		if (this.isQueryCache()) {

			typedQuery.setHint(QueryHints.HINT_CACHEABLE, true);


			if (this.queryCacheRegion != null) {

				typedQuery.setHint(QueryHints.HINT_CACHE_REGION, queryCacheRegion);

			}

		}

		if (this.isReadOnly()) {

			typedQuery.setHint(QueryHints.HINT_READONLY, true);

		}

	}


	public QueryOptions<T> useObligatoire() {

		this.obligatoire = true;

		return this;

	}


	public QueryOptions<T> useReadOnly() {

		this.hintReadOnly = true;

		return this;

	}


	public QueryOptions<T> useQueryCache() {

		this.hintQueryCache = true;

		return this;

	}


	public QueryOptions<T> useQueryCacheRegion(String region) {

		this.queryCacheRegion = region;

		return this;

	}


	public FetchOperation<T>[] getFetchOperations() {

		return fetchOperations;

	}


	public QueryOptions<T> setFetchOperations(FetchOperation<T>... fetchOperations) {

		this.fetchOperations = fetchOperations;

		return this;

	}


	public boolean isObligatoire() {

		return obligatoire;

	}


	public boolean isReadOnly() {

		return hintReadOnly;

	}


	public boolean isQueryCache() {

		return hintQueryCache;

	}


	@Override

	public boolean equals(Object o) {

		if (this == o) {

			return true;

		}

		if (!(o instanceof QueryOptions<?> that)) {

			return false;

		}


		if (obligatoire != that.obligatoire) {

			return false;

		}

		if (hintReadOnly != that.hintReadOnly) {

			return false;

		}

		if (hintQueryCache != that.hintQueryCache) {

			return false;

		}

		// Probably incorrect - comparing Object[] arrays with Arrays.equals

		return Objects.equals(queryCacheRegion, that.queryCacheRegion) && Arrays.equals(fetchOperations, that.fetchOperations);

	}


	@Override

	public int hashCode() {

		int result = Arrays.hashCode(fetchOperations);

		result = 31 * result + Objects.hashCode(queryCacheRegion);

		result = 31 * result + (obligatoire ? 1 : 0);

		result = 31 * result + (hintReadOnly ? 1 : 0);

		result = 31 * result + (hintQueryCache ? 1 : 0);

		return result;

	}
}
