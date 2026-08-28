package com.fromagerie_back.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fromagerie_back.model.Utilisateur;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    Optional<Utilisateur> findByUsername(String username);

    boolean existsByUsername(String username);
}
