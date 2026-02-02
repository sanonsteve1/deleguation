package com.eburtis.abproject.presentation.dto.session;

import com.eburtis.abproject.domain.Statut;

/**
 * DTO pour les informations d'un statut
 */
public class StatutDto {
	private Long id;
	private String codeStatut;
	private String libelle;

	public StatutDto() {
	}

	public StatutDto(Long id, String codeStatut, String libelle) {
		this.id = id;
		this.codeStatut = codeStatut;
		this.libelle = libelle;
	}

	public static StatutDto fromStatut(Statut statut) {
		if (statut == null) {
			return null;
		}
		return new StatutDto(
			statut.getId(),
			statut.getCodeStatut(),
			statut.getLibelle()
		);
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getCodeStatut() {
		return codeStatut;
	}

	public void setCodeStatut(String codeStatut) {
		this.codeStatut = codeStatut;
	}

	public String getLibelle() {
		return libelle;
	}

	public void setLibelle(String libelle) {
		this.libelle = libelle;
	}
}
