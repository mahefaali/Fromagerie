package com.fromagerie_back.dto;

import java.math.BigDecimal;

public record RentabiliteGroupeResponse(
        Long id,
        String nom,
        int quantiteLivree,
        BigDecimal chiffreAffaires,
        BigDecimal coutAttribue,
        BigDecimal margeBrute,
        BigDecimal tauxRentabilite) {
}
