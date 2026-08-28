package com.fromagerie_back.dto;

import java.time.LocalDate;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AffinageCreateRequest(
        @NotNull @Positive Long fabricationId,
        @NotNull LocalDate dateMiseEnCave,
        @NotNull LocalDate dateSortiePrevue,
        @Valid AffinagePlacementRequest emplacementInitial) {
}
