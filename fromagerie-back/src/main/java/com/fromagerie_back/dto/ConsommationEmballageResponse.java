package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fromagerie_back.model.EtapeEmballage;

public record ConsommationEmballageResponse(
        Long id,
        Long lotAffinageId,
        Long emballageId,
        String emballageNom,
        Integer quantite,
        EtapeEmballage etape,
        LocalDateTime dateHeure,
        Long utilisateurId,
        BigDecimal coutUnitaireReference) {
}
