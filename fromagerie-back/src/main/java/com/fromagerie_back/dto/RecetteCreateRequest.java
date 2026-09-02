package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RecetteCreateRequest {

    @NotBlank(message = "Le nom de la recette est obligatoire")
    @Size(max = 150, message = "Le nom ne peut pas dépasser 150 caractères")
    private String nom;

    @NotNull(message = "Le fromage est obligatoire")
    private Long fromageId;

    private boolean recetteDeBase;

    private Integer frequenceRetournementJours;

    private BigDecimal quantiteLaitReference;

    @NotEmpty(message = "La recette doit contenir au moins un ingrédient")
    private List<@Valid RecetteIngredientRequest> ingredients = new ArrayList<>();

    public String getNom() {
        return nom;
    }

    public Long getFromageId() {
        return fromageId;
    }

    public List<RecetteIngredientRequest> getIngredients() {
        return ingredients;
    }

    public boolean isRecetteDeBase() {
        return recetteDeBase;
    }

    public Integer getFrequenceRetournementJours() {
        return frequenceRetournementJours;
    }

    public BigDecimal getQuantiteLaitReference() {
        return quantiteLaitReference;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public void setFromageId(Long fromageId) {
        this.fromageId = fromageId;
    }

    public void setRecetteDeBase(boolean recetteDeBase) {
        this.recetteDeBase = recetteDeBase;
    }

    public void setFrequenceRetournementJours(Integer frequenceRetournementJours) {
        this.frequenceRetournementJours = frequenceRetournementJours;
    }

    public void setQuantiteLaitReference(BigDecimal quantiteLaitReference) {
        this.quantiteLaitReference = quantiteLaitReference;
    }

    public void setIngredients(List<RecetteIngredientRequest> ingredients) {
        this.ingredients = ingredients;
    }
}
