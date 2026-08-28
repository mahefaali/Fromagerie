package com.fromagerie_back.dto;

import java.time.LocalDate;

import com.fromagerie_back.model.TypeDateDurabilite;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record StockFromageFiniRequest(
        @NotNull Long lotAffinageId,
        @NotNull Long emplacementStockId,
        @NotNull LocalDate dateEntreeStock,
        @NotNull @Positive Integer quantiteInitiale,
        @NotNull TypeDateDurabilite typeDateDurabilite,
        @NotNull LocalDate dateDurabilite) {
}
