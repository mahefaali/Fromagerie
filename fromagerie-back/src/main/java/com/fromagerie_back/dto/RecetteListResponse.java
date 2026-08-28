package com.fromagerie_back.dto;

import java.math.BigDecimal;

public record RecetteListResponse(
        Long id,
        String nom,
        String varianteKey,
        Long fromageId,
        String fromageNom,
        int version,
        boolean active,
        BigDecimal coutMatiereEstime) {
}
