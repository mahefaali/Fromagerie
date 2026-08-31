package com.fromagerie_back.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EmballageRequest(
        @NotBlank String nom,
        @NotNull @DecimalMin("0.0") BigDecimal coutUnitaire,
        @NotBlank String unite,
        Boolean actif) {
}
