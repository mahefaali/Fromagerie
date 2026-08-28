package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fromagerie_back.model.TypePerteStock;

public record PerteStockResponse(
        Long id,
        Long stockId,
        Long reservationId,
        String numeroLot,
        String fromageNom,
        Integer quantite,
        TypePerteStock typePerte,
        String motif,
        LocalDateTime dateHeure,
        BigDecimal coutUnitaireReference,
        BigDecimal coutTotal,
        String utilisateurNom) {
}
