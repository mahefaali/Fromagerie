package com.fromagerie_back.dto;

import java.util.List;

public record PlacementResultResponse(
        int quantiteDemandee,
        int quantitePlacee,
        int quantiteRestante,
        boolean placementComplet,
        List<PlacementAffinageResponse> placementsCrees) {
}
