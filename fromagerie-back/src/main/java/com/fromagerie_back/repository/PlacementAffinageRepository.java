package com.fromagerie_back.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fromagerie_back.model.PlacementAffinage;

public interface PlacementAffinageRepository extends JpaRepository<PlacementAffinage, Long> {

    @EntityGraph(attributePaths = {
            "rangee",
            "rangee.etagere",
            "rangee.etagere.cave",
            "lotAffinage",
            "lotAffinage.fabrication"
    })
    @Query("""
            SELECT p FROM PlacementAffinage p
            WHERE p.rangee.etagere.cave.id = :caveId AND p.dateFin IS NULL
            """)
    List<PlacementAffinage> findActiveByCaveId(@Param("caveId") Long caveId);

    @EntityGraph(attributePaths = { "rangee", "rangee.etagere", "rangee.etagere.cave" })
    @Query("""
            SELECT p FROM PlacementAffinage p
            WHERE p.lotAffinage.id = :lotId
            ORDER BY p.dateDebut DESC, p.id DESC
            """)
    List<PlacementAffinage> findAllByLotIdWithLocation(@Param("lotId") Long lotId);

    @EntityGraph(attributePaths = { "rangee", "rangee.etagere", "rangee.etagere.cave" })
    @Query("""
            SELECT p FROM PlacementAffinage p
            WHERE p.lotAffinage.id = :lotId AND p.dateFin IS NULL
            """)
    List<PlacementAffinage> findActiveByLotIdWithLocation(@Param("lotId") Long lotId);


    @EntityGraph(attributePaths = { "rangee", "rangee.etagere", "rangee.etagere.cave" })
    @Query("""
            SELECT p FROM PlacementAffinage p
            WHERE p.lotAffinage.id IN :lotIds AND p.dateFin IS NULL
            """)
    List<PlacementAffinage> findActiveByLotIds(@Param("lotIds") Collection<Long> lotIds);

    @Query("""
            SELECT COALESCE(SUM(p.quantite), 0) FROM PlacementAffinage p
            WHERE p.lotAffinage.id = :lotId AND p.dateFin IS NULL
            """)
    long sumActiveQuantityByLotId(@Param("lotId") Long lotId);

    @Query("""
            SELECT COALESCE(SUM(p.quantite), 0) FROM PlacementAffinage p
            WHERE p.rangee.etagere.cave.id = :caveId AND p.dateFin IS NULL
            """)
    long sumActiveQuantityByCaveId(@Param("caveId") Long caveId);

    @Query("""
            SELECT p.rangee.id, SUM(p.quantite) FROM PlacementAffinage p
            WHERE p.rangee.id IN :rangeeIds AND p.dateFin IS NULL
            GROUP BY p.rangee.id
            """)
    List<Object[]> sumActiveQuantityByRangeeIds(@Param("rangeeIds") Collection<Long> rangeeIds);

    boolean existsByRangeeEtagereCaveId(Long caveId);
}
