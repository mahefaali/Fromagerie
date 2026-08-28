package com.fromagerie_back.dto;

import jakarta.validation.constraints.Size;

public class FabricationCreateRequest extends FabricationRequest {

    private Long fromageId;

    @Size(max = 36, message = "La variante ne peut pas dépasser 36 caractères")
    private String variante;

    public Long getFromageId() {
        return fromageId;
    }

    public void setFromageId(Long fromageId) {
        this.fromageId = fromageId;
    }

    public String getVariante() {
        return variante;
    }

    public void setVariante(String variante) {
        this.variante = variante;
    }
}
