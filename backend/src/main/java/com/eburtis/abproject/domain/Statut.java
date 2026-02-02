package com.eburtis.abproject.domain;

import jakarta.persistence.*;

@Entity
@Access(AccessType.FIELD)
@Table(name = Statut.TABLE_NAME)
public class Statut extends AbstractEntity {

	public static final String TABLE_NAME = "statut";
	public static final String TABLE_ID = TABLE_NAME + ID;
	public static final String TABLE_SEQ = TABLE_ID + SEQ;

	@Id
	@SequenceGenerator(name = TABLE_SEQ, sequenceName = TABLE_SEQ)
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = TABLE_SEQ)
	private Long id;

	@Column(name = "code_statut", nullable = false, unique = true, length = 50)
	private String codeStatut;

	@Column(name = "libelle", nullable = false, length = 255)
	private String libelle;

	public Statut() {
		// Constructeur par défaut
	}

	public Statut(String codeStatut, String libelle) {
		this.codeStatut = codeStatut;
		this.libelle = libelle;
	}

	@Override
	public Long getId() {
		return id;
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
