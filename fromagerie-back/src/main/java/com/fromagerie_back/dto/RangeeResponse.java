package com.fromagerie_back.dto;

public record RangeeResponse(
        Long id,
        Integer numero,
        Integer ordre,
        Integer capacite,
        int capaciteOccupee,
        int capaciteDisponible) {
}
