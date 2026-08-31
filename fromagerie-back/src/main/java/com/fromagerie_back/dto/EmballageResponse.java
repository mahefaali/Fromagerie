package com.fromagerie_back.dto;

import java.math.BigDecimal;

public record EmballageResponse(
        Long id,
        String nom,
        BigDecimal coutUnitaire,
        String unite,
        boolean actif) {
}
