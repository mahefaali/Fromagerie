package com.fromagerie_back.dto;

import java.time.LocalDateTime;

public record PlacementAffinageResponse(
        Long id,
        Long caveId,
        String caveNom,
        Long etagereId,
        Integer etagereNumero,
        Long rangeeId,
        Integer rangeeNumero,
        Integer positionDebut,
        Integer positionFin,
        Integer quantite,
        LocalDateTime dateDebut,
        LocalDateTime dateFin,
        boolean actif) {
}
