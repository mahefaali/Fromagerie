package com.fromagerie_back.dto;

import com.fromagerie_back.model.Role;
import com.fromagerie_back.model.Utilisateur;

public record UtilisateurResponse(
        Long id,
        String username,
        String nom,
        Role role,
        boolean actif) {

    public static UtilisateurResponse from(Utilisateur utilisateur) {
        return new UtilisateurResponse(
                utilisateur.getId(),
                utilisateur.getUsername(),
                utilisateur.getNom(),
                utilisateur.getRole(),
                utilisateur.isActif());
    }
}
