package com.fromagerie_back.dto;

import java.math.BigDecimal;

import com.fromagerie_back.model.UniteMesure;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class RecetteIngredientRequest {

    @NotNull(message = "La matière première est obligatoire")
    private Long matierePremiereId;

    @NotNull(message = "La quantité est obligatoire")
    @Positive(message = "La quantité doit être strictement positive")
    private BigDecimal quantite;

    @NotNull(message = "L'unité est obligatoire")
    private UniteMesure unite;

    public Long getMatierePremiereId() {
        return matierePremiereId;
    }

    public BigDecimal getQuantite() {
        return quantite;
    }

    public UniteMesure getUnite() {
        return unite;
    }

    public void setMatierePremiereId(Long matierePremiereId) {
        this.matierePremiereId = matierePremiereId;
    }

    public void setQuantite(BigDecimal quantite) {
        this.quantite = quantite;
    }

    public void setUnite(UniteMesure unite) {
        this.unite = unite;
    }
}
