package com.fromagerie_back.dto;

import java.time.LocalDateTime;

import com.fromagerie_back.model.TypeSoinAffinage;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SoinAffinageRequest(
        @NotNull TypeSoinAffinage type,
        LocalDateTime dateHeure,
        @Size(max = 1000) String observation,
        @Size(max = 255) String etatCroute) {
}
