package com.eburtis.abproject.controller;

import com.eburtis.abproject.configuration.logger.Logged;
import com.eburtis.abproject.domain.ChangementStatut;
import com.eburtis.abproject.presentation.dto.session.ChangementStatutDto;
import com.eburtis.abproject.presentation.dto.session.ChangementStatutResponseDto;
import com.eburtis.abproject.service.ChangementStatutService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("${api.prefix}/changements-statut")
public class ChangementStatutController {

	private final ChangementStatutService changementStatutService;

	public ChangementStatutController(ChangementStatutService changementStatutService) {
		this.changementStatutService = changementStatutService;
	}

	/**
	 * Change le statut d'une session
	 * RQ-05 : Gestion des statuts (Pause, Client, etc.)
	 */
	@PostMapping
	@Logged
	public ResponseEntity<ChangementStatutResponseDto> changerStatut(@RequestBody ChangementStatutDto dto) {
		ChangementStatut changement = changementStatutService.changerStatut(dto.getSessionId(), dto.getCodeStatut());
		return ResponseEntity.ok(ChangementStatutResponseDto.fromChangementStatut(changement));
	}

	/**
	 * Récupère tous les changements de statut d'une session
	 */
	@GetMapping("/session/{sessionId}")
	@Logged
	public ResponseEntity<List<ChangementStatutResponseDto>> getChangementsParSession(@PathVariable Long sessionId) {
		List<ChangementStatut> changements = changementStatutService.getChangementsParSession(sessionId);
		List<ChangementStatutResponseDto> dtos = changements.stream()
			.map(ChangementStatutResponseDto::fromChangementStatut)
			.collect(Collectors.toList());
		return ResponseEntity.ok(dtos);
	}
}
