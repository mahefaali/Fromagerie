package com.fromagerie_back.dto;

import com.fromagerie_back.model.Role;

public class AuthUserResponse {

    private final Long id;
    private final String username;
    private final String nom;
    private final Role role;

    public AuthUserResponse(Long id, String username, String nom, Role role) {
        this.id = id;
        this.username = username;
        this.nom = nom;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getNom() {
        return nom;
    }

    public Role getRole() {
        return role;
    }
}
