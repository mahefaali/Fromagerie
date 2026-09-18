package com.fromagerie_back.dto;

import java.time.LocalDate;
import java.util.List;

public record CommandeTracabiliteResponse(
        Long commandeId,
        String numeroCommande,
        String client,
        LocalDate dateCommande,
        List<ProduitLivre> produitsLivres) {

    public record ProduitLivre(
            Long ligneLivraisonId,
            String numeroLivraison,
            LocalDate dateLivraison,
            String fromage,
            Integer quantiteLivree,
            String numeroLotFabrication) {}
}
