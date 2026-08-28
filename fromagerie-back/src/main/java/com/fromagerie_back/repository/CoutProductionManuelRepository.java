package com.fromagerie_back.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fromagerie_back.model.CoutProductionManuel;

public interface CoutProductionManuelRepository extends JpaRepository<CoutProductionManuel, Long> {
    @EntityGraph(attributePaths = { "fromage", "utilisateurModification" })
    List<CoutProductionManuel> findAllByOrderByFromageNomAsc();

    @EntityGraph(attributePaths = { "fromage", "utilisateurModification" })
    Optional<CoutProductionManuel> findByFromageId(Long fromageId);
}
