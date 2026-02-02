package com.eburtis.abproject.service;

import com.eburtis.abproject.domain.Statut;
import com.eburtis.abproject.repository.StatutRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StatutService {

	private final StatutRepository statutRepository;

	public StatutService(StatutRepository statutRepository) {
		this.statutRepository = statutRepository;
	}

	/**
	 * Récupère tous les statuts disponibles
	 * 
	 * @return Liste de tous les statuts
	 */
	public List<Statut> getAllStatuts() {
		return statutRepository.findAll();
	}

	/**
	 * Récupère un statut par son code
	 * 
	 * @param codeStatut Code du statut
	 * @return Le statut trouvé
	 */
	public Statut getStatutByCode(String codeStatut) {
		return statutRepository.findByCodeStatut(codeStatut)
				.orElseThrow(() -> new RuntimeException("Statut non trouvé: " + codeStatut));
	}
}
