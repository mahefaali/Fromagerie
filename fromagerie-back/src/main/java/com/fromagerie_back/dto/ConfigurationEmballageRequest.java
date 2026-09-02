package com.fromagerie_back.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ConfigurationEmballageRequest(
        @NotNull Long fromageId,
        @NotNull Long emballageId,
        @NotNull @Positive BigDecimal quantiteParUnite,
        Boolean actif) {
}
