package com.fromagerie_back.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AffinagePlacementRequest(
        @NotNull @Positive Long caveId,
        @NotNull @Positive Long rangeeDepartId) {
}
