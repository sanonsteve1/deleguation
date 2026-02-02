package com.eburtis.abproject.controller;

import com.eburtis.abproject.configuration.logger.Logged;
import com.eburtis.abproject.presentation.dto.session.PositionGpsDto;
import com.eburtis.abproject.presentation.dto.session.PositionGpsResponseDto;
import com.eburtis.abproject.service.PositionGpsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("${api.prefix}/positions")
public class PositionGpsController {

	private final PositionGpsService positionGpsService;

	public PositionGpsController(PositionGpsService positionGpsService) {
		this.positionGpsService = positionGpsService;
	}

	/**
	 * Enregistre une position GPS
	 * RQ-04 : Suivi d'itinéraire passif (GPS toutes les 5 min)
	 */
	@PostMapping
	@Logged
	public ResponseEntity<PositionGpsResponseDto> enregistrerPosition(@RequestBody PositionGpsDto dto) {
		return ResponseEntity.ok(PositionGpsResponseDto.fromPositionGps(
			positionGpsService.enregistrerPosition(
				dto.getSessionId(),
				dto.getLatitude(),
				dto.getLongitude(),
				dto.getPrecision()
			)
		));
	}

	/**
	 * Récupère toutes les positions d'une session
	 */
	@GetMapping("/session/{sessionId}")
	@Logged
	public ResponseEntity<List<PositionGpsResponseDto>> getPositionsParSession(@PathVariable Long sessionId) {
		List<PositionGpsResponseDto> dtos = positionGpsService.getPositionsParSession(sessionId).stream()
			.map(PositionGpsResponseDto::fromPositionGps)
			.collect(Collectors.toList());
		return ResponseEntity.ok(dtos);
	}
}
