package com.eburtis.abproject.repository;

import com.eburtis.abproject.domain.Statut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StatutRepository extends JpaRepository<Statut, Long> {

	@Query("SELECT s FROM Statut s WHERE s.codeStatut = :codeStatut")
	Optional<Statut> findByCodeStatut(String codeStatut);
}
