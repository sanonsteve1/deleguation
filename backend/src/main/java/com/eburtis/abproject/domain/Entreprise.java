package com.eburtis.abproject.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Access(AccessType.FIELD)
@Table(name = Entreprise.TABLE_NAME)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Entreprise extends AbstractEntity {

	public static final String TABLE_NAME = "entreprise";
	public static final String TABLE_ID = TABLE_NAME + ID;
	public static final String TABLE_SEQ = TABLE_ID + SEQ;

	@Id
	@SequenceGenerator(name = TABLE_SEQ, sequenceName = TABLE_SEQ)
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = TABLE_SEQ)
	private Long id;

	@Column(nullable = false, length = 255)
	private String nom;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Column(length = 500)
	private String adresse;

	@Column(length = 50)
	private String telephone;

	@Column(length = 255)
	private String email;

	public Entreprise() {
	}

	public Entreprise(String nom, String description, String adresse, String telephone, String email) {
		this.nom = nom;
		this.description = description;
		this.adresse = adresse;
		this.telephone = telephone;
		this.email = email;
	}

	@Override
	public Long getId() {
		return id;
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
