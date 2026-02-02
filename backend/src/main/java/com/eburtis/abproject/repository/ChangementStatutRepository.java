package com.eburtis.abproject.repository;

import com.eburtis.abproject.domain.ChangementStatut;
import com.eburtis.abproject.domain.SessionTravail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChangementStatutRepository extends JpaRepository<ChangementStatut, Long> {

	@Query("SELECT c FROM ChangementStatut c WHERE c.sessionTravail = :session ORDER BY c.timestamp ASC")
	List<ChangementStatut> findBySessionTravailOrderByTimestamp(@Param("session") SessionTravail sessionTravail);

	@Query("SELECT c FROM ChangementStatut c WHERE c.synchronise = false")
	List<ChangementStatut> findNonSynchronisees();

	@Query("SELECT c FROM ChangementStatut c WHERE c.sessionTravail = :session ORDER BY c.timestamp DESC")
	List<ChangementStatut> findDernierChangementStatut(@Param("session") SessionTravail sessionTravail);
}
