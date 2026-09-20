package com.fromagerie_back.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fromagerie_back.dto.TracabiliteDescendanteResponse;
import com.fromagerie_back.service.TracabiliteService;

@RestController
@RequestMapping("/api/tracabilite/descendante")
public class TracabiliteDescendanteController {
    private final TracabiliteService service;

    public TracabiliteDescendanteController(TracabiliteService service) {
        this.service = service;
    }

    @GetMapping("/{numeroLot}")
    public TracabiliteDescendanteResponse rechercher(@PathVariable String numeroLot) {
        return service.byNumeroLotDescendant(numeroLot);
    }
}
