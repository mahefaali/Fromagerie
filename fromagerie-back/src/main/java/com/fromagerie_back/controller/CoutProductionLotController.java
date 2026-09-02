package com.fromagerie_back.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fromagerie_back.dto.CoutProductionLotResponse;
import com.fromagerie_back.service.CoutProductionCalculService;

@RestController
@RequestMapping("/api/couts-production/lots")
public class CoutProductionLotController {
    private final CoutProductionCalculService service;

    public CoutProductionLotController(CoutProductionCalculService service) {
        this.service = service;
    }

    @GetMapping
    public List<CoutProductionLotResponse> findAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public CoutProductionLotResponse findById(@PathVariable Long id) { return service.findByFabricationId(id); }
}
