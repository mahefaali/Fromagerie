package com.fromagerie_back.dto;

import java.time.LocalDate;
import java.util.List;

import com.fromagerie_back.model.StatutStockFromageFini;
import com.fromagerie_back.model.TypeDateDurabilite;

public record StockFromageFiniResponse(
        Long id,
        Long lotAffinageId,
        String numeroLotFabrication,
        String fromageNom,
        Long emplacementStockId,
        String emplacementStockNom,
        LocalDate dateEntreeStock,
        Integer quantiteInitiale,
        Integer quantitePhysique,
        boolean vendable,
        TypeDateDurabilite typeDateDurabilite,
        LocalDate dateDurabilite,
        StatutStockFromageFini statut,
        List<MouvementStockResponse> mouvements) {
}
