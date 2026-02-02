package com.eburtis.abproject.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Access(AccessType.FIELD)
@Table(name = SessionTravail.TABLE_NAME)
public class SessionTravail extends AbstractEntity {

	public static final String TABLE_NAME = "session_travail";
	public static final String TABLE_ID = TABLE_NAME + ID;
	public static final String TABLE_SEQ = TABLE_ID + SEQ;

	@Id
	@SequenceGenerator(name = TABLE_SEQ, sequenceName = TABLE_SEQ)
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = TABLE_SEQ)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_utilisateur", nullable = false)
	@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
	private Utilisateur utilisateur;

	@Column(name = "heure_debut", nullable = false)
	private LocalDateTime heureDebut;

	@Column(name = "heure_fin")
	private LocalDateTime heureFin;

	@Column(name = "latitude_debut", nullable = false)
	private Double latitudeDebut;

	@Column(name = "longitude_debut", nullable = false)
	private Double longitudeDebut;

	@Column(name = "latitude_fin")
	private Double latitudeFin;

	@Column(name = "longitude_fin")
	private Double longitudeFin;

	@Column(name = "synchronise", nullable = false)
	private Boolean synchronise = false;

	public SessionTravail() {
	}

	public SessionTravail(Utilisateur utilisateur, LocalDateTime heureDebut, Double latitudeDebut, Double longitudeDebut) {
		this.utilisateur = utilisateur;
		this.heureDebut = heureDebut;
		this.latitudeDebut = latitudeDebut;
		this.longitudeDebut = longitudeDebut;
		this.synchronise = false;
	}

	public void cloreSession(LocalDateTime heureFin, Double latitudeFin, Double longitudeFin) {
		this.heureFin = heureFin;
		this.latitudeFin = latitudeFin;
		this.longitudeFin = longitudeFin;
	}

	public boolean estEnCours() {
		return heureFin == null;
	}

	@Override
	public Long getId() {
		return id;
	}

	public Utilisateur getUtilisateur() {
		return utilisateur;
	}

	public void setUtilisateur(Utilisateur utilisateur) {
		this.utilisateur = utilisateur;
	}

	public LocalDateTime getHeureDebut() {
		return heureDebut;
	}

	public void setHeureDebut(LocalDateTime heureDebut) {
		this.heureDebut = heureDebut;
	}

	public LocalDateTime getHeureFin() {
		return heureFin;
	}

	public void setHeureFin(LocalDateTime heureFin) {
		this.heureFin = heureFin;
	}

	public Double getLatitudeDebut() {
		return latitudeDebut;
	}

	public void setLatitudeDebut(Double latitudeDebut) {
		this.latitudeDebut = latitudeDebut;
	}

	public Double getLongitudeDebut() {
		return longitudeDebut;
	}

	public void setLongitudeDebut(Double longitudeDebut) {
		this.longitudeDebut = longitudeDebut;
	}

	public Double getLatitudeFin() {
		return latitudeFin;
	}

	public void setLatitudeFin(Double latitudeFin) {
		this.latitudeFin = latitudeFin;
	}

	public Double getLongitudeFin() {
		return longitudeFin;
	}

	public void setLongitudeFin(Double longitudeFin) {
		this.longitudeFin = longitudeFin;
	}

	public Boolean getSynchronise() {
		return synchronise;
	}

	public void setSynchronise(Boolean synchronise) {
		this.synchronise = synchronise;
	}
}
