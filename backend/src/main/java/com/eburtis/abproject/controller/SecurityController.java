package com.eburtis.abproject.controller;

import com.eburtis.abproject.service.SecurityService;
import com.eburtis.abproject.configuration.logger.Logged;
import com.eburtis.abproject.presentation.dto.auth.AuthDto;
import com.eburtis.abproject.presentation.dto.auth.TokenDto;
import com.eburtis.abproject.presentation.dto.auth.UtilisateurDto;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("${api.prefix}/securite")
public class SecurityController {

	private final SecurityService securityService;

	public SecurityController(SecurityService securityService) {
		this.securityService = securityService;
	}

	/**
	 * Permet d'authentifier l'utilisateur.
	 *
	 * @param authDto les informations de connexion.
	 * @return le token d'authentification
	 */
	@PostMapping("/auth")
	@Logged
	public TokenDto authentification(@RequestBody AuthDto authDto) {
		return securityService.autentifier(authDto);
	}

	/**
	 * Récupère les informations de l'utilisateur connecté.
	 *
	 * @return les informations de l'utilisateur connecté
	 */
	@GetMapping("/utilisateur")
	@Logged
	public UtilisateurDto getUtilisateurConnecte() {
		return UtilisateurDto.fromUtilisateur(securityService.getUtilisateurConnecte());
	}

}
