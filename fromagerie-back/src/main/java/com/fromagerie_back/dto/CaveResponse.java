package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.util.List;

public record CaveResponse(
        Long id,
        String nom,
        String description,
        BigDecimal temperature,
        BigDecimal humidite,
        Integer ageMinJours,
        Integer ageMaxJours,
        boolean active,
        int capaciteTotale,
        int capaciteOccupee,
        int capaciteDisponible,
        List<EtagereResponse> etageres) {
}
