package com.fromagerie_back.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fromagerie_back.exception.InvalidCredentialException;
import com.fromagerie_back.exception.ResourceNotFoundException;
import com.fromagerie_back.model.Role;
import com.fromagerie_back.model.Utilisateur;
import com.fromagerie_back.repository.UtilisateurRepository;

@Service
public class UtilisateurService {

    private static final String EMPLOYEE_PIN_PATTERN = "^[0-9]{4}$";

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    public UtilisateurService(
            UtilisateurRepository utilisateurRepository,
            PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Utilisateur createUser(
            String username,
            String nom,
            String credential,
            Role role,
            boolean actif) {
        requireText(username, "Le username est obligatoire");
        requireText(nom, "Le nom est obligatoire");
        validateCredential(role, credential);

        String normalizedUsername = username.trim();
        if (utilisateurRepository.existsByUsername(normalizedUsername)) {
            throw new IllegalArgumentException("Ce username est déjà utilisé");
        }

        Utilisateur utilisateur = new Utilisateur(
                normalizedUsername,
                nom.trim(),
                passwordEncoder.encode(credential),
                role,
                actif);

        return utilisateurRepository.save(utilisateur);
    }

    @Transactional
    public void updateCredential(Long utilisateurId, String credential) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        validateCredential(utilisateur.getRole(), credential);
        utilisateur.setCredentialHash(passwordEncoder.encode(credential));
    }

    @Transactional
    public Utilisateur ensureDemoUser(
            String username,
            String nom,
            String credential,
            Role role) {
        Utilisateur utilisateur = utilisateurRepository.findByUsername(username.trim())
                .orElseGet(() -> createUser(username, nom, credential, role, true));

        utilisateur.setNom(nom.trim());
        utilisateur.setRole(role);
        utilisateur.setActif(true);
        validateCredential(role, credential);
        utilisateur.setCredentialHash(passwordEncoder.encode(credential));
        return utilisateurRepository.save(utilisateur);
    }

    private void validateCredential(Role role, String credential) {
        if (role == null) {
            throw new InvalidCredentialException("Le rôle est obligatoire");
        }
        requireText(credential, "Le credential est obligatoire");

        if (role != Role.PROPRIETAIRE && !credential.matches(EMPLOYEE_PIN_PATTERN)) {
            throw new InvalidCredentialException("Le PIN employé doit contenir exactement 4 chiffres");
        }
    }

    private void requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new InvalidCredentialException(message);
        }
    }
}
