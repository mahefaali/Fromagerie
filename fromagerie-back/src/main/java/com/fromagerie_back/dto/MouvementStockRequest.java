package com.fromagerie_back.dto;

import com.fromagerie_back.model.TypeMouvementStock;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record MouvementStockRequest(
        @NotNull TypeMouvementStock type,
        @NotNull @Positive Integer quantite,
        @Size(max = 500) String commentaire) {
}
