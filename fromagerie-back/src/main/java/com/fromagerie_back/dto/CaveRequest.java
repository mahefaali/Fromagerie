package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record CaveRequest(
        @NotBlank @Size(max = 120) String nom,
        @Size(max = 500) String description,
        @NotNull BigDecimal temperature,
        @NotNull @DecimalMin("0") @DecimalMax("100") BigDecimal humidite,
        @NotNull @PositiveOrZero Integer ageMinJours,
        @NotNull @PositiveOrZero Integer ageMaxJours,
        Boolean active,
        @NotEmpty List<@Valid EtagereRequest> etageres) {
}
