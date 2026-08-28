package com.fromagerie_back.dto;

import java.time.LocalDateTime;

import com.fromagerie_back.model.TypeSoinAffinage;

public record SoinAffinageResponse(
        Long id,
        TypeSoinAffinage type,
        LocalDateTime dateHeure,
        String observation,
        String etatCroute,
        Long utilisateurId,
        String utilisateurNom) {
}
