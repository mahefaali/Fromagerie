package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record RecetteDetailResponse(
        Long id,
        String nom,
        String varianteKey,
        int version,
        boolean active,
        LocalDateTime dateCreation,
        Long fromageId,
        String fromageNom,
        Integer frequenceRetournementJours,
        BigDecimal quantiteLaitReference,
        BigDecimal coutMatiereEstime,
        List<RecetteIngredientResponse> ingredients) {
}
