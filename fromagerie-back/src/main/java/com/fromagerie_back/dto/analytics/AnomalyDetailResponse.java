package com.fromagerie_back.dto.analytics;

import java.math.BigDecimal;

public record AnomalyDetailResponse(
        ParametreAnomalie parametre,
        BigDecimal valeur,
        BigDecimal borneBasse,
        BigDecimal borneHaute,
        DirectionAnomalie direction,
        String message) {
}
