package com.fromagerie_back.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fromagerie_back.dto.analytics.AnomalyAnalyticsResponse;
import com.fromagerie_back.dto.analytics.FabricationAnomalyResponse;
import com.fromagerie_back.dto.analytics.ParametreAnomalie;
import com.fromagerie_back.dto.analytics.SeasonalYieldComparisonResponse;
import com.fromagerie_back.dto.analytics.TemperatureHistoryPointResponse;
import com.fromagerie_back.dto.analytics.YieldAnalyticsResponse;
import com.fromagerie_back.service.FabricationAnalyticsService;

@RestController
@RequestMapping("/api/fabrications")
public class FabricationAnalyticsController {

    private final FabricationAnalyticsService analyticsService;

    public FabricationAnalyticsController(FabricationAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/analytics/temperatures")
    public List<TemperatureHistoryPointResponse> temperatures(
            @RequestParam(required = false) Long fromageId,
            @RequestParam(required = false) Long recetteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        return analyticsService.temperatures(fromageId, recetteId, dateDebut, dateFin);
    }

    @GetMapping("/analytics/rendements")
    public YieldAnalyticsResponse rendements(
            @RequestParam(required = false) Long fromageId,
            @RequestParam(required = false) Long recetteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        return analyticsService.rendements(fromageId, recetteId, dateDebut, dateFin);
    }

    @GetMapping("/analytics/rendements/saisons")
    public SeasonalYieldComparisonResponse rendementsParSaison(
            @RequestParam Long fromageId,
            @RequestParam(required = false) Long recetteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        return analyticsService.rendementsParSaison(fromageId, recetteId, dateDebut, dateFin);
    }

    @GetMapping("/analytics/anomalies")
    public AnomalyAnalyticsResponse anomalies(
            @RequestParam(required = false) Long fromageId,
            @RequestParam(required = false) Long recetteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) ParametreAnomalie parametre) {
        return analyticsService.anomalies(fromageId, recetteId, dateDebut, dateFin, parametre);
    }

    @GetMapping("/{id}/analytics/anomalies")
    public FabricationAnomalyResponse anomaliesForFabrication(
            @PathVariable Long id,
            @RequestParam(required = false) ParametreAnomalie parametre) {
        return analyticsService.anomaliesForFabrication(id, parametre);
    }
}
