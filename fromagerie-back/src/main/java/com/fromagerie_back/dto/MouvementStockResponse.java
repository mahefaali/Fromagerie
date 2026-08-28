package com.fromagerie_back.dto;

import java.time.LocalDateTime;

import com.fromagerie_back.model.TypeMouvementStock;

public record MouvementStockResponse(
        Long id,
        TypeMouvementStock type,
        Integer quantite,
        Long utilisateurId,
        String utilisateurNom,
        LocalDateTime dateMouvement,
        String commentaire) {
}
