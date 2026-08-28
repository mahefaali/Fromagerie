package com.fromagerie_back.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FromageUpdateRequest {

    @NotBlank(message = "Le nom du fromage est obligatoire")
    @Size(
        min = 2,
        max = 100,
        message = "Le nom doit contenir entre 2 et 100 caractères"
    )
    private String nom;

    @NotBlank(message = "La description du fromage est obligatoire")
    @Size(
        max = 500,
        message = "La description ne peut pas dépasser 500 caractères"
    )
    private String description;

    public FromageUpdateRequest() {
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}