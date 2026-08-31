package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RegleAmortissementResponse(
        Long id,
        Long equipementId,
        String equipementNom,
        BigDecimal coutParFabrication,
        LocalDate dateDebutValidite,
        LocalDate dateFinValidite,
        boolean actif) {
}
