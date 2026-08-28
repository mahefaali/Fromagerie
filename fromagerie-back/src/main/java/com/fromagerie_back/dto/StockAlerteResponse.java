package com.fromagerie_back.dto;

import java.time.LocalDate;

public record StockAlerteResponse(
        Long stockId,
        String fromageNom,
        String numeroLot,
        LocalDate dateDurabilite,
        long joursRestants) {
}
