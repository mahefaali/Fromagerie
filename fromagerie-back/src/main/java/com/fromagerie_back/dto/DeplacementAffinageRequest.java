package com.fromagerie_back.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record DeplacementAffinageRequest(
        @NotNull @Positive Long caveDestinationId,
        @NotNull @Positive Long rangeeDepartId) {
}
