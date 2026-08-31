package com.fromagerie_back.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fromagerie_back.model.Equipement;

public interface EquipementRepository extends JpaRepository<Equipement, Long> {
    List<Equipement> findAllByOrderByNomAsc();
    boolean existsByNomIgnoreCase(String nom);
    boolean existsByNomIgnoreCaseAndIdNot(String nom, Long id);
}
