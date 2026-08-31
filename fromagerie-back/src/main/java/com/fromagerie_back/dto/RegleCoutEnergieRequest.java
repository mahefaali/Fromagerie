package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fromagerie_back.model.TypeOperationEnergie;
import com.fromagerie_back.model.UniteCalculEnergie;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record RegleCoutEnergieRequest(
        @NotNull TypeOperationEnergie typeOperation,
        @NotNull @DecimalMin("0.0") BigDecimal coutStandard,
        @NotNull UniteCalculEnergie uniteCalcul,
        @NotNull LocalDate dateDebutValidite,
        LocalDate dateFinValidite,
        Boolean actif) {
}
