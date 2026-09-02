package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public class RecetteVersionRequest {

    @NotBlank(message = "Le nom de la recette est obligatoire")
    @Size(max = 150, message = "Le nom ne peut pas dépasser 150 caractères")
    private String nom;

    @NotEmpty(message = "La recette doit contenir au moins un ingrédient")
    private List<@Valid RecetteIngredientRequest> ingredients = new ArrayList<>();

    private Integer frequenceRetournementJours;

    private BigDecimal quantiteLaitReference;

    public String getNom() {
        return nom;
    }

    public List<RecetteIngredientRequest> getIngredients() {
        return ingredients;
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

    public void setIngredients(List<RecetteIngredientRequest> ingredients) {
        this.ingredients = ingredients;
    }

    public void setFrequenceRetournementJours(Integer frequenceRetournementJours) {
        this.frequenceRetournementJours = frequenceRetournementJours;
    }

    public void setQuantiteLaitReference(BigDecimal quantiteLaitReference) {
        this.quantiteLaitReference = quantiteLaitReference;
    }
}
