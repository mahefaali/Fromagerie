package com.fromagerie_back.dto;

import java.math.BigDecimal;

import com.fromagerie_back.model.UniteMesure;

public record RecetteIngredientResponse(
        Long id,
        Long matierePremiereId,
        String matierePremiereNom,
        BigDecimal quantite,
        UniteMesure unite,
        BigDecimal coutUnitaireReference,
        BigDecimal coutEstime) {
}
