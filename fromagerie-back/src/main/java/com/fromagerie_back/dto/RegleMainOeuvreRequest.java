package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fromagerie_back.model.TypeOperationMainOeuvre;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record RegleMainOeuvreRequest(
        @NotNull TypeOperationMainOeuvre typeOperation,
        @NotNull @Positive Integer dureeStandardMinutes,
        @NotNull @DecimalMin("0.0") BigDecimal coutHoraire,
        @NotNull LocalDate dateDebutValidite,
        LocalDate dateFinValidite,
        Boolean actif) {
}
