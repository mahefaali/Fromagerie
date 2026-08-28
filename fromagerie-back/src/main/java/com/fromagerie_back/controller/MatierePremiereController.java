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

import com.fromagerie_back.dto.MatierePremiereRequest;
import com.fromagerie_back.dto.MatierePremiereResponse;
import com.fromagerie_back.service.MatierePremiereService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/matieres-premieres")
public class MatierePremiereController {

    private final MatierePremiereService matierePremiereService;

    public MatierePremiereController(MatierePremiereService matierePremiereService) {
        this.matierePremiereService = matierePremiereService;
    }

    @GetMapping
    public List<MatierePremiereResponse> findAll() {
        return matierePremiereService.findAll();
    }

    @GetMapping("/{id}")
    public MatierePremiereResponse findById(@PathVariable Long id) {
        return matierePremiereService.findById(id);
    }

    @PostMapping
    public ResponseEntity<MatierePremiereResponse> create(
            @Valid @RequestBody MatierePremiereRequest request) {
        MatierePremiereResponse response = matierePremiereService.create(request);
        return ResponseEntity.created(URI.create("/api/matieres-premieres/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public MatierePremiereResponse update(
            @PathVariable Long id,
            @Valid @RequestBody MatierePremiereRequest request) {
        return matierePremiereService.update(id, request);
    }
}
