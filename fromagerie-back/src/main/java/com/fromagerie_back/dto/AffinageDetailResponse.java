package com.fromagerie_back.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import com.fromagerie_back.model.StatutLotAffinage;

public record AffinageDetailResponse(
        Long id,
        Long fabricationId,
        String numeroLot,
        String fromageNom,
        String recetteNom,
        String operateurNom,
        LocalDate dateMiseEnCave,
        LocalDate dateSortiePrevue,
        long joursRestants,
        StatutLotAffinage statut,
        int quantiteInitiale,
        int quantitePlacee,
        int quantiteRestante,
        Set<String> cavesActuelles,
        String etatCroute,
        List<PlacementAffinageResponse> placementsActifs,
        List<PlacementAffinageResponse> historiquePlacements,
        List<SoinAffinageResponse> soins) {
}
