package com.eburtis.abproject.controller;

import com.eburtis.abproject.configuration.logger.Logged;
import com.eburtis.abproject.domain.Entreprise;
import com.eburtis.abproject.presentation.dto.entreprise.CreateEntrepriseDto;
import com.eburtis.abproject.presentation.dto.entreprise.EntrepriseDto;
import com.eburtis.abproject.presentation.dto.entreprise.UpdateEntrepriseDto;
import com.eburtis.abproject.service.EntrepriseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("${api.prefix}/entreprise")
public class EntrepriseController {

	private final EntrepriseService entrepriseService;

	public EntrepriseController(EntrepriseService entrepriseService) {
		this.entrepriseService = entrepriseService;
	}

	/**
	 * Récupère toutes les entreprises
	 */
	@GetMapping
	@Logged
	public ResponseEntity<List<EntrepriseDto>> getAllEntreprises() {
		List<Entreprise> entreprises = entrepriseService.getAllEntreprises();
		List<EntrepriseDto> dtos = entreprises.stream()
			.map(EntrepriseDto::fromEntreprise)
			.collect(Collectors.toList());
		return ResponseEntity.ok(dtos);
	}

	/**
	 * Récupère une entreprise par son ID
	 */
	@GetMapping("/{id}")
	@Logged
	public ResponseEntity<EntrepriseDto> getEntrepriseById(@PathVariable Long id) {
		Entreprise entreprise = entrepriseService.getEntrepriseById(id);
		return ResponseEntity.ok(EntrepriseDto.fromEntreprise(entreprise));
	}

	/**
	 * Crée une nouvelle entreprise
	 */
	@PostMapping
	@Logged
	public ResponseEntity<EntrepriseDto> createEntreprise(@RequestBody CreateEntrepriseDto dto) {
		Entreprise entreprise = entrepriseService.createEntreprise(dto);
		return ResponseEntity.ok(EntrepriseDto.fromEntreprise(entreprise));
	}

	/**
	 * Met à jour une entreprise
	 */
	@PutMapping("/{id}")
	@Logged
	public ResponseEntity<EntrepriseDto> updateEntreprise(
			@PathVariable Long id,
			@RequestBody UpdateEntrepriseDto dto) {
		Entreprise entreprise = entrepriseService.updateEntreprise(id, dto);
		return ResponseEntity.ok(EntrepriseDto.fromEntreprise(entreprise));
	}

	/**
	 * Supprime une entreprise
	 */
	@DeleteMapping("/{id}")
	@Logged
	public ResponseEntity<Void> deleteEntreprise(@PathVariable Long id) {
		entrepriseService.deleteEntreprise(id);
		return ResponseEntity.noContent().build();
	}
}
