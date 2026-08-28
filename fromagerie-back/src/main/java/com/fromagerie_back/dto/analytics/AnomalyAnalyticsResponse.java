package com.fromagerie_back.dto.analytics;

import java.util.List;

public record AnomalyAnalyticsResponse(
        int minimumEchantillons,
        List<FabricationAnomalyResponse> anomalies,
        List<FabricationAnomalyResponse> donneesInsuffisantes) {
}
