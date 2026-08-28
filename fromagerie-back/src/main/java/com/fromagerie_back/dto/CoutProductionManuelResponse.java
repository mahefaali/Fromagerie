package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CoutProductionManuelResponse(
        Long fromageId,
        String fromageNom,
        BigDecimal coutUnitaire,
        LocalDateTime dateMiseAJour,
        String utilisateurNom) {
}
