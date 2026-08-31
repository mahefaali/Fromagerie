package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fromagerie_back.model.TypeSaison;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record TarifLaitRequest(
        @NotNull TypeSaison saison,
        @NotNull @DecimalMin("0.0") BigDecimal prixParLitre,
        @NotNull LocalDate dateDebutValidite,
        LocalDate dateFinValidite,
        Boolean actif) {
}
