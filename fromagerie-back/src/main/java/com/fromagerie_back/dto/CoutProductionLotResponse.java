package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CoutProductionLotResponse(
        Long id,
        Long fabricationId,
        String numeroLot,
        Long fromageId,
        String fromageNom,
        String recetteNom,
        LocalDateTime dateFabrication,
        BigDecimal poidsTotal,
        Integer nombreUnites,
        BigDecimal coutLait,
        BigDecimal coutMatieres,
        BigDecimal coutEmballage,
        BigDecimal coutEnergie,
        BigDecimal coutMainOeuvre,
        BigDecimal coutAmortissement,
        BigDecimal coutTotal,
        BigDecimal coutParKg,
        BigDecimal coutParUnite,
        LocalDateTime dateCalcul) {
}
