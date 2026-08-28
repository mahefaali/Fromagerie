package com.fromagerie_back.dto.affinage;

import java.time.LocalDate;

import com.fromagerie_back.model.StatutLotAffinage;

public record AffinageAlertItemResponse(
        Long lotId,
        Long fabricationId,
        String numeroLot,
        String fromageNom,
        String recetteNom,
        LocalDate dateSortiePrevue,
        long joursRestants,
        StatutLotAffinage statut,
        Integer frequenceRetournementJours,
        String caveNom,
        String message,
        String route) {
}
