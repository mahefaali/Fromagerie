package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RecetteHistoryResponse(
        Long id,
        int version,
        String nom,
        LocalDateTime dateCreation,
        boolean active,
        BigDecimal coutMatiereEstime) {
}
