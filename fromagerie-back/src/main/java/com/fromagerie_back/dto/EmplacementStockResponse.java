package com.fromagerie_back.dto;

public record EmplacementStockResponse(
        Long id,
        String nom,
        String description,
        boolean active) {
}
