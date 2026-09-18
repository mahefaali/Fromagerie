package com.fromagerie_back.repository;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fromagerie_back.model.Fabrication;

@Repository
public interface FabricationRepository
                extends JpaRepository<Fabrication, Long> {

        interface PerformanceProjection {
                Long getFromageId();
                String getFromageNom();
                BigDecimal getPoidsTotal();
                BigDecimal getQuantiteLait();
                Long getNombreFromages();
        }

        @Query("""
                        SELECT fromage.id AS fromageId, fromage.nom AS fromageNom,
                               SUM(f.poidsTotalFromages) AS poidsTotal,
                               SUM(f.quantiteLait) AS quantiteLait,
                               SUM(f.nombreFromages) AS nombreFromages
                        FROM Fabrication f
                        JOIN f.recette recette
                        JOIN recette.fromage fromage
                        WHERE f.dateHeureDebut >= :dateDebut
                          AND f.dateHeureDebut < :dateFinExclusive
                          AND (:fromageId IS NULL OR fromage.id = :fromageId)
                        GROUP BY fromage.id, fromage.nom
                        ORDER BY fromage.nom
                        """)
        List<PerformanceProjection> findPerformanceAggregates(
                        @Param("dateDebut") LocalDateTime dateDebut,
                        @Param("dateFinExclusive") LocalDateTime dateFinExclusive,
                        @Param("fromageId") Long fromageId);

        long countByDateHeureDebutGreaterThanEqualAndDateHeureDebutLessThan(
                        LocalDateTime debut,
                        LocalDateTime fin);

        boolean existsByNumeroLot(String numeroLot);

        @EntityGraph(attributePaths = { "recette", "recette.fromage", "operateur" })
        Optional<Fabrication> findByNumeroLotIgnoreCase(String numeroLot);

        @EntityGraph(attributePaths = { "recette", "recette.fromage", "operateur" })
        @Query("SELECT f FROM Fabrication f ORDER BY f.dateHeureDebut DESC")
        List<Fabrication> findAllWithDetailsOrderByDateHeureDebutDesc();

        @EntityGraph(attributePaths = { "recette", "recette.fromage", "operateur" })
        @Query("SELECT f FROM Fabrication f WHERE f.id = :id")
        Optional<Fabrication> findByIdWithDetails(@Param("id") Long id);

        @Query("""
                        SELECT
                                f.id AS fabricationId,
                                f.numeroLot AS numeroLot,
                                f.dateHeureDebut AS dateHeureDebut,
                                fromage.id AS fromageId,
                                fromage.nom AS fromageNom,
                                recette.id AS recetteId,
                                recette.nom AS recetteNom,
                                f.temperatureChauffage AS temperatureChauffage,
                                f.rendement AS rendement
                        FROM Fabrication f
                        JOIN f.recette recette
                        JOIN recette.fromage fromage
                        WHERE (:fromageId IS NULL OR fromage.id = :fromageId)
                          AND (:recetteId IS NULL OR recette.id = :recetteId)
                          AND f.dateHeureDebut >= :dateDebut
                          AND f.dateHeureDebut < :dateFinExclusive
                        ORDER BY f.dateHeureDebut ASC, f.id ASC
                        """)
        List<FabricationAnalyticsProjection> findAnalyticsRows(
                        @Param("fromageId") Long fromageId,
                        @Param("recetteId") Long recetteId,
                        @Param("dateDebut") LocalDateTime dateDebut,
                        @Param("dateFinExclusive") LocalDateTime dateFinExclusive);
}
