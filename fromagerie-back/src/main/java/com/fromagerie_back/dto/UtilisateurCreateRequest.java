package com.fromagerie_back.dto;

import com.fromagerie_back.model.Role;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UtilisateurCreateRequest(
        @NotBlank(message = "Le username est obligatoire")
        @Size(max = 100, message = "Le username ne peut pas dépasser 100 caractères")
        String username,
        @NotBlank(message = "Le nom est obligatoire")
        @Size(max = 150, message = "Le nom ne peut pas dépasser 150 caractères")
        String nom,
        @NotBlank(message = "Le mot de passe ou PIN est obligatoire")
        String credential,
        @NotNull(message = "Le rôle est obligatoire") Role role,
        Boolean actif) {
}
