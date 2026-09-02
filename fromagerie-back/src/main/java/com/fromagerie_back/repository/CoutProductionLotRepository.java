package com.fromagerie_back.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fromagerie_back.model.CoutProductionLot;

public interface CoutProductionLotRepository extends JpaRepository<CoutProductionLot, Long> {
    Optional<CoutProductionLot> findByFabricationId(Long fabricationId);

    @EntityGraph(attributePaths = { "fabrication", "fabrication.recette", "fabrication.recette.fromage" })
    List<CoutProductionLot> findAllByOrderByDateCalculDesc();

    List<CoutProductionLot> findByFabricationIdIn(Collection<Long> fabricationIds);
}
