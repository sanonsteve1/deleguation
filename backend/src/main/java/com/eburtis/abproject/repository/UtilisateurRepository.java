package com.eburtis.abproject.repository;

import com.eburtis.abproject.domain.Entreprise;
import com.eburtis.abproject.domain.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

	@Query("SELECT u FROM Utilisateur u WHERE trim(both from u.username) = :username")
	Optional<Utilisateur> rechercherParUsername(String username);

	/**
	 * Récupère tous les utilisateurs d'une entreprise
	 */
	List<Utilisateur> findByEntreprise(Entreprise entreprise);
}
