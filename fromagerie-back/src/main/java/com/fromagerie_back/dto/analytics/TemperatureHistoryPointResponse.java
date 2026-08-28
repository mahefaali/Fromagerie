package com.fromagerie_back.dto.analytics;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TemperatureHistoryPointResponse(
        Long fabricationId,
        String numeroLot,
        LocalDateTime dateHeureDebut,
        Long fromageId,
        String fromageNom,
        Long recetteId,
        String recetteNom,
        BigDecimal temperatureChauffage) {
}
