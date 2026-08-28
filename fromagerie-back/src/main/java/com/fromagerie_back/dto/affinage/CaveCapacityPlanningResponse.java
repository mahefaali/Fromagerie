package com.fromagerie_back.dto.affinage;

public record CaveCapacityPlanningResponse(
        Long caveId,
        String caveNom,
        int capaciteTotale,
        int placesLibresMaintenant,
        int placesLibresJ7,
        int placesLibresJ30) {
}
