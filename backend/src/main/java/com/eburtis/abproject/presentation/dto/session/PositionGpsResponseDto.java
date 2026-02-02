package com.eburtis.abproject.presentation.dto.session;

import com.eburtis.abproject.domain.PositionGps;

import java.time.LocalDateTime;

/**
 * DTO pour la réponse d'une position GPS
 */
public class PositionGpsResponseDto {
	private Long id;
	private Long sessionId;
	private LocalDateTime timestamp;
	private Double latitude;
	private Double longitude;
	private Double precision;
	private Boolean synchronise;

	public PositionGpsResponseDto() {
	}

	public PositionGpsResponseDto(Long id, Long sessionId, LocalDateTime timestamp, Double latitude, Double longitude, Double precision, Boolean synchronise) {
		this.id = id;
		this.sessionId = sessionId;
		this.timestamp = timestamp;
		this.latitude = latitude;
		this.longitude = longitude;
		this.precision = precision;
		this.synchronise = synchronise;
	}

	public static PositionGpsResponseDto fromPositionGps(PositionGps positionGps) {
		return new PositionGpsResponseDto(
			positionGps.getId(),
			positionGps.getSessionTravail() != null ? positionGps.getSessionTravail().getId() : null,
			positionGps.getTimestamp(),
			positionGps.getLatitude(),
			positionGps.getLongitude(),
			positionGps.getPrecision(),
			positionGps.getSynchronise()
		);
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getSessionId() {
		return sessionId;
	}

	public void setSessionId(Long sessionId) {
		this.sessionId = sessionId;
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
