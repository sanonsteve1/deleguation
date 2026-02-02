package com.eburtis.abproject.service;

import com.eburtis.abproject.domain.Entreprise;
import com.eburtis.abproject.presentation.dto.entreprise.CreateEntrepriseDto;
import com.eburtis.abproject.presentation.dto.entreprise.UpdateEntrepriseDto;
import com.eburtis.abproject.repository.EntrepriseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EntrepriseService {

	private final EntrepriseRepository entrepriseRepository;

	public EntrepriseService(EntrepriseRepository entrepriseRepository) {
		this.entrepriseRepository = entrepriseRepository;
	}

	/**
	 * Récupère toutes les entreprises
	 * 
	 * @return Liste de toutes les entreprises
	 */
	public List<Entreprise> getAllEntreprises() {
		return entrepriseRepository.findAll();
	}

	/**
	 * Récupère une entreprise par son ID
	 * 
	 * @param id ID de l'entreprise
	 * @return L'entreprise trouvée
	 */
	public Entreprise getEntrepriseById(Long id) {
		return entrepriseRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Entreprise non trouvée avec l'ID: " + id));
	}

	/**
	 * Crée une nouvelle entreprise
	 * 
	 * @param dto DTO contenant les informations de la nouvelle entreprise
	 * @return L'entreprise créée
	 */
	@Transactional
	public Entreprise createEntreprise(CreateEntrepriseDto dto) {
		// Vérifier si le nom existe déjà
		if (entrepriseRepository.findByNom(dto.getNom()).isPresent()) {
			throw new RuntimeException("Une entreprise avec ce nom existe déjà: " + dto.getNom());
		}

		Entreprise entreprise = new Entreprise(
			dto.getNom(),
			dto.getDescription(),
			dto.getAdresse(),
			dto.getTelephone(),
			dto.getEmail()
		);

		return entrepriseRepository.save(entreprise);
	}

	/**
	 * Met à jour une entreprise
	 * 
	 * @param id ID de l'entreprise à mettre à jour
	 * @param dto DTO contenant les nouvelles informations
	 * @return L'entreprise mise à jour
	 */
	@Transactional
	public Entreprise updateEntreprise(Long id, UpdateEntrepriseDto dto) {
		Entreprise entreprise = getEntrepriseById(id);

		// Vérifier si le nouveau nom existe déjà (sauf pour cette entreprise)
		if (dto.getNom() != null && !dto.getNom().equals(entreprise.getNom())) {
			entrepriseRepository.findByNom(dto.getNom())
				.ifPresent(e -> {
					if (!e.getId().equals(id)) {
						throw new RuntimeException("Une entreprise avec ce nom existe déjà: " + dto.getNom());
					}
				});
		}

		entreprise.setNom(dto.getNom());
		entreprise.setDescription(dto.getDescription());
		entreprise.setAdresse(dto.getAdresse());
		entreprise.setTelephone(dto.getTelephone());
		entreprise.setEmail(dto.getEmail());

		return entrepriseRepository.save(entreprise);
	}

	/**
	 * Supprime une entreprise
	 * 
	 * @param id ID de l'entreprise à supprimer
	 */
	@Transactional
	public void deleteEntreprise(Long id) {
		Entreprise entreprise = getEntrepriseById(id);
		entrepriseRepository.delete(entreprise);
	}
}
