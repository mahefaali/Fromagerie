package com.fromagerie_back.repository;

import com.fromagerie_back.model.Fabrication;
import com.fromagerie_back.model.Fromage;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FromageRepository extends JpaRepository<Fromage, Long> {

    @Query("""
                SELECT f
                FROM Fabrication f
                JOIN FETCH f.recette
                WHERE f.recette.id = :recetteId
            """)
    List<Fabrication> findByRecetteIdWithRecette(
            @Param("recetteId") Long recetteId);

}