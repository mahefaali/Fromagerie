package com.fromagerie_back.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AffinageCreateRequest(
        @NotNull @Positive Long fabricationId,
        @NotNull LocalDate dateMiseEnCave,
        @NotNull LocalDate dateSortiePrevue,
        @Valid AffinagePlacementRequest emplacementInitial,
        List<@Valid AffinagePlacementRequest> emplacementsInitiaux) {

    public AffinageCreateRequest(
            Long fabricationId,
            LocalDate dateMiseEnCave,
            LocalDate dateSortiePrevue,
            AffinagePlacementRequest emplacementInitial) {
        this(fabricationId, dateMiseEnCave, dateSortiePrevue, emplacementInitial, null);
    }
}
