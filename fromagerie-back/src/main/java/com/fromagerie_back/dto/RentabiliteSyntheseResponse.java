package com.fromagerie_back.dto;

import java.math.BigDecimal;

public record RentabiliteSyntheseResponse(
        int quantiteLivree,
        BigDecimal chiffreAffaires,
        BigDecimal coutAttribue,
        BigDecimal margeBrute,
        BigDecimal tauxRentabilite) {
}
