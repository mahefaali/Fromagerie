package com.fromagerie_back.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.fromagerie_back.model.TypePerteStock;

public record TracabiliteDescendanteResponse(
        Long fabricationId,
        String numeroLot,
        String fromage,
        LocalDateTime dateFabrication,
        Integer quantiteProduite,
        Integer quantiteLivree,
        Integer quantiteNonVendue,
        Integer quantiteDisponible,
        Integer quantitePerdue,
        List<ClientLivre> clientsLivres,
        List<PerteTrace> pertes,
        List<LocalisationTrace> localisationsActuelles) {

    public record ClientLivre(Long clientId, String client, Integer quantiteLivree) {}

    public record PerteTrace(
            Long id,
            Integer quantite,
            TypePerteStock type,
            String motif,
            LocalDateTime date) {}

    public record LocalisationTrace(
            String nature,
            String libelle,
            Integer quantite,
            String numeroLivraison,
            LocalDate dateLivraison) {}
}
