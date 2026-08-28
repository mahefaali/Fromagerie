package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fromagerie_back.model.OrigineLait;

public record FabricationDetailResponse(
        Long id,
        String numeroLot,
        LocalDateTime dateHeureDebut,
        Long recetteId,
        String recetteNom,
        Long fromageId,
        String fromageNom,
        BigDecimal quantiteLait,
        BigDecimal temperatureLait,
        OrigineLait origineLait,
        BigDecimal temperatureChauffage,
        Integer dureeChauffageMinutes,
        String typePresure,
        BigDecimal quantitePresure,
        String typeFerments,
        BigDecimal quantiteFerments,
        BigDecimal temperatureMiseEnMoule,
        Integer dureeEgouttageMinutes,
        BigDecimal poidsTotalFromages,
        Integer nombreFromages,
        BigDecimal rendement,
        String observations,
        Long operateurId,
        String operateurNom) {
}
