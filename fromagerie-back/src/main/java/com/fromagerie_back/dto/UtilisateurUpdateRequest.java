package com.fromagerie_back.dto;

import com.fromagerie_back.model.Role;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UtilisateurUpdateRequest(
        @NotBlank(message = "Le nom est obligatoire")
        @Size(max = 150, message = "Le nom ne peut pas dépasser 150 caractères")
        String nom,
        @NotNull(message = "Le rôle est obligatoire") Role role,
        @NotNull(message = "Le statut est obligatoire") Boolean actif,
        String credential) {
}
