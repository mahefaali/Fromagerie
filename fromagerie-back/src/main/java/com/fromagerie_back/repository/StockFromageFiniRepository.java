package com.fromagerie_back.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import com.fromagerie_back.model.StockFromageFini;
import com.fromagerie_back.model.StatutStockFromageFini;
import com.fromagerie_back.model.Fromage;

public interface StockFromageFiniRepository extends JpaRepository<StockFromageFini, Long> {
    boolean existsByLotAffinageId(Long lotAffinageId);

    @EntityGraph(attributePaths = { "lotAffinage", "lotAffinage.fabrication", "lotAffinage.fabrication.recette",
            "lotAffinage.fabrication.recette.fromage", "emplacementStock" })
    List<StockFromageFini> findAllByOrderByDateEntreeStockDescIdDesc();

    @EntityGraph(attributePaths = { "lotAffinage", "lotAffinage.fabrication", "lotAffinage.fabrication.recette",
            "lotAffinage.fabrication.recette.fromage", "emplacementStock" })
    Optional<StockFromageFini> findById(Long id);

    @EntityGraph(attributePaths = { "lotAffinage", "lotAffinage.fabrication", "lotAffinage.fabrication.recette",
            "lotAffinage.fabrication.recette.fromage", "emplacementStock" })
    Optional<StockFromageFini> findByLotAffinageId(Long lotAffinageId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from StockFromageFini s join fetch s.lotAffinage l join fetch l.fabrication f join fetch f.recette r join fetch r.fromage cheese join fetch s.emplacementStock where cheese.id=:fromageId and s.statut=:statut and s.dateDurabilite >= current_date order by s.dateDurabilite asc, s.id asc")
    List<StockFromageFini> findAvailableByFromage(@Param("fromageId") Long fromageId, @Param("statut") StatutStockFromageFini statut);
}
