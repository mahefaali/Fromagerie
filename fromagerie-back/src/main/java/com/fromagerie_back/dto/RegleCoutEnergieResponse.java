package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fromagerie_back.model.TypeOperationEnergie;
import com.fromagerie_back.model.UniteCalculEnergie;

public record RegleCoutEnergieResponse(
        Long id,
        TypeOperationEnergie typeOperation,
        BigDecimal coutStandard,
        UniteCalculEnergie uniteCalcul,
        LocalDate dateDebutValidite,
        LocalDate dateFinValidite,
        boolean actif) {
}
