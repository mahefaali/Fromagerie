package com.fromagerie_back.dto.affinage;

import java.util.List;

public record AffinageDashboardResponse(
        List<AffinageAlertItemResponse> retounementsAEffectuer,
        List<AffinageAlertItemResponse> retounementsEnRetard,
        List<AffinageAlertItemResponse> sortiesProches,
        List<AffinageAlertItemResponse> lotsPretsASortir,
        List<AffinageAlertItemResponse> changementsCaveRecommandes,
        int lotsEnAffinage,
        int lotsPrets,
        int placesLibres) {
}
