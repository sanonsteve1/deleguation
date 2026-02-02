package com.eburtis.abproject.repository;

import com.eburtis.abproject.domain.PositionGps;
import com.eburtis.abproject.domain.SessionTravail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PositionGpsRepository extends JpaRepository<PositionGps, Long> {

	@Query("SELECT p FROM PositionGps p WHERE p.sessionTravail = :session ORDER BY p.timestamp ASC")
	List<PositionGps> findBySessionTravailOrderByTimestamp(@Param("session") SessionTravail sessionTravail);

	@Query("SELECT p FROM PositionGps p WHERE p.synchronise = false")
	List<PositionGps> findNonSynchronisees();

	@Query("SELECT p FROM PositionGps p WHERE p.sessionTravail = :session AND p.timestamp >= :timestamp ORDER BY p.timestamp ASC")
	List<PositionGps> findBySessionTravailAndTimestampAfter(@Param("session") SessionTravail sessionTravail, 
															 @Param("timestamp") java.time.LocalDateTime timestamp);
}
