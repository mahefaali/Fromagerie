package com.fromagerie_back.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fromagerie_back.model.EmplacementStock;

public interface EmplacementStockRepository extends JpaRepository<EmplacementStock, Long> {
    List<EmplacementStock> findAllByOrderByNomAsc();

    boolean existsByNomIgnoreCase(String nom);
}
