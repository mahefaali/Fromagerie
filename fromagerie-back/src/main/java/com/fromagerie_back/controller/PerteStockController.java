package com.fromagerie_back.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fromagerie_back.dto.CoutProductionManuelRequest;
import com.fromagerie_back.dto.CoutProductionManuelResponse;
import com.fromagerie_back.dto.PerteStockRequest;
import com.fromagerie_back.dto.PerteStockResponse;
import com.fromagerie_back.service.PerteStockService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class PerteStockController {
    private final PerteStockService service;
    public PerteStockController(PerteStockService service) { this.service = service; }

    @GetMapping("/couts-production-manuels")
    public List<CoutProductionManuelResponse> listCouts() { return service.listCouts(); }

    @GetMapping("/couts-production-manuels/{fromageId}")
    public CoutProductionManuelResponse getCout(@PathVariable Long fromageId) { return service.getCout(fromageId); }

    @PutMapping("/couts-production-manuels/{fromageId}")
    public CoutProductionManuelResponse updateCout(@PathVariable Long fromageId, @Valid @RequestBody CoutProductionManuelRequest request, Authentication auth) {
        return service.updateCout(fromageId, request, auth);
    }

    @PostMapping("/stock-fromages-finis/{stockId}/pertes")
    public ResponseEntity<PerteStockResponse> declarePerte(@PathVariable Long stockId, @Valid @RequestBody PerteStockRequest request, Authentication auth) {
        PerteStockResponse response = service.declarePerte(stockId, request, auth);
        return ResponseEntity.created(URI.create("/api/pertes/" + response.id())).body(response);
    }

    @GetMapping("/pertes")
    public List<PerteStockResponse> listPertes(@RequestParam(required = false) Long stockId) {
        return service.listPertes(stockId);
    }

    @GetMapping("/pertes/{id}")
    public PerteStockResponse getPerte(@PathVariable Long id) { return service.getPerte(id); }
}
