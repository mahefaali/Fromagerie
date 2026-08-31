package com.fromagerie_back.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fromagerie_back.dto.ConsommationEmballageRequest;
import com.fromagerie_back.dto.ConsommationEmballageResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/affinages/{lotId}/emballages")
public class ConsommationEmballageController {

    @GetMapping
    public List<ConsommationEmballageResponse> findAll(@PathVariable Long lotId) {
        return List.of();
    }

    @PostMapping
    public ResponseEntity<ConsommationEmballageResponse> create(
            @PathVariable Long lotId,
            @Valid @RequestBody ConsommationEmballageRequest request) {
        ConsommationEmballageResponse response = new ConsommationEmballageResponse(
                null,
                lotId,
                request.emballageId(),
                null,
                request.quantite(),
                request.etape(),
                request.dateHeure(),
                null,
                null);
        return ResponseEntity.created(URI.create("/api/affinages/" + lotId + "/emballages")).body(response);
    }
}
