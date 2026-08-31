package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record RegleAmortissementRequest(
        @NotNull @Positive Long equipementId,
        @NotNull @DecimalMin("0.0") BigDecimal coutParFabrication,
        @NotNull LocalDate dateDebutValidite,
        LocalDate dateFinValidite,
        Boolean actif) {
}
