package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fromagerie_back.model.TypeOperationMainOeuvre;

public record RegleMainOeuvreResponse(
        Long id,
        TypeOperationMainOeuvre typeOperation,
        Integer dureeStandardMinutes,
        BigDecimal coutHoraire,
        LocalDate dateDebutValidite,
        LocalDate dateFinValidite,
        boolean actif) {
}
