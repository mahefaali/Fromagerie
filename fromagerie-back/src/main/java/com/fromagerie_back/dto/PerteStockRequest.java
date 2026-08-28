package com.fromagerie_back.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import com.fromagerie_back.model.TypePerteStock;

public record PerteStockRequest(
        @NotNull @Positive Integer quantite,
        @NotNull TypePerteStock typePerte,
        String motif,
        Long reservationId) {
}
