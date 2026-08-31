package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fromagerie_back.model.TypeSaison;

public record TarifLaitResponse(
        Long id,
        TypeSaison saison,
        BigDecimal prixParLitre,
        LocalDate dateDebutValidite,
        LocalDate dateFinValidite,
        boolean actif) {
}
