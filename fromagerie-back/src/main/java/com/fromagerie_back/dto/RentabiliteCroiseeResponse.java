package com.fromagerie_back.dto;

import java.math.BigDecimal;

public record RentabiliteCroiseeResponse(
        Long fromageId,
        String fromageNom,
        Long clientId,
        String clientNom,
        int quantiteLivree,
        BigDecimal prixVenteMoyen,
        BigDecimal chiffreAffaires,
        BigDecimal coutAttribue,
        BigDecimal margeBrute,
        BigDecimal tauxRentabilite) {
}
