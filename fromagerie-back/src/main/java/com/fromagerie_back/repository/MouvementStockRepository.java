package com.fromagerie_back.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fromagerie_back.model.MouvementStock;
import com.fromagerie_back.model.TypeMouvementStock;

public interface MouvementStockRepository extends JpaRepository<MouvementStock, Long> {
    @EntityGraph(attributePaths = { "utilisateur", "stockFromageFini", "stockFromageFini.lotAffinage",
            "stockFromageFini.lotAffinage.fabrication", "stockFromageFini.lotAffinage.fabrication.recette",
            "stockFromageFini.lotAffinage.fabrication.recette.fromage", "stockFromageFini.emplacementStock" })
    List<MouvementStock> findAllByStockFromageFiniIdOrderByDateMouvementDescIdDesc(Long stockFromageFiniId);
    boolean existsByStockFromageFiniIdAndType(Long stockFromageFiniId, TypeMouvementStock type);
    @Query("select coalesce(sum(case when m.type in :entrees then m.quantite else -m.quantite end),0) from MouvementStock m where m.stockFromageFini.id=:stockId")
    int quantityAvailable(@Param("stockId") Long stockId, @Param("entrees") java.util.Collection<TypeMouvementStock> entrees);
}
