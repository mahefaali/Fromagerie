package com.fromagerie_back.dto;

public record CaveOccupationResponse(
        Long placementId,
        Integer etagereNumero,
        Integer rangeeNumero,
        Integer positionDebut,
        Integer positionFin,
        String numeroLot) {
}
