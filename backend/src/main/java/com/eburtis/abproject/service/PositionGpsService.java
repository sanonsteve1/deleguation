package com.eburtis.abproject.service;

import com.eburtis.abproject.domain.PositionGps;
import com.eburtis.abproject.domain.SessionTravail;
import com.eburtis.abproject.exception.configuration.EntiteNonConnueException;
import com.eburtis.abproject.repository.PositionGpsRepository;
import com.eburtis.abproject.repository.SessionTravailRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
public class PositionGpsService {

	private final PositionGpsRepository positionGpsRepository;
	private final SessionTravailRepository sessionTravailRepository;

	public PositionGpsService(PositionGpsRepository positionGpsRepository, 
							  SessionTravailRepository sessionTravailRepository) {
		this.positionGpsRepository = positionGpsRepository;
		this.sessionTravailRepository = sessionTravailRepository;
	}

	/**
	 * Enregistre une position GPS pour une session de travail
	 * 
	 * @param sessionId ID de la session
	 * @param latitude Latitude
	 * @param longitude Longitude
	 * @param precision Précision GPS (optionnel)
	 * @return La position enregistrée
	 */
	@Transactional
	public PositionGps enregistrerPosition(Long sessionId, Double latitude, Double longitude, Double precision) {
		SessionTravail session = sessionTravailRepository.findById(sessionId)
				.orElseThrow(() -> new EntiteNonConnueException("Session non trouvée avec l'ID: " + sessionId, Collections.singletonList(String.valueOf(sessionId))));

		if (!session.estEnCours()) {
			throw new IllegalStateException("Impossible d'enregistrer une position : la session avec l'ID " + sessionId + " est déjà clôturée.");
		}

		PositionGps position = new PositionGps(session, LocalDateTime.now(), latitude, longitude, precision);
		// Marquer comme synchronisée car créée depuis l'API mobile
		position.setSynchronise(true);
		return positionGpsRepository.save(position);
	}

	/**
	 * Récupère toutes les positions GPS d'une session
	 * 
	 * @param sessionId ID de la session
	 * @return Liste des positions triées par timestamp
	 */
	public List<PositionGps> getPositionsParSession(Long sessionId) {
		SessionTravail session = sessionTravailRepository.findById(sessionId)
				.orElseThrow(() -> new RuntimeException("Session non trouvée"));

		return positionGpsRepository.findBySessionTravailOrderByTimestamp(session);
	}

	/**
	 * Récupère les positions non synchronisées
	 * 
	 * @return Liste des positions non synchronisées
	 */
	public List<PositionGps> getPositionsNonSynchronisees() {
		return positionGpsRepository.findNonSynchronisees();
	}

	/**
	 * Marque une position comme synchronisée
	 * 
	 * @param positionId ID de la position
	 */
	@Transactional
	public void marquerCommeSynchronisee(Long positionId) {
		PositionGps position = positionGpsRepository.findById(positionId)
				.orElseThrow(() -> new RuntimeException("Position non trouvée"));
		position.setSynchronise(true);
		positionGpsRepository.save(position);
	}
}
