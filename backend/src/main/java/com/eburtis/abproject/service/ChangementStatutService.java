package com.eburtis.abproject.service;

import com.eburtis.abproject.domain.ChangementStatut;
import com.eburtis.abproject.domain.SessionTravail;
import com.eburtis.abproject.domain.Statut;
import com.eburtis.abproject.repository.ChangementStatutRepository;
import com.eburtis.abproject.repository.SessionTravailRepository;
import com.eburtis.abproject.repository.StatutRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChangementStatutService {

	private final ChangementStatutRepository changementStatutRepository;
	private final SessionTravailRepository sessionTravailRepository;
	private final StatutRepository statutRepository;

	public ChangementStatutService(ChangementStatutRepository changementStatutRepository,
								   SessionTravailRepository sessionTravailRepository,
								   StatutRepository statutRepository) {
		this.changementStatutRepository = changementStatutRepository;
		this.sessionTravailRepository = sessionTravailRepository;
		this.statutRepository = statutRepository;
	}

	/**
	 * Enregistre un changement de statut pour une session
	 * 
	 * @param sessionId ID de la session
	 * @param codeStatut Code du statut
	 * @return Le changement de statut enregistré avec les relations chargées
	 */
	@Transactional
	public ChangementStatut changerStatut(Long sessionId, String codeStatut) {
		SessionTravail session = sessionTravailRepository.findById(sessionId)
				.orElseThrow(() -> new RuntimeException("Session non trouvée avec l'ID: " + sessionId));

		if (!session.estEnCours()) {
			throw new IllegalStateException("Impossible de changer de statut : la session avec l'ID " + sessionId + " est déjà clôturée. Veuillez démarrer une nouvelle session.");
		}

		if (codeStatut == null || codeStatut.trim().isEmpty()) {
			throw new IllegalArgumentException("Le code du statut ne peut pas être vide");
		}
		
		String codeStatutNormalise = codeStatut.trim();
		Statut statut = statutRepository.findByCodeStatut(codeStatutNormalise)
				.orElseThrow(() -> new RuntimeException("Statut non trouvé avec le code: '" + codeStatutNormalise + "'. Vérifiez que le code existe dans la base de données."));

		ChangementStatut changement = new ChangementStatut(session, statut, LocalDateTime.now());
		// Marquer comme synchronisé car créé depuis l'API mobile
		changement.setSynchronise(true);
		changement = changementStatutRepository.save(changement);
		
		// S'assurer que les relations sont chargées avant de retourner
		// En accédant aux getters, nous forçons le chargement des relations lazy
		changement.getSessionTravail().getId();
		changement.getStatut().getId();
		
		return changement;
	}

	/**
	 * Récupère tous les changements de statut d'une session
	 * 
	 * @param sessionId ID de la session
	 * @return Liste des changements triés par timestamp
	 */
	public List<ChangementStatut> getChangementsParSession(Long sessionId) {
		SessionTravail session = sessionTravailRepository.findById(sessionId)
				.orElseThrow(() -> new RuntimeException("Session non trouvée"));

		return changementStatutRepository.findBySessionTravailOrderByTimestamp(session);
	}

	/**
	 * Récupère les changements non synchronisés
	 * 
	 * @return Liste des changements non synchronisés
	 */
	public List<ChangementStatut> getChangementsNonSynchronises() {
		return changementStatutRepository.findNonSynchronisees();
	}

	/**
	 * Marque un changement comme synchronisé
	 * 
	 * @param changementId ID du changement
	 */
	@Transactional
	public void marquerCommeSynchronise(Long changementId) {
		ChangementStatut changement = changementStatutRepository.findById(changementId)
				.orElseThrow(() -> new RuntimeException("Changement non trouvé"));
		changement.setSynchronise(true);
		changementStatutRepository.save(changement);
	}
}
