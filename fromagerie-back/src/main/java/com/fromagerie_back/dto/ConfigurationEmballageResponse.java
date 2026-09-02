package com.fromagerie_back.dto;

import java.math.BigDecimal;

public record ConfigurationEmballageResponse(
        Long id,
        Long fromageId,
        String fromageNom,
        Long emballageId,
        String emballageNom,
        BigDecimal quantiteParUnite,
        boolean actif) {
}
