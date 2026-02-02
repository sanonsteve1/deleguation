package com.eburtis.abproject.presentation.dto.utilisateur;

import com.eburtis.abproject.enums.Role;
import com.eburtis.abproject.enums.StatutUtilisateur;

/**
 * DTO pour créer un nouvel utilisateur
 */
public class CreateUtilisateurDto {
	private String username;
	private String password;
	private String nom;
	private String prenoms;
	private String telephone;
	private Role role;
	private StatutUtilisateur statut;
	private Long entrepriseId;

	public CreateUtilisateurDto() {
	}

	public CreateUtilisateurDto(String username, String password, String nom, String prenoms, String telephone, Role role, StatutUtilisateur statut, Long entrepriseId) {
		this.username = username;
		this.password = password;
		this.nom = nom;
		this.prenoms = prenoms;
		this.telephone = telephone;
		this.role = role;
		this.statut = statut;
		this.entrepriseId = entrepriseId;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
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

	public Long getEntrepriseId() {
		return entrepriseId;
	}

	public void setEntrepriseId(Long entrepriseId) {
		this.entrepriseId = entrepriseId;
	}
}
