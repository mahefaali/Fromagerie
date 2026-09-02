package com.fromagerie_back.repository;

import java.util.List;
import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fromagerie_back.model.MouvementStock;
import com.fromagerie_back.model.TypeMouvementStock;

public interface MouvementStockRepository extends JpaRepository<MouvementStock, Long> {
    interface PerformanceProjection {
        Long getFromageId();
        String getFromageNom();
        Long getQuantiteEntree();
        Long getQuantitePerdue();
    }

    @Query("""
            select fromage.id as fromageId, fromage.nom as fromageNom,
                   sum(case when m.type = com.fromagerie_back.model.TypeMouvementStock.ENTREE then m.quantite else 0 end) as quantiteEntree,
                   sum(case when m.type = com.fromagerie_back.model.TypeMouvementStock.PERTE then m.quantite else 0 end) as quantitePerdue
            from MouvementStock m
            join m.stockFromageFini stock
            join stock.lotAffinage lot
            join lot.fabrication fabrication
            join fabrication.recette recette
            join recette.fromage fromage
            where m.dateMouvement >= :dateDebut and m.dateMouvement < :dateFinExclusive
              and m.type in (com.fromagerie_back.model.TypeMouvementStock.ENTREE, com.fromagerie_back.model.TypeMouvementStock.PERTE)
              and (:fromageId is null or fromage.id = :fromageId)
            group by fromage.id, fromage.nom
            order by fromage.nom
            """)
    List<PerformanceProjection> findPerformanceAggregates(
            @Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFinExclusive") LocalDateTime dateFinExclusive,
            @Param("fromageId") Long fromageId);

    @EntityGraph(attributePaths = { "utilisateur", "stockFromageFini", "stockFromageFini.lotAffinage",
            "stockFromageFini.lotAffinage.fabrication", "stockFromageFini.lotAffinage.fabrication.recette",
            "stockFromageFini.lotAffinage.fabrication.recette.fromage", "stockFromageFini.emplacementStock" })
    List<MouvementStock> findAllByStockFromageFiniIdOrderByDateMouvementDescIdDesc(Long stockFromageFiniId);
    boolean existsByStockFromageFiniIdAndType(Long stockFromageFiniId, TypeMouvementStock type);
    @Query("select coalesce(sum(m.quantite),0) from MouvementStock m where m.stockFromageFini.id=:stockId and m.type=:type")
    int quantityByType(@Param("stockId") Long stockId, @Param("type") TypeMouvementStock type);
    @Query("select coalesce(sum(case when m.type in :entrees then m.quantite else -m.quantite end),0) from MouvementStock m where m.stockFromageFini.id=:stockId")
    int quantityAvailable(@Param("stockId") Long stockId, @Param("entrees") java.util.Collection<TypeMouvementStock> entrees);
}
