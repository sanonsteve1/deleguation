package com.eburtis.abproject.presentation.dto.session;

import com.eburtis.abproject.domain.ChangementStatut;

import java.time.LocalDateTime;

/**
 * DTO pour la réponse d'un changement de statut
 */
public class ChangementStatutResponseDto {
	private Long id;
	private Long sessionId;
	private StatutDto statut;
	private LocalDateTime timestamp;
	private Boolean synchronise;

	public ChangementStatutResponseDto() {
	}

	public ChangementStatutResponseDto(Long id, Long sessionId, StatutDto statut, LocalDateTime timestamp, Boolean synchronise) {
		this.id = id;
		this.sessionId = sessionId;
		this.statut = statut;
		this.timestamp = timestamp;
		this.synchronise = synchronise;
	}

	public static ChangementStatutResponseDto fromChangementStatut(ChangementStatut changementStatut) {
		return new ChangementStatutResponseDto(
			changementStatut.getId(),
			changementStatut.getSessionTravail() != null ? changementStatut.getSessionTravail().getId() : null,
			StatutDto.fromStatut(changementStatut.getStatut()),
			changementStatut.getTimestamp(),
			changementStatut.getSynchronise()
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

	public StatutDto getStatut() {
		return statut;
	}

	public void setStatut(StatutDto statut) {
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
