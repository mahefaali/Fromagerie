package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FabricationListResponse(
        Long id,
        String numeroLot,
        LocalDateTime dateHeureDebut,
        Long fromageId,
        String fromageNom,
        Long recetteId,
        String recetteNom,
        BigDecimal quantiteLait,
        BigDecimal poidsTotalFromages,
        Integer nombreFromages,
        BigDecimal rendement,
        Long operateurId,
        String operateurNom) {
}
