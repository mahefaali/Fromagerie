package com.fromagerie_back.controller;

import java.time.LocalDate;
import java.time.YearMonth;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fromagerie_back.dto.PerformanceDashboardResponse;
import com.fromagerie_back.service.PerformanceService;

@RestController
@RequestMapping("/api/performances")
public class PerformanceController {
    private final PerformanceService performanceService;

    public PerformanceController(PerformanceService performanceService) {
        this.performanceService = performanceService;
    }

    @GetMapping("/dashboard")
    public PerformanceDashboardResponse dashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) Long fromageId) {
        YearMonth mois = YearMonth.now();
        return performanceService.dashboard(
                dateDebut == null ? mois.atDay(1) : dateDebut,
                dateFin == null ? mois.atEndOfMonth() : dateFin,
                fromageId);
    }
}
