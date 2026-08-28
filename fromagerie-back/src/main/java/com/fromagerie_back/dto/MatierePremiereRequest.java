package com.fromagerie_back.dto;

import java.math.BigDecimal;

import com.fromagerie_back.model.UniteMesure;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class MatierePremiereRequest {

    @NotBlank(message = "Le nom de la matière est obligatoire")
    @Size(max = 120, message = "Le nom ne peut pas dépasser 120 caractères")
    private String nom;

    @NotNull(message = "L'unité de référence est obligatoire")
    private UniteMesure uniteReference;

    @NotNull(message = "Le coût unitaire est obligatoire")
    @DecimalMin(value = "0.0", message = "Le coût unitaire ne peut pas être négatif")
    private BigDecimal coutUnitaire;

    private boolean actif = true;

    public String getNom() {
        return nom;
    }

    public UniteMesure getUniteReference() {
        return uniteReference;
    }

    public BigDecimal getCoutUnitaire() {
        return coutUnitaire;
    }

    public boolean isActif() {
        return actif;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public void setUniteReference(UniteMesure uniteReference) {
        this.uniteReference = uniteReference;
    }

    public void setCoutUnitaire(BigDecimal coutUnitaire) {
        this.coutUnitaire = coutUnitaire;
    }

    public void setActif(boolean actif) {
        this.actif = actif;
    }
}
