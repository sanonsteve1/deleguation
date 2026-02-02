package com.eburtis.abproject.service;

import com.eburtis.abproject.domain.Entreprise;
import com.eburtis.abproject.domain.Utilisateur;
import com.eburtis.abproject.enums.Role;
import com.eburtis.abproject.presentation.dto.utilisateur.CreateUtilisateurDto;
import com.eburtis.abproject.presentation.dto.utilisateur.UpdateUtilisateurDto;
import com.eburtis.abproject.repository.EntrepriseRepository;
import com.eburtis.abproject.repository.UtilisateurRepository;
import com.eburtis.abproject.service.SecurityService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.eburtis.abproject.service.SecurityService.crypterPassword;

@Service
public class UtilisateurService {

	private final UtilisateurRepository utilisateurRepository;
	private final SecurityService securityService;
	private final EntrepriseRepository entrepriseRepository;

	public UtilisateurService(UtilisateurRepository utilisateurRepository, SecurityService securityService, EntrepriseRepository entrepriseRepository) {
		this.utilisateurRepository = utilisateurRepository;
		this.securityService = securityService;
		this.entrepriseRepository = entrepriseRepository;
	}

	/**
	 * Récupère tous les utilisateurs selon les droits de l'utilisateur connecté
	 * - SUPER_ADMIN : voit tous les utilisateurs
	 * - ADMIN : voit uniquement les utilisateurs de son entreprise
	 * - Autres rôles : ne peuvent pas accéder à cette méthode
	 * 
	 * @return Liste des utilisateurs filtrés selon les droits
	 */
	public List<Utilisateur> getAllUtilisateurs() {
		Utilisateur utilisateurConnecte = securityService.getUtilisateurConnecte();
		
		// SUPER_ADMIN voit tous les utilisateurs
		if (utilisateurConnecte.getRole() == Role.SUPER_ADMIN) {
			return utilisateurRepository.findAll();
		}
		
		// ADMIN voit uniquement les utilisateurs de son entreprise
		if (utilisateurConnecte.getRole() == Role.ADMIN) {
			Entreprise entreprise = utilisateurConnecte.getEntreprise();
			if (entreprise != null) {
				return utilisateurRepository.findByEntreprise(entreprise);
			}
			// Si l'admin n'a pas d'entreprise, retourner une liste vide
			return List.of();
		}
		
		// Par défaut, retourner une liste vide pour les autres rôles
		return List.of();
	}

	/**
	 * Récupère un utilisateur par son ID
	 * 
	 * @param id ID de l'utilisateur
	 * @return L'utilisateur trouvé
	 */
	public Utilisateur getUtilisateurById(Long id) {
		return utilisateurRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID: " + id));
	}

	/**
	 * Crée un nouvel utilisateur
	 * 
	 * @param dto DTO contenant les informations du nouvel utilisateur
	 * @return L'utilisateur créé
	 */
	@Transactional
	public Utilisateur createUtilisateur(CreateUtilisateurDto dto) {
		// Vérifier si le username existe déjà
		if (utilisateurRepository.rechercherParUsername(dto.getUsername()).isPresent()) {
			throw new RuntimeException("Le nom d'utilisateur existe déjà: " + dto.getUsername());
		}

		// Crypter le mot de passe
		String passwordEncrypted = crypterPassword(dto.getPassword());

		// Récupérer l'entreprise si fournie
		Entreprise entreprise = null;
		if (dto.getEntrepriseId() != null) {
			entreprise = entrepriseRepository.findById(dto.getEntrepriseId())
					.orElseThrow(() -> new RuntimeException("Entreprise non trouvée avec l'ID: " + dto.getEntrepriseId()));
		}

		// Créer l'utilisateur
		Utilisateur utilisateur = new Utilisateur(
			dto.getUsername(),
			passwordEncrypted,
			dto.getNom(),
			dto.getPrenoms(),
			dto.getTelephone(),
			dto.getRole(),
			dto.getStatut(),
			entreprise
		);

		return utilisateurRepository.save(utilisateur);
	}

	/**
	 * Met à jour un utilisateur
	 * 
	 * @param id ID de l'utilisateur à mettre à jour
	 * @param dto DTO contenant les nouvelles informations
	 * @return L'utilisateur mis à jour
	 */
	@Transactional
	public Utilisateur updateUtilisateur(Long id, UpdateUtilisateurDto dto) {
		Utilisateur utilisateur = getUtilisateurById(id);

		// Récupérer l'entreprise si fournie
		Entreprise entreprise = null;
		if (dto.getEntrepriseId() != null) {
			entreprise = entrepriseRepository.findById(dto.getEntrepriseId())
					.orElseThrow(() -> new RuntimeException("Entreprise non trouvée avec l'ID: " + dto.getEntrepriseId()));
		}

		// Mettre à jour les champs
		utilisateur.mettreAJourUtilisateur(
			utilisateur.getUsername(), // Le username ne peut pas être modifié
			utilisateur.getPassword(), // Le mot de passe n'est pas modifié ici
			dto.getNom(),
			dto.getPrenoms(),
			dto.getTelephone(),
			dto.getRole(),
			dto.getStatut(),
			entreprise
		);

		return utilisateurRepository.save(utilisateur);
	}

	/**
	 * Supprime un utilisateur
	 * 
	 * @param id ID de l'utilisateur à supprimer
	 */
	@Transactional
	public void deleteUtilisateur(Long id) {
		Utilisateur utilisateur = getUtilisateurById(id);
		utilisateurRepository.delete(utilisateur);
	}
}
