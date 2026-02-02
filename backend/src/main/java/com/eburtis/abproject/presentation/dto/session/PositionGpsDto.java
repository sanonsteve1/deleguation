package com.eburtis.abproject.presentation.dto.session;

public class PositionGpsDto {
	private Long sessionId;
	private Double latitude;
	private Double longitude;
	private Double precision;

	public PositionGpsDto() {
	}

	public PositionGpsDto(Long sessionId, Double latitude, Double longitude, Double precision) {
		this.sessionId = sessionId;
		this.latitude = latitude;
		this.longitude = longitude;
		this.precision = precision;
	}

	public Long getSessionId() {
		return sessionId;
	}

	public void setSessionId(Long sessionId) {
		this.sessionId = sessionId;
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
}
