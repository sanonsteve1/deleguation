package com.eburtis.abproject.repository;

import com.eburtis.abproject.domain.Entreprise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EntrepriseRepository extends JpaRepository<Entreprise, Long> {
	
	Optional<Entreprise> findByNom(String nom);
	
	List<Entreprise> findByNomContainingIgnoreCase(String nom);
}
