package com.fromagerie_back.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fromagerie_back.dto.FabricationCreateRequest;
import com.fromagerie_back.dto.FabricationDetailResponse;
import com.fromagerie_back.dto.FabricationListResponse;
import com.fromagerie_back.dto.FabricationUpdateRequest;
import com.fromagerie_back.service.FabricationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/fabrications")
public class FabricationController {

    private final FabricationService fabricationService;

    public FabricationController(FabricationService fabricationService) {
        this.fabricationService = fabricationService;
    }

    @GetMapping
    public List<FabricationListResponse> findAll() {
        return fabricationService.findAll();
    }

    @GetMapping("/{id}")
    public FabricationDetailResponse findById(@PathVariable Long id) {
        return fabricationService.findById(id);
    }

    @PostMapping
    public ResponseEntity<FabricationDetailResponse> create(
            @Valid @RequestBody FabricationCreateRequest request) {
        FabricationDetailResponse response = fabricationService.create(request);
        return ResponseEntity
                .created(URI.create("/api/fabrications/" + response.id()))
                .body(response);
    }

    @PutMapping("/{id}")
    public FabricationDetailResponse update(
            @PathVariable Long id,
            @Valid @RequestBody FabricationUpdateRequest request) {
        return fabricationService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        fabricationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
