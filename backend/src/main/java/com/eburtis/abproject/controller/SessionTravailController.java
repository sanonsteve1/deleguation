package com.eburtis.abproject.controller;

import com.eburtis.abproject.configuration.logger.Logged;
import com.eburtis.abproject.domain.SessionTravail;
import com.eburtis.abproject.presentation.dto.session.ArreterSessionDto;
import com.eburtis.abproject.presentation.dto.session.DemarrerSessionDto;
import com.eburtis.abproject.service.SessionTravailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("${api.prefix}/sessions")
public class SessionTravailController {

	private final SessionTravailService sessionTravailService;

	public SessionTravailController(SessionTravailService sessionTravailService) {
		this.sessionTravailService = sessionTravailService;
	}

	/**
	 * Démarre une nouvelle session de travail
	 * RQ-02 : Pointage de démarrage (Horodatage + GPS)
	 */
	@PostMapping("/demarrer")
	@Logged
	public ResponseEntity<SessionTravail> demarrerSession(@RequestBody DemarrerSessionDto dto) {
		SessionTravail session = sessionTravailService.demarrerSession(dto.getLatitude(), dto.getLongitude());
		return ResponseEntity.ok(session);
	}

	/**
	 * Arrête la session de travail en cours
	 * RQ-03 : Pointage d'arrêt (Clôture de session)
	 */
	@PostMapping("/arreter")
	@Logged
	public ResponseEntity<SessionTravail> arreterSession(@RequestBody ArreterSessionDto dto) {
		SessionTravail session = sessionTravailService.arreterSession(dto.getLatitude(), dto.getLongitude());
		return ResponseEntity.ok(session);
	}

	/**
	 * Récupère la session en cours
	 */
	@GetMapping("/en-cours")
	@Logged
	public ResponseEntity<SessionTravail> getSessionEnCours() {
		Optional<SessionTravail> session = sessionTravailService.getSessionEnCours();
		return session.map(ResponseEntity::ok)
				.orElse(ResponseEntity.noContent().build());
	}

	/**
	 * Récupère l'historique des sessions
	 * RQ-06 : Mode Hors Ligne avec synchronisation automatique
	 */
	@GetMapping("/historique")
	@Logged
	public ResponseEntity<List<SessionTravail>> getHistorique() {
		List<SessionTravail> sessions = sessionTravailService.getHistoriqueSessions();
		return ResponseEntity.ok(sessions);
	}
}
