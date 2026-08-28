package com.fromagerie_back.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fromagerie_back.dto.UtilisateurCreateRequest;
import com.fromagerie_back.dto.UtilisateurResponse;
import com.fromagerie_back.dto.UtilisateurUpdateRequest;
import com.fromagerie_back.exception.BusinessValidationException;
import com.fromagerie_back.security.CustomUserDetails;
import com.fromagerie_back.service.UtilisateurService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    public UtilisateurController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    @GetMapping
    public List<UtilisateurResponse> findAll(
            @RequestParam(defaultValue = "false") boolean inclureInactifs) {
        return utilisateurService.findAllUsers(inclureInactifs).stream()
                .map(UtilisateurResponse::from)
                .toList();
    }

    @PostMapping
    public ResponseEntity<UtilisateurResponse> create(@Valid @RequestBody UtilisateurCreateRequest request) {
        var utilisateur = utilisateurService.createUser(
                request.username(),
                request.nom(),
                request.credential(),
                request.role(),
                request.actif() == null || request.actif());
        return ResponseEntity.status(HttpStatus.CREATED).body(UtilisateurResponse.from(utilisateur));
    }

    @PutMapping("/{id}")
    public UtilisateurResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UtilisateurUpdateRequest request) {
        return UtilisateurResponse.from(utilisateurService.updateUser(
                id,
                request.nom(),
                request.role(),
                request.actif(),
                request.credential()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable Long id, Authentication authentication) {
        if (authentication.getPrincipal() instanceof CustomUserDetails currentUser
                && currentUser.getId().equals(id)) {
            throw new BusinessValidationException("Vous ne pouvez pas désactiver votre propre compte");
        }
        utilisateurService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reactivation")
    public UtilisateurResponse reactivate(@PathVariable Long id) {
        return UtilisateurResponse.from(utilisateurService.reactivateUser(id));
    }
}
