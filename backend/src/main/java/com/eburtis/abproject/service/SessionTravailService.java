package com.eburtis.abproject.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eburtis.abproject.domain.Entreprise;
import com.eburtis.abproject.domain.SessionTravail;
import com.eburtis.abproject.domain.Utilisateur;
import com.eburtis.abproject.repository.SessionTravailRepository;
import com.eburtis.abproject.repository.UtilisateurRepository;
import com.eburtis.abproject.security.SecurityUtils;

@Service
public class SessionTravailService {

	private final SessionTravailRepository sessionTravailRepository;
	private final UtilisateurRepository utilisateurRepository;

	public SessionTravailService(SessionTravailRepository sessionTravailRepository, 
								 UtilisateurRepository utilisateurRepository) {
		this.sessionTravailRepository = sessionTravailRepository;
		this.utilisateurRepository = utilisateurRepository;
	}

	/**
	 * Démarre une nouvelle session de travail pour l'utilisateur connecté
	 * 
	 * @param latitude Latitude de la position de départ
	 * @param longitude Longitude de la position de départ
	 * @return La session créée
	 */
	@Transactional
	public SessionTravail demarrerSession(Double latitude, Double longitude) {
		String username = SecurityUtils.lireLoginUtilisateurConnecte();
		Utilisateur utilisateur = utilisateurRepository.rechercherParUsername(username)
				.orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

		// Vérifier qu'il n'y a pas déjà une session en cours
		Optional<SessionTravail> sessionEnCours = sessionTravailRepository.findSessionEnCours(utilisateur);
		if (sessionEnCours.isPresent()) {
			throw new IllegalStateException("Une session est déjà en cours pour cet utilisateur");
		}

		SessionTravail session = new SessionTravail(utilisateur, LocalDateTime.now(), latitude, longitude);
		// Marquer comme synchronisée car créée depuis l'API mobile
		session.setSynchronise(true);
		return sessionTravailRepository.save(session);
	}

	/**
	 * Arrête la session de travail en cours pour l'utilisateur connecté
	 * 
	 * @param latitude Latitude de la position d'arrêt
	 * @param longitude Longitude de la position d'arrêt
	 * @return La session clôturée
	 */
	@Transactional
	public SessionTravail arreterSession(Double latitude, Double longitude) {
		String username = SecurityUtils.lireLoginUtilisateurConnecte();
		Utilisateur utilisateur = utilisateurRepository.rechercherParUsername(username)
				.orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

		SessionTravail session = sessionTravailRepository.findSessionEnCours(utilisateur)
				.orElseThrow(() -> new RuntimeException("Aucune session en cours pour cet utilisateur"));

		session.cloreSession(LocalDateTime.now(), latitude, longitude);
		// Marquer comme synchronisée car arrêtée depuis l'API mobile
		session.setSynchronise(true);
		return sessionTravailRepository.save(session);
	}

	/**
	 * Récupère la session en cours pour l'utilisateur connecté
	 * 
	 * @return La session en cours ou null
	 */
	public Optional<SessionTravail> getSessionEnCours() {
		String username = SecurityUtils.lireLoginUtilisateurConnecte();
		Utilisateur utilisateur = utilisateurRepository.rechercherParUsername(username)
				.orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

		return sessionTravailRepository.findSessionEnCours(utilisateur);
	}

	/**
	 * Récupère l'historique des sessions pour l'utilisateur connecté
	 * - SUPER_ADMIN : voit toutes les sessions
	 * - ADMIN : voit uniquement les sessions des agents de son entreprise
	 * - Autres utilisateurs : voient uniquement leurs sessions
	 * 
	 * @return Liste des sessions triées par date décroissante
	 */
	public List<SessionTravail> getHistoriqueSessions() {
		String username = SecurityUtils.lireLoginUtilisateurConnecte();
		Utilisateur utilisateur = utilisateurRepository.rechercherParUsername(username)
				.orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec le username: " + username));

		System.out.println("=== DEBUG getHistoriqueSessions ===");
		System.out.println("Username: " + username);
		System.out.println("Rôle utilisateur: " + utilisateur.getRole());
		System.out.println("Est ADMIN: " + (utilisateur.getRole() == com.eburtis.abproject.enums.Role.ADMIN));
		System.out.println("Est SUPER_ADMIN: " + (utilisateur.getRole() == com.eburtis.abproject.enums.Role.SUPER_ADMIN));

		// SUPER_ADMIN voit toutes les sessions
		if (utilisateur.getRole() == com.eburtis.abproject.enums.Role.SUPER_ADMIN) {
			// Utiliser une requête avec JOIN FETCH pour initialiser les relations lazy
			List<SessionTravail> toutesSessions = sessionTravailRepository.findAllWithUtilisateurAndEntreprise();
			System.out.println("Nombre total de sessions trouvées: " + toutesSessions.size());
			return toutesSessions;
		}

		// ADMIN voit uniquement les sessions des agents de son entreprise
		if (utilisateur.getRole() == com.eburtis.abproject.enums.Role.ADMIN) {
			Entreprise entreprise = utilisateur.getEntreprise();
			if (entreprise != null) {
				List<SessionTravail> sessionsEntreprise = sessionTravailRepository.findByEntreprise(entreprise);
				System.out.println("Nombre de sessions pour l'entreprise " + entreprise.getNom() + ": " + sessionsEntreprise.size());
				return sessionsEntreprise;
			}
			// Si l'admin n'a pas d'entreprise, retourner une liste vide
			System.out.println("Admin sans entreprise, retour d'une liste vide");
			return List.of();
		}

		// Autres utilisateurs voient uniquement leurs sessions
		List<SessionTravail> sessionsUtilisateur = sessionTravailRepository.findByUtilisateurOrderByHeureDebutDesc(utilisateur);
		System.out.println("Nombre de sessions pour l'utilisateur: " + sessionsUtilisateur.size());
		return sessionsUtilisateur;
	}

	/**
	 * Récupère les sessions non synchronisées
	 * 
	 * @return Liste des sessions non synchronisées
	 */
	public List<SessionTravail> getSessionsNonSynchronisees() {
		return sessionTravailRepository.findNonSynchronisees();
	}

	/**
	 * Marque une session comme synchronisée
	 * 
	 * @param sessionId ID de la session
	 */
	@Transactional
	public void marquerCommeSynchronisee(Long sessionId) {
		SessionTravail session = sessionTravailRepository.findById(sessionId)
				.orElseThrow(() -> new RuntimeException("Session non trouvée"));
		session.setSynchronise(true);
		sessionTravailRepository.save(session);
	}
}
