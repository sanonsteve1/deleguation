package com.eburtis.abproject.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Access(AccessType.FIELD)
@Table(name = PositionGps.TABLE_NAME)
public class PositionGps extends AbstractEntity {

	public static final String TABLE_NAME = "position_gps";
	public static final String TABLE_ID = TABLE_NAME + ID;
	public static final String TABLE_SEQ = TABLE_ID + SEQ;

	@Id
	@SequenceGenerator(name = TABLE_SEQ, sequenceName = TABLE_SEQ)
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = TABLE_SEQ)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "id_session", nullable = false)
	private SessionTravail sessionTravail;

	@Column(name = "timestamp", nullable = false)
	private LocalDateTime timestamp;

	@Column(name = "latitude", nullable = false)
	private Double latitude;

	@Column(name = "longitude", nullable = false)
	private Double longitude;

	@Column(name = "precision_gps")
	private Double precision;

	@Column(name = "synchronise", nullable = false)
	private Boolean synchronise = false;

	public PositionGps() {
	}

	public PositionGps(SessionTravail sessionTravail, LocalDateTime timestamp, Double latitude, Double longitude, Double precision) {
		this.sessionTravail = sessionTravail;
		this.timestamp = timestamp;
		this.latitude = latitude;
		this.longitude = longitude;
		this.precision = precision;
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

	public LocalDateTime getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(LocalDateTime timestamp) {
		this.timestamp = timestamp;
	}

	public Double getLatitude() {
		return latitude;
	}

	public void setLatitude(Double latitude) {
		this.latitude = latitude;
	}

	public Double getLongitude() {
		return longitude;
	}

	public void setLongitude(Double longitude) {
		this.longitude = longitude;
	}

	public Double getPrecision() {
		return precision;
	}

	public void setPrecision(Double precision) {
		this.precision = precision;
	}

	public Boolean getSynchronise() {
		return synchronise;
	}

	public void setSynchronise(Boolean synchronise) {
		this.synchronise = synchronise;
	}
}
