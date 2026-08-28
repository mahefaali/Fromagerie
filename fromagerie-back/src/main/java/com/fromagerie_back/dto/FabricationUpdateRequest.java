package com.fromagerie_back.dto;

import jakarta.validation.constraints.NotNull;

public class FabricationUpdateRequest extends FabricationRequest {

    @Override
    @NotNull
    public Long getRecetteId() {
        return super.getRecetteId();
    }
}
