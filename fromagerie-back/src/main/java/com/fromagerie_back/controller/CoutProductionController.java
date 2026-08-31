package com.fromagerie_back.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fromagerie_back.dto.EmballageRequest;
import com.fromagerie_back.dto.EmballageResponse;
import com.fromagerie_back.dto.EquipementRequest;
import com.fromagerie_back.dto.EquipementResponse;
import com.fromagerie_back.dto.RegleAmortissementRequest;
import com.fromagerie_back.dto.RegleAmortissementResponse;
import com.fromagerie_back.dto.RegleCoutEnergieRequest;
import com.fromagerie_back.dto.RegleCoutEnergieResponse;
import com.fromagerie_back.dto.RegleMainOeuvreRequest;
import com.fromagerie_back.dto.RegleMainOeuvreResponse;
import com.fromagerie_back.dto.TarifLaitRequest;
import com.fromagerie_back.dto.TarifLaitResponse;
import com.fromagerie_back.service.CoutProductionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/configuration/couts")
public class CoutProductionController {
    private final CoutProductionService service;
    public CoutProductionController(CoutProductionService service) { this.service = service; }

    @GetMapping("/lait")
    public List<TarifLaitResponse> lait() { return service.findTarifsLait(); }
    @PostMapping("/lait")
    public ResponseEntity<TarifLaitResponse> createLait(@Valid @RequestBody TarifLaitRequest request) {
        TarifLaitResponse response = service.createTarifLait(request);
        return ResponseEntity.created(URI.create("/api/configuration/couts/lait/" + response.id())).body(response);
    }
    @PutMapping("/lait/{id}")
    public TarifLaitResponse updateLait(@PathVariable Long id, @Valid @RequestBody TarifLaitRequest request) {
        return service.updateTarifLait(id, request);
    }

    @GetMapping("/emballages")
    public List<EmballageResponse> emballages() { return service.findEmballages(); }
    @PostMapping("/emballages")
    public ResponseEntity<EmballageResponse> createEmballage(@Valid @RequestBody EmballageRequest request) {
        EmballageResponse response = service.createEmballage(request);
        return ResponseEntity.created(URI.create("/api/configuration/couts/emballages/" + response.id())).body(response);
    }
    @PutMapping("/emballages/{id}")
    public EmballageResponse updateEmballage(@PathVariable Long id, @Valid @RequestBody EmballageRequest request) {
        return service.updateEmballage(id, request);
    }

    @GetMapping("/energie")
    public List<RegleCoutEnergieResponse> energie() { return service.findReglesEnergie(); }
    @PostMapping("/energie")
    public ResponseEntity<RegleCoutEnergieResponse> createEnergie(@Valid @RequestBody RegleCoutEnergieRequest request) {
        RegleCoutEnergieResponse response = service.createRegleEnergie(request);
        return ResponseEntity.created(URI.create("/api/configuration/couts/energie/" + response.id())).body(response);
    }
    @PutMapping("/energie/{id}")
    public RegleCoutEnergieResponse updateEnergie(@PathVariable Long id, @Valid @RequestBody RegleCoutEnergieRequest request) {
        return service.updateRegleEnergie(id, request);
    }

    @GetMapping("/main-oeuvre")
    public List<RegleMainOeuvreResponse> mainOeuvre() { return service.findReglesMainOeuvre(); }
    @PostMapping("/main-oeuvre")
    public ResponseEntity<RegleMainOeuvreResponse> createMainOeuvre(
            @Valid @RequestBody RegleMainOeuvreRequest request) {
        RegleMainOeuvreResponse response = service.createRegleMainOeuvre(request);
        return ResponseEntity.created(URI.create("/api/configuration/couts/main-oeuvre/" + response.id())).body(response);
    }
    @PutMapping("/main-oeuvre/{id}")
    public RegleMainOeuvreResponse updateMainOeuvre(@PathVariable Long id,
            @Valid @RequestBody RegleMainOeuvreRequest request) {
        return service.updateRegleMainOeuvre(id, request);
    }

    @GetMapping("/equipements")
    public List<EquipementResponse> equipements() { return service.findEquipements(); }
    @PostMapping("/equipements")
    public ResponseEntity<EquipementResponse> createEquipement(@Valid @RequestBody EquipementRequest request) {
        EquipementResponse response = service.createEquipement(request);
        return ResponseEntity.created(URI.create("/api/configuration/couts/equipements/" + response.id())).body(response);
    }
    @PutMapping("/equipements/{id}")
    public EquipementResponse updateEquipement(@PathVariable Long id, @Valid @RequestBody EquipementRequest request) {
        return service.updateEquipement(id, request);
    }

    @GetMapping("/amortissements")
    public List<RegleAmortissementResponse> amortissements() { return service.findReglesAmortissement(); }
    @PostMapping("/amortissements")
    public ResponseEntity<RegleAmortissementResponse> createAmortissement(
            @Valid @RequestBody RegleAmortissementRequest request) {
        RegleAmortissementResponse response = service.createRegleAmortissement(request);
        return ResponseEntity.created(URI.create("/api/configuration/couts/amortissements/" + response.id())).body(response);
    }
    @PutMapping("/amortissements/{id}")
    public RegleAmortissementResponse updateAmortissement(@PathVariable Long id,
            @Valid @RequestBody RegleAmortissementRequest request) {
        return service.updateRegleAmortissement(id, request);
    }
}
