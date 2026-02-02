package com.eburtis.abproject.repository;

import com.eburtis.abproject.domain.Entreprise;
import com.eburtis.abproject.domain.SessionTravail;
import com.eburtis.abproject.domain.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionTravailRepository extends JpaRepository<SessionTravail, Long> {

	@Query("SELECT s FROM SessionTravail s WHERE s.utilisateur = :utilisateur AND s.heureFin IS NULL")
	Optional<SessionTravail> findSessionEnCours(@Param("utilisateur") Utilisateur utilisateur);

	@Query("SELECT s FROM SessionTravail s LEFT JOIN FETCH s.utilisateur u LEFT JOIN FETCH u.entreprise WHERE s.utilisateur = :utilisateur ORDER BY s.heureDebut DESC")
	List<SessionTravail> findByUtilisateurOrderByHeureDebutDesc(@Param("utilisateur") Utilisateur utilisateur);

	@Query("SELECT s FROM SessionTravail s LEFT JOIN FETCH s.utilisateur u LEFT JOIN FETCH u.entreprise ORDER BY s.heureDebut DESC")
	List<SessionTravail> findAllWithUtilisateurAndEntreprise();

	@Query("SELECT s FROM SessionTravail s LEFT JOIN FETCH s.utilisateur u LEFT JOIN FETCH u.entreprise WHERE u.entreprise = :entreprise ORDER BY s.heureDebut DESC")
	List<SessionTravail> findByEntreprise(@Param("entreprise") Entreprise entreprise);

	@Query("SELECT s FROM SessionTravail s WHERE s.synchronise = false")
	List<SessionTravail> findNonSynchronisees();

	@Query("SELECT s FROM SessionTravail s WHERE s.utilisateur = :utilisateur AND s.heureDebut >= :dateDebut AND s.heureDebut <= :dateFin ORDER BY s.heureDebut DESC")
	List<SessionTravail> findByUtilisateurAndPeriode(@Param("utilisateur") Utilisateur utilisateur, 
													  @Param("dateDebut") LocalDateTime dateDebut, 
													  @Param("dateFin") LocalDateTime dateFin);
}
