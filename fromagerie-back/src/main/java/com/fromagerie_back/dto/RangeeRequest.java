package com.fromagerie_back.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record RangeeRequest(
        @NotNull @Positive Integer numero,
        @NotNull @Positive Integer ordre,
        @NotNull @Positive Integer capacite) {
}
