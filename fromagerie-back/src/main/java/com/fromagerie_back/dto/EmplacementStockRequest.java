package com.fromagerie_back.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EmplacementStockRequest(
        @NotBlank @Size(max = 120) String nom,
        @Size(max = 500) String description,
        Boolean active) {
}
