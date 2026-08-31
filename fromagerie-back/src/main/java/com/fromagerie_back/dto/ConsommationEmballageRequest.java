package com.fromagerie_back.dto;

import java.time.LocalDateTime;

import com.fromagerie_back.model.EtapeEmballage;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ConsommationEmballageRequest(
        @NotNull Long emballageId,
        @NotNull @Positive Integer quantite,
        @NotNull EtapeEmballage etape,
        LocalDateTime dateHeure) {
}
