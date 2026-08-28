package com.fromagerie_back.dto;

import java.math.BigDecimal;

import com.fromagerie_back.model.UniteMesure;

public record MatierePremiereResponse(
        Long id,
        String nom,
        UniteMesure uniteReference,
        BigDecimal coutUnitaire,
        boolean actif) {
}
