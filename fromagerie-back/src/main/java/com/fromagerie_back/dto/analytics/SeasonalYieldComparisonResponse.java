package com.fromagerie_back.dto.analytics;

public record SeasonalYieldComparisonResponse(
        Long fromageId,
        String fromageNom,
        SeasonYieldStatisticsResponse saisonSeche,
        SeasonYieldStatisticsResponse saisonHumide) {
}
