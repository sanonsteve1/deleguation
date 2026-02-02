package com.eburtis.abproject.controller;

import com.eburtis.abproject.configuration.logger.Logged;
import com.eburtis.abproject.domain.Utilisateur;
import com.eburtis.abproject.presentation.dto.utilisateur.CreateUtilisateurDto;
import com.eburtis.abproject.presentation.dto.utilisateur.UpdateUtilisateurDto;
import com.eburtis.abproject.presentation.dto.utilisateur.UtilisateurResponseDto;
import com.eburtis.abproject.service.UtilisateurService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("${api.prefix}/utilisateur")
public class UtilisateurController {

	private final UtilisateurService utilisateurService;

	public UtilisateurController(UtilisateurService utilisateurService) {
		this.utilisateurService = utilisateurService;
	}

	/**
	 * Récupère tous les utilisateurs
	 */
	@GetMapping
	@Logged
	public ResponseEntity<List<UtilisateurResponseDto>> getAllUtilisateurs() {
		List<Utilisateur> utilisateurs = utilisateurService.getAllUtilisateurs();
		List<UtilisateurResponseDto> dtos = utilisateurs.stream()
			.map(UtilisateurResponseDto::fromUtilisateur)
			.collect(Collectors.toList());
		return ResponseEntity.ok(dtos);
	}

	/**
	 * Récupère un utilisateur par son ID
	 */
	@GetMapping("/{id}")
	@Logged
	public ResponseEntity<UtilisateurResponseDto> getUtilisateurById(@PathVariable Long id) {
		Utilisateur utilisateur = utilisateurService.getUtilisateurById(id);
		return ResponseEntity.ok(UtilisateurResponseDto.fromUtilisateur(utilisateur));
	}

	/**
	 * Crée un nouvel utilisateur
	 */
	@PostMapping
	@Logged
	public ResponseEntity<UtilisateurResponseDto> createUtilisateur(@RequestBody CreateUtilisateurDto dto) {
		Utilisateur utilisateur = utilisateurService.createUtilisateur(dto);
		return ResponseEntity.ok(UtilisateurResponseDto.fromUtilisateur(utilisateur));
	}

	/**
	 * Met à jour un utilisateur
	 */
	@PutMapping("/{id}")
	@Logged
	public ResponseEntity<UtilisateurResponseDto> updateUtilisateur(
			@PathVariable Long id,
			@RequestBody UpdateUtilisateurDto dto) {
		Utilisateur utilisateur = utilisateurService.updateUtilisateur(id, dto);
		return ResponseEntity.ok(UtilisateurResponseDto.fromUtilisateur(utilisateur));
	}

	/**
	 * Supprime un utilisateur
	 */
	@DeleteMapping("/{id}")
	@Logged
	public ResponseEntity<Void> deleteUtilisateur(@PathVariable Long id) {
		utilisateurService.deleteUtilisateur(id);
		return ResponseEntity.noContent().build();
	}
}
