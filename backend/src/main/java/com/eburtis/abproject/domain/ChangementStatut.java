package com.eburtis.abproject.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Access;
import jakarta.persistence.AccessType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;

@Entity
@Access(AccessType.FIELD)
@Table(name = ChangementStatut.TABLE_NAME)
public class ChangementStatut extends AbstractEntity {

	public static final String TABLE_NAME = "changement_statut";
	public static final String TABLE_ID = TABLE_NAME + ID;
	public static final String TABLE_SEQ = TABLE_ID + SEQ;

	@Id
	@SequenceGenerator(name = TABLE_SEQ, sequenceName = TABLE_SEQ)
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = TABLE_SEQ)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_session", nullable = false)
	private SessionTravail sessionTravail;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_statut", nullable = false)
	private Statut statut;

	@Column(name = "timestamp", nullable = false)
	private LocalDateTime timestamp;

	@Column(name = "synchronise", nullable = false)
	private Boolean synchronise = false;

	public ChangementStatut() {
	}

	public ChangementStatut(SessionTravail sessionTravail, Statut statut, LocalDateTime timestamp) {
		this.sessionTravail = sessionTravail;
		this.statut = statut;
		this.timestamp = timestamp;
		this.synchronise = false;
	}

	@Override
	public Long getId() {
		return id;
	}

	public SessionTravail getSessionTravail() {
		return sessionTravail;
	}

	public void setSessionTravail(SessionTravail sessionTravail) {
		this.sessionTravail = sessionTravail;
	}

	public Statut getStatut() {
		return statut;
	}

	public void setStatut(Statut statut) {
		this.statut = statut;
	}

	public LocalDateTime getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(LocalDateTime timestamp) {
		this.timestamp = timestamp;
	}

	public Boolean getSynchronise() {
		return synchronise;
	}

	public void setSynchronise(Boolean synchronise) {
		this.synchronise = synchronise;
	}
}
