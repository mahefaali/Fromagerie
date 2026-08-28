package com.fromagerie_back.repository;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import com.fromagerie_back.model.Fabrication;
import com.fromagerie_back.model.Recette;

public interface RecetteRepository
        extends JpaRepository<Recette, Long> {

    @EntityGraph(attributePaths = "fromage")
    @Query("SELECT r FROM Recette r WHERE r.id = :id")
    Optional<Recette> findByIdWithFromage(@Param("id") Long id);

    @EntityGraph(attributePaths = "fromage")
    @Query("SELECT r FROM Recette r ORDER BY r.nom")
    List<Recette> findAllWithFromageOrderByNom();

    @EntityGraph(attributePaths = "fromage")
    @Query("""
            SELECT r FROM Recette r
            WHERE (:fromageId IS NULL OR r.fromage.id = :fromageId)
              AND (:active IS NULL OR r.active = :active)
              AND LOWER(r.nom) LIKE :nomPattern
            ORDER BY r.nom, r.numeroVersion DESC
            """)
    List<Recette> findForListPattern(
            @Param("fromageId") Long fromageId,
            @Param("active") Boolean active,
            @Param("nomPattern") String nomPattern);

    default List<Recette> findForList(Long fromageId, Boolean active, String nom) {
        String pattern = nom == null || nom.isBlank()
                ? "%"
                : "%" + nom.trim().toLowerCase(Locale.ROOT) + "%";
        return findForListPattern(fromageId, active, pattern);
    }

    @EntityGraph(attributePaths = { "fromage", "ingredients", "ingredients.matierePremiere" })
    @Query("SELECT DISTINCT r FROM Recette r WHERE r.id = :id")
    Optional<Recette> findDetailById(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = "fromage")
    @Query("SELECT r FROM Recette r WHERE r.id = :id")
    Optional<Recette> findByIdForVersioning(@Param("id") Long id);

    @EntityGraph(attributePaths = "fromage")
    @Query("SELECT r FROM Recette r WHERE r.varianteKey = :varianteKey ORDER BY r.numeroVersion")
    List<Recette> findHistory(@Param("varianteKey") String varianteKey);

    @EntityGraph(attributePaths = "fromage")
    @Query("""
            SELECT r FROM Recette r
            WHERE r.fromage.id = :fromageId
            ORDER BY r.varianteKey, r.numeroVersion DESC
            """)
    List<Recette> findVersionsByFromageId(@Param("fromageId") Long fromageId);

    @Query("""
                SELECT DISTINCT r
                FROM Recette r
                LEFT JOIN FETCH r.fabrications
            """)
    List<Recette> findAllWithFabrications();

    @Query("""
                SELECT f
                FROM Fabrication f
                WHERE f.recette.id = :recetteId
            """)
    List<Fabrication> findByRecetteId(
            @Param("recetteId") Long recetteId);

    @Query("""
                SELECT f
                FROM Fabrication f
                JOIN FETCH f.recette
                WHERE f.recette.id = :recetteId
            """)
    List<Fabrication> findByRecetteIdWithRecette(
            @Param("recetteId") Long recetteId);
}
