package com.fromagerie_back.dto.affinage;

import java.util.List;

public record AffinageCapacityPlanningResponse(
        List<CaveCapacityPlanningResponse> caves) {
}
