package com.fromagerie_back.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fromagerie_back.model.CoutProductionLot;

public interface CoutProductionLotRepository extends JpaRepository<CoutProductionLot, Long> {
    interface PerformanceProjection {
        Integer getAnnee();
        Integer getMois();
        BigDecimal getCoutTotal();
        BigDecimal getPoidsTotal();
    }

    @Query("""
            select year(fabrication.dateHeureDebut) as annee,
                   month(fabrication.dateHeureDebut) as mois,
                   sum(cout.coutTotal) as coutTotal,
                   sum(fabrication.poidsTotalFromages) as poidsTotal
            from CoutProductionLot cout
            join cout.fabrication fabrication
            join fabrication.recette recette
            join recette.fromage fromage
            where fabrication.dateHeureDebut >= :dateDebut
              and fabrication.dateHeureDebut < :dateFinExclusive
              and (:fromageId is null or fromage.id = :fromageId)
            group by year(fabrication.dateHeureDebut), month(fabrication.dateHeureDebut)
            order by year(fabrication.dateHeureDebut), month(fabrication.dateHeureDebut)
            """)
    List<PerformanceProjection> findPerformanceAggregates(
            @Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFinExclusive") LocalDateTime dateFinExclusive,
            @Param("fromageId") Long fromageId);

    Optional<CoutProductionLot> findByFabricationId(Long fabricationId);

    void deleteByFabricationId(Long fabricationId);

    @EntityGraph(attributePaths = { "fabrication", "fabrication.recette", "fabrication.recette.fromage" })
    List<CoutProductionLot> findAllByOrderByDateCalculDesc();

    List<CoutProductionLot> findByFabricationIdIn(Collection<Long> fabricationIds);
}
