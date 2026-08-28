package com.fromagerie_back.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fromagerie_back.dto.RecetteCreateRequest;
import com.fromagerie_back.dto.RecetteDetailResponse;
import com.fromagerie_back.dto.RecetteHistoryResponse;
import com.fromagerie_back.dto.RecetteListResponse;
import com.fromagerie_back.dto.RecetteVersionRequest;
import com.fromagerie_back.service.RecetteService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/recettes")
public class RecetteController {

    private final RecetteService recetteService;

    public RecetteController(RecetteService recetteService) {
        this.recetteService = recetteService;
    }

    @GetMapping
    public List<RecetteListResponse> findAll(
            @RequestParam(required = false) Long fromageId,
            @RequestParam(defaultValue = "true") Boolean active,
            @RequestParam(required = false) String nom) {
        return recetteService.findAll(fromageId, active, nom);
    }

    @GetMapping("/{id}")
    public RecetteDetailResponse findById(@PathVariable Long id) {
        return recetteService.findById(id);
    }

    @GetMapping("/{id}/historique")
    public List<RecetteHistoryResponse> history(@PathVariable Long id) {
        return recetteService.history(id);
    }

    @PostMapping
    public ResponseEntity<RecetteDetailResponse> create(
            @Valid @RequestBody RecetteCreateRequest request) {
        RecetteDetailResponse response = recetteService.create(request);
        return ResponseEntity.created(URI.create("/api/recettes/" + response.id())).body(response);
    }

    @PostMapping("/{id}/versions")
    public ResponseEntity<RecetteDetailResponse> createVersion(
            @PathVariable Long id,
            @Valid @RequestBody RecetteVersionRequest request) {
        RecetteDetailResponse response = recetteService.createVersion(id, request);
        return ResponseEntity.created(URI.create("/api/recettes/" + response.id())).body(response);
    }
}
