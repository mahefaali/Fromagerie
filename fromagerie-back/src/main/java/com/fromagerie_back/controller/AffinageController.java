package com.fromagerie_back.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fromagerie_back.dto.AffinageCreateRequest;
import com.fromagerie_back.dto.AffinageDetailResponse;
import com.fromagerie_back.dto.AffinageListResponse;
import com.fromagerie_back.dto.AffinagePlacementRequest;
import com.fromagerie_back.dto.DeplacementAffinageRequest;
import com.fromagerie_back.dto.PlacementResultResponse;
import com.fromagerie_back.dto.SoinAffinageRequest;
import com.fromagerie_back.dto.SoinAffinageResponse;
import com.fromagerie_back.dto.SortieAffinageRequest;
import com.fromagerie_back.dto.StockFromageFiniResponse;
import com.fromagerie_back.dto.affinage.AffinageCapacityPlanningResponse;
import com.fromagerie_back.dto.affinage.AffinageDashboardResponse;
import com.fromagerie_back.service.AffinageService;
import com.fromagerie_back.service.StockFromageFiniService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/affinages")
public class AffinageController {

    private final AffinageService affinageService;
    private final StockFromageFiniService stockService;

    public AffinageController(AffinageService affinageService, StockFromageFiniService stockService) {
        this.affinageService = affinageService;
        this.stockService = stockService;
    }

    @GetMapping
    public List<AffinageListResponse> findAll() {
        return affinageService.findAll();
    }

    @GetMapping("/dashboard")
    public AffinageDashboardResponse dashboard() {
        return affinageService.dashboard();
    }

    @GetMapping("/planification")
    public AffinageCapacityPlanningResponse planification() {
        return affinageService.planification();
    }

    @GetMapping("/{id}")
    public AffinageDetailResponse findById(@PathVariable Long id) {
        return affinageService.findById(id);
    }

    @PostMapping
    public ResponseEntity<AffinageDetailResponse> create(
            @Valid @RequestBody AffinageCreateRequest request) {
        AffinageDetailResponse response = affinageService.create(request);
        return ResponseEntity.created(URI.create("/api/affinages/" + response.id())).body(response);
    }

    @PostMapping("/{id}/placements")
    public PlacementResultResponse placer(
            @PathVariable Long id,
            @Valid @RequestBody AffinagePlacementRequest request) {
        return affinageService.placer(id, request);
    }

    @PostMapping("/{id}/deplacement")
    public PlacementResultResponse deplacer(
            @PathVariable Long id,
            @Valid @RequestBody DeplacementAffinageRequest request) {
        return affinageService.deplacer(id, request);
    }

    @PostMapping("/{id}/sortie-stock")
    public StockFromageFiniResponse sortirVersStock(
            @PathVariable Long id,
            @Valid @RequestBody SortieAffinageRequest request,
            Authentication authentication) {
        return stockService.sortirAffinage(id, request, authentication);
    }

    @GetMapping("/{id}/soins")
    public List<SoinAffinageResponse> findSoins(@PathVariable Long id) {
        return affinageService.findSoins(id);
    }

    @PostMapping("/{id}/soins")
    public ResponseEntity<SoinAffinageResponse> addSoin(
            @PathVariable Long id,
            @Valid @RequestBody SoinAffinageRequest request,
            Authentication authentication) {
        SoinAffinageResponse response = affinageService.addSoin(id, request, authentication);
        return ResponseEntity.created(URI.create("/api/affinages/" + id + "/soins/" + response.id()))
                .body(response);
    }
}
