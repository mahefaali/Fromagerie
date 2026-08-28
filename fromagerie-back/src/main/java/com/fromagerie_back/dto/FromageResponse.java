package com.fromagerie_back.dto;

public class FromageResponse {

    private Long id;
    private String nom;
    private String description;

    public FromageResponse(
            Long id,
            String nom,
            String description) {

        this.id = id;
        this.nom = nom;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public String getDescription() {
        return description;
    }
}