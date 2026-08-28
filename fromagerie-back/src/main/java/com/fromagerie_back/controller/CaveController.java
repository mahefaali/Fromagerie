package com.fromagerie_back.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fromagerie_back.dto.CaveRequest;
import com.fromagerie_back.dto.CaveOccupationResponse;
import com.fromagerie_back.dto.CaveResponse;
import com.fromagerie_back.service.CaveService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/caves")
public class CaveController {

    private final CaveService caveService;

    public CaveController(CaveService caveService) {
        this.caveService = caveService;
    }

    @GetMapping
    public List<CaveResponse> findAll() {
        return caveService.findAll();
    }

    @GetMapping("/{id}")
    public CaveResponse findById(@PathVariable Long id) {
        return caveService.findById(id);
    }

    @GetMapping("/{id}/occupations")
    public List<CaveOccupationResponse> findOccupations(@PathVariable Long id) {
        return caveService.findOccupations(id);
    }

    @PostMapping
    public ResponseEntity<CaveResponse> create(@Valid @RequestBody CaveRequest request) {
        CaveResponse response = caveService.create(request);
        return ResponseEntity.created(URI.create("/api/caves/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public CaveResponse update(@PathVariable Long id, @Valid @RequestBody CaveRequest request) {
        return caveService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        caveService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
