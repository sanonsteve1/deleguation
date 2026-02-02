package com.eburtis.abproject.presentation.dto.entreprise;

import com.eburtis.abproject.domain.Entreprise;

/**
 * DTO pour les informations d'une entreprise
 */
public class EntrepriseDto {
	private Long id;
	private String nom;
	private String description;
	private String adresse;
	private String telephone;
	private String email;

	public EntrepriseDto() {
	}

	public EntrepriseDto(Long id, String nom, String description, String adresse, String telephone, String email) {
		this.id = id;
		this.nom = nom;
		this.description = description;
		this.adresse = adresse;
		this.telephone = telephone;
		this.email = email;
	}

	public static EntrepriseDto fromEntreprise(Entreprise entreprise) {
		if (entreprise == null) {
			return null;
		}
		return new EntrepriseDto(
			entreprise.getId(),
			entreprise.getNom(),
			entreprise.getDescription(),
			entreprise.getAdresse(),
			entreprise.getTelephone(),
			entreprise.getEmail()
		);
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getNom() {
		return nom;
	}

	public void setNom(String nom) {
		this.nom = nom;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getAdresse() {
		return adresse;
	}

	public void setAdresse(String adresse) {
		this.adresse = adresse;
	}

	public String getTelephone() {
		return telephone;
	}

	public void setTelephone(String telephone) {
		this.telephone = telephone;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}
}
