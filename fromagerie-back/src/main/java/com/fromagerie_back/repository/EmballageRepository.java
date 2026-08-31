package com.fromagerie_back.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fromagerie_back.model.Emballage;

public interface EmballageRepository extends JpaRepository<Emballage, Long> {
    List<Emballage> findAllByOrderByNomAsc();
    boolean existsByNomIgnoreCase(String nom);
    boolean existsByNomIgnoreCaseAndIdNot(String nom, Long id);
}
