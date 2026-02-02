package com.eburtis.abproject.presentation.dto.utilisateur;

import com.eburtis.abproject.domain.Utilisateur;
import com.eburtis.abproject.enums.Role;
import com.eburtis.abproject.enums.StatutUtilisateur;
import com.eburtis.abproject.presentation.dto.entreprise.EntrepriseDto;

/**
 * DTO pour la réponse avec les informations d'un utilisateur (sans mot de passe)
 */
public class UtilisateurResponseDto {
	private Long id;
	private String username;
	private String nom;
	private String prenoms;
	private String telephone;
	private Role role;
	private StatutUtilisateur statut;
	private EntrepriseDto entreprise;

	public UtilisateurResponseDto() {
	}

	public UtilisateurResponseDto(Long id, String username, String nom, String prenoms, String telephone, Role role, StatutUtilisateur statut, EntrepriseDto entreprise) {
		this.id = id;
		this.username = username;
		this.nom = nom;
		this.prenoms = prenoms;
		this.telephone = telephone;
		this.role = role;
		this.statut = statut;
		this.entreprise = entreprise;
	}

	public static UtilisateurResponseDto fromUtilisateur(Utilisateur utilisateur) {
		return new UtilisateurResponseDto(
			utilisateur.getId(),
			utilisateur.getUsername(),
			utilisateur.getNom(),
			utilisateur.getPrenoms(),
			utilisateur.getTelephone(),
			utilisateur.getRole(),
			utilisateur.getStatut(),
			EntrepriseDto.fromEntreprise(utilisateur.getEntreprise())
		);
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getNom() {
		return nom;
	}

	public void setNom(String nom) {
		this.nom = nom;
	}

	public String getPrenoms() {
		return prenoms;
	}

	public void setPrenoms(String prenoms) {
		this.prenoms = prenoms;
	}

	public String getTelephone() {
		return telephone;
	}

	public void setTelephone(String telephone) {
		this.telephone = telephone;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	public StatutUtilisateur getStatut() {
		return statut;
	}

	public void setStatut(StatutUtilisateur statut) {
		this.statut = statut;
	}

	public EntrepriseDto getEntreprise() {
		return entreprise;
	}

	public void setEntreprise(EntrepriseDto entreprise) {
		this.entreprise = entreprise;
	}
}
