package com.fromagerie_back.dto;

import java.math.BigDecimal;

public record RentabiliteFromageResponse(
        Long id,
        String nom,
        int quantiteLivree,
        BigDecimal chiffreAffaires,
        BigDecimal coutAttribue,
        BigDecimal poidsLivreKg,
        BigDecimal coutProductionParKg,
        BigDecimal margeBrute,
        BigDecimal tauxRentabilite) {
}
