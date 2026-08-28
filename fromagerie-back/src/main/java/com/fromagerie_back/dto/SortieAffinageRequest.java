package com.fromagerie_back.dto;

import java.time.LocalDate;

import com.fromagerie_back.model.TypeDateDurabilite;

import jakarta.validation.constraints.NotNull;

public record SortieAffinageRequest(
        @NotNull Long emplacementStockId,
        @NotNull LocalDate dateEntreeStock,
        @NotNull TypeDateDurabilite typeDateDurabilite,
        @NotNull LocalDate dateDurabilite,
        String commentaire) {
}
