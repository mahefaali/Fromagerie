package com.fromagerie_back.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fromagerie_back.dto.RentabiliteAnalyseResponse;
import com.fromagerie_back.service.RentabiliteService;

@RestController
@RequestMapping("/api/rentabilite")
public class RentabiliteController {
    private final RentabiliteService service;

    public RentabiliteController(RentabiliteService service) { this.service = service; }

    @GetMapping("/analyse")
    public RentabiliteAnalyseResponse analyser(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(required = false) Long fromageId,
            @RequestParam(required = false) Long clientId) {
        return service.analyser(dateDebut, dateFin, fromageId, clientId);
    }
}
