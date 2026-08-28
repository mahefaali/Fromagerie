package com.fromagerie_back.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record CoutProductionManuelRequest(@NotNull @PositiveOrZero BigDecimal coutUnitaire) {}
