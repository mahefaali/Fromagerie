package com.fromagerie_back.dto.analytics;

import java.time.LocalDateTime;
import java.util.List;

public record FabricationAnomalyResponse(
        Long fabricationId,
        String numeroLot,
        LocalDateTime dateHeureDebut,
        Long fromageId,
        String fromageNom,
        Long recetteId,
        String recetteNom,
        StatutAnalyseAnomalie statut,
        String baselineUtilisee,
        int nombreEchantillons,
        List<AnomalyDetailResponse> anomalies) {
}
