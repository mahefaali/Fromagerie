package com.fromagerie_back.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fromagerie_back.exception.BusinessConflictException;
import com.fromagerie_back.exception.BusinessValidationException;
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
        validateCredential(role, credential, false);

        String normalizedUsername = username.trim();
        if (utilisateurRepository.existsByUsername(normalizedUsername)) {
            throw new BusinessConflictException("Ce username est déjà utilisé");
        }

        Utilisateur utilisateur = new Utilisateur(
                normalizedUsername,
                nom.trim(),
                passwordEncoder.encode(credential),
                role,
                actif);

        return utilisateurRepository.save(utilisateur);
    }

    @Transactional(readOnly = true)
    public List<Utilisateur> findAllUsers(boolean includeInactive) {
        return utilisateurRepository.findAll().stream()
                .filter(utilisateur -> includeInactive || utilisateur.isActif())
                .sorted(Comparator.comparing(Utilisateur::getNom, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @Transactional
    public Utilisateur deactivateUser(Long utilisateurId) {
        Utilisateur utilisateur = findUser(utilisateurId);
        if (utilisateur.getRole() == Role.PROPRIETAIRE) {
            throw new BusinessValidationException("Un compte propriétaire ne peut pas être désactivé");
        }
        utilisateur.setActif(false);
        return utilisateur;
    }

    @Transactional
    public Utilisateur reactivateUser(Long utilisateurId) {
        Utilisateur utilisateur = findUser(utilisateurId);
        utilisateur.setActif(true);
        return utilisateur;
    }

    @Transactional
    public Utilisateur updateUser(
            Long utilisateurId,
            String nom,
            Role role,
            boolean actif,
            String credential) {
        Utilisateur utilisateur = findUser(utilisateurId);
        requireText(nom, "Le nom est obligatoire");
        if ((credential == null || credential.isBlank()) && role != utilisateur.getRole()) {
            throw new InvalidCredentialException("Un nouveau credential est obligatoire lors d'un changement de rôle");
        }
        validateCredential(role, credential, true);

        utilisateur.setNom(nom.trim());
        utilisateur.setRole(role);
        utilisateur.setActif(actif);
        if (credential != null && !credential.isBlank()) {
            utilisateur.setCredentialHash(passwordEncoder.encode(credential));
        }
        return utilisateur;
    }

    @Transactional(readOnly = true)
    public Utilisateur findUser(Long utilisateurId) {
        return utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }

    @Transactional
    public void updateCredential(Long utilisateurId, String credential) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        validateCredential(utilisateur.getRole(), credential, false);
        utilisateur.setCredentialHash(passwordEncoder.encode(credential));
    }

    @Transactional
    public Utilisateur ensureDemoUser(
            String username,
            String nom,
            String credential,
            Role role) {
        Utilisateur utilisateur = utilisateurRepository.findByUsername(username.trim()).orElse(null);
        if (utilisateur == null) {
            return createUser(username, nom, credential, role, true);
        }

        utilisateur.setNom(nom.trim());
        utilisateur.setRole(role);
        validateCredential(role, credential, false);
        utilisateur.setCredentialHash(passwordEncoder.encode(credential));
        return utilisateurRepository.save(utilisateur);
    }

    private void validateCredential(Role role, String credential, boolean allowBlank) {
        if (role == null) {
            throw new InvalidCredentialException("Le rôle est obligatoire");
        }
        if (allowBlank && (credential == null || credential.isBlank())) {
            return;
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
