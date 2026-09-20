package com.fromagerie_back.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fromagerie_back.model.PerteStock;
import com.fromagerie_back.model.TypePerteStock;

public interface PerteStockRepository extends JpaRepository<PerteStock, Long> {
    @Query("select coalesce(sum(p.quantite),0) from PerteStock p where p.stockFromageFini.id=:stockId and p.typePerte=:type")
    int quantityByStockAndType(@Param("stockId") Long stockId, @Param("type") TypePerteStock type);
    @Query("select coalesce(sum(p.quantite),0) from PerteStock p where p.reservationStock.id=:reservationId and p.typePerte=:type")
    int quantityByReservationAndType(@Param("reservationId") Long reservationId, @Param("type") TypePerteStock type);
    @EntityGraph(attributePaths = { "stockFromageFini", "stockFromageFini.lotAffinage",
            "stockFromageFini.lotAffinage.fabrication", "stockFromageFini.lotAffinage.fabrication.recette",
            "stockFromageFini.lotAffinage.fabrication.recette.fromage", "utilisateur" })
    List<PerteStock> findAllByOrderByDateHeureDescIdDesc();

    @EntityGraph(attributePaths = { "stockFromageFini", "stockFromageFini.lotAffinage",
            "stockFromageFini.lotAffinage.fabrication", "stockFromageFini.lotAffinage.fabrication.recette",
            "stockFromageFini.lotAffinage.fabrication.recette.fromage", "utilisateur" })
    List<PerteStock> findByStockFromageFiniIdOrderByDateHeureDescIdDesc(Long stockId);

    @EntityGraph(attributePaths = { "stockFromageFini", "utilisateur" })
    List<PerteStock> findByStockFromageFiniIdOrderByDateHeureAscIdAsc(Long stockId);

    @EntityGraph(attributePaths = { "stockFromageFini", "stockFromageFini.lotAffinage",
            "stockFromageFini.lotAffinage.fabrication", "stockFromageFini.lotAffinage.fabrication.recette",
            "stockFromageFini.lotAffinage.fabrication.recette.fromage", "utilisateur" })
    Optional<PerteStock> findById(Long id);
}
