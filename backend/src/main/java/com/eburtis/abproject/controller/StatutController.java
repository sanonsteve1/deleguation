package com.eburtis.abproject.controller;

import com.eburtis.abproject.configuration.logger.Logged;
import com.eburtis.abproject.domain.Statut;
import com.eburtis.abproject.service.StatutService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/statuts")
public class StatutController {

	private final StatutService statutService;

	public StatutController(StatutService statutService) {
		this.statutService = statutService;
	}

	/**
	 * Récupère tous les statuts disponibles
	 */
	@GetMapping
	@Logged
	public ResponseEntity<List<Statut>> getAllStatuts() {
		List<Statut> statuts = statutService.getAllStatuts();
		return ResponseEntity.ok(statuts);
	}

	/**
	 * Récupère un statut par son code
	 */
	@GetMapping("/{codeStatut}")
	@Logged
	public ResponseEntity<Statut> getStatutByCode(@PathVariable String codeStatut) {
		Statut statut = statutService.getStatutByCode(codeStatut);
		return ResponseEntity.ok(statut);
	}
}
