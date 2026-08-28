package com.fromagerie_back.dto;

import java.time.LocalDate;
import java.util.Set;

import com.fromagerie_back.model.StatutLotAffinage;

public record AffinageListResponse(
        Long id,
        Long fabricationId,
        String numeroLot,
        String fromageNom,
        String recetteNom,
        LocalDate dateMiseEnCave,
        LocalDate dateSortiePrevue,
        long joursRestants,
        StatutLotAffinage statut,
        int quantiteInitiale,
        int quantitePlacee,
        int quantiteRestante,
        Set<String> cavesActuelles) {
}
