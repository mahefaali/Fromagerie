package com.fromagerie_back.dto.analytics;

import java.math.BigDecimal;

public record SeasonYieldStatisticsResponse(
        long nombreFabrications,
        BigDecimal moyenne,
        BigDecimal minimum,
        BigDecimal maximum,
        boolean donneesDisponibles) {
}
