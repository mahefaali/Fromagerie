package com.fromagerie_back.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fromagerie_back.model.RegleAmortissement;

public interface RegleAmortissementRepository extends JpaRepository<RegleAmortissement, Long> {
    @EntityGraph(attributePaths = "equipement")
    List<RegleAmortissement> findAllByOrderByEquipementNomAscDateDebutValiditeDesc();
    List<RegleAmortissement> findByEquipementId(Long equipementId);
}
