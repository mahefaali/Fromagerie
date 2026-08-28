package com.fromagerie_back.controller;

import com.fromagerie_back.service.FromageService;
import com.fromagerie_back.service.FabricationService;

import jakarta.validation.Valid;

import com.fromagerie_back.dto.FromageCreateRequest;
import com.fromagerie_back.dto.FromageResponse;
import com.fromagerie_back.dto.FromageUpdateRequest;
import com.fromagerie_back.dto.RecetteVarianteResponse;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FromageController {

    private final FromageService fromageService;
    private final FabricationService fabricationService;

    public FromageController(
            FromageService fromageService,
            FabricationService fabricationService) {
        this.fromageService = fromageService;
        this.fabricationService = fabricationService;
    }

    @GetMapping("/api/fromages")
    public List<FromageResponse> getAllFromages() {
        return fromageService.getAllFromages();
    }

    @GetMapping("/api/fromages/{id}")
    public FromageResponse getFromageById(@PathVariable Long id) {
        return fromageService.getFromageById(id);
    }

    @GetMapping("/api/fromages/{id}/recettes/variantes")
    public List<RecetteVarianteResponse> getRecetteVariantes(@PathVariable Long id) {
        return fabricationService.findAvailableVariants(id);
    }

    @PostMapping("/api/fromages")
    public FromageResponse createFromage(@Valid @RequestBody FromageCreateRequest request) {
        return fromageService.createFromage(request);
    }

    @PutMapping("/api/fromages/{id}")
    public FromageResponse updateFromage(
            @PathVariable Long id,
            @Valid @RequestBody FromageUpdateRequest request) {

        return fromageService.updateFromage(id, request);
    }

    @DeleteMapping("/api/fromages/{id}")
    public ResponseEntity<Void> deleteFromage(@PathVariable Long id) {

        fromageService.deleteFromage(id);

        return ResponseEntity.noContent().build();
    }
}
