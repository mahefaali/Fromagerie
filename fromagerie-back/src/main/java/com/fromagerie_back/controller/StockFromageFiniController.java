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
import org.springframework.web.bind.annotation.RestController;

import com.fromagerie_back.dto.EmplacementStockRequest;
import com.fromagerie_back.dto.EmplacementStockResponse;
import com.fromagerie_back.dto.MouvementStockRequest;
import com.fromagerie_back.dto.MouvementStockResponse;
import com.fromagerie_back.dto.StockAlerteResponse;
import com.fromagerie_back.dto.StockFromageFiniRequest;
import com.fromagerie_back.dto.StockFromageFiniResponse;
import com.fromagerie_back.service.StockFromageFiniService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class StockFromageFiniController {

    private final StockFromageFiniService stockService;

    public StockFromageFiniController(StockFromageFiniService stockService) {
        this.stockService = stockService;
    }

    @GetMapping("/emplacements-stock")
    public List<EmplacementStockResponse> findAllEmplacements() {
        return stockService.findAllEmplacements();
    }

    @GetMapping("/emplacements-stock/{id}")
    public EmplacementStockResponse findEmplacementById(@PathVariable Long id) {
        return stockService.findEmplacementById(id);
    }

    @PostMapping("/emplacements-stock")
    public ResponseEntity<EmplacementStockResponse> createEmplacement(@Valid @RequestBody EmplacementStockRequest request) {
        EmplacementStockResponse response = stockService.createEmplacement(request);
        return ResponseEntity.created(URI.create("/api/emplacements-stock/" + response.id())).body(response);
    }

    @PutMapping("/emplacements-stock/{id}")
    public EmplacementStockResponse updateEmplacement(@PathVariable Long id, @Valid @RequestBody EmplacementStockRequest request) {
        return stockService.updateEmplacement(id, request);
    }

    @GetMapping("/stock-fromages-finis")
    public List<StockFromageFiniResponse> findAllStocks() {
        return stockService.findAllStocks();
    }

    @GetMapping("/stock-fromages-finis/alertes")
    public List<StockAlerteResponse> findAlertes() {
        return stockService.findAlertes();
    }

    @GetMapping("/stock-fromages-finis/{id}")
    public StockFromageFiniResponse findStockById(@PathVariable Long id) {
        return stockService.findStockById(id);
    }

    @PostMapping("/stock-fromages-finis")
    public ResponseEntity<StockFromageFiniResponse> createStock(
            @Valid @RequestBody StockFromageFiniRequest request,
            Authentication authentication) {
        StockFromageFiniResponse response = stockService.createStock(request, authentication);
        return ResponseEntity.created(URI.create("/api/stock-fromages-finis/" + response.id())).body(response);
    }

    @GetMapping("/stock-fromages-finis/{id}/mouvements")
    public List<MouvementStockResponse> findMouvements(@PathVariable Long id) {
        return stockService.findMouvements(id);
    }

    @PostMapping("/stock-fromages-finis/{id}/mouvements")
    public MouvementStockResponse addMouvement(
            @PathVariable Long id,
            @Valid @RequestBody MouvementStockRequest request,
            Authentication authentication) {
        return stockService.addMouvement(id, request, authentication);
    }
}
