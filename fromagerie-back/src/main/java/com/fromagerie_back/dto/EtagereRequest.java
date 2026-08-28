package com.fromagerie_back.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record EtagereRequest(
        @NotNull @Positive Integer numero,
        @NotNull @Positive Integer ordre,
        @NotEmpty List<@Valid RangeeRequest> rangees) {
}
