package com.eburtis.abproject.presentation.dto.auth;

import com.eburtis.abproject.domain.Utilisateur;
import com.eburtis.abproject.enums.Role;

/**
 * DTO pour les informations d'un utilisateur
 */
public class UtilisateurDto {
	private Long id;
	private String username;
	private String nom;
	private String prenoms;
	private String telephone;
	private Role role;

	public UtilisateurDto() {
	}

	public UtilisateurDto(Long id, String username, String nom, String prenoms, String telephone, Role role) {
		this.id = id;
		this.username = username;
		this.nom = nom;
		this.prenoms = prenoms;
		this.telephone = telephone;
		this.role = role;
	}

	public static UtilisateurDto fromUtilisateur(Utilisateur utilisateur) {
		return new UtilisateurDto(
			utilisateur.getId(),
			utilisateur.getUsername(),
			utilisateur.getNom(),
			utilisateur.getPrenoms(),
			utilisateur.getTelephone(),
			utilisateur.getRole()
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
}
