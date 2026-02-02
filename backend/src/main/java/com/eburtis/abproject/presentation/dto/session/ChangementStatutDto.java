package com.eburtis.abproject.presentation.dto.session;

public class ChangementStatutDto {
	private Long sessionId;
	private String codeStatut;

	public ChangementStatutDto() {
	}

	public ChangementStatutDto(Long sessionId, String codeStatut) {
		this.sessionId = sessionId;
		this.codeStatut = codeStatut;
	}

	public Long getSessionId() {
		return sessionId;
	}

	public void setSessionId(Long sessionId) {
		this.sessionId = sessionId;
	}

	public String getCodeStatut() {
		return codeStatut;
	}

	public void setCodeStatut(String codeStatut) {
		this.codeStatut = codeStatut;
	}
}
