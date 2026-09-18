package com.fromagerie_back.dto;

import com.fromagerie_back.model.OrigineLait;
import jakarta.validation.constraints.NotNull;

public class FabricationUpdateRequest extends FabricationRequest {

    @Override
    @NotNull
    public Long getRecetteId() {
        return super.getRecetteId();
    }

    @Override
    @NotNull
    public OrigineLait getOrigineLait() {
        return super.getOrigineLait();
    }
}
