package com.fromagerie_back.dto.analytics;

import java.math.BigDecimal;
import java.util.List;

public record YieldAnalyticsResponse(
        long nombreFabrications,
        BigDecimal moyenne,
        BigDecimal minimum,
        BigDecimal maximum,
        List<YieldHistoryPointResponse> historique) {
}
