package com.fromagerie_back.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;

import com.fromagerie_back.model.LotAffinage;
import jakarta.persistence.LockModeType;

public interface LotAffinageRepository extends JpaRepository<LotAffinage, Long> {

    boolean existsByFabricationId(Long fabricationId);


    @EntityGraph(attributePaths = { "fabrication", "fabrication.recette", "fabrication.recette.fromage",
            "fabrication.operateur" })
    @Query("SELECT l FROM LotAffinage l ORDER BY l.dateMiseEnCave DESC, l.id DESC")
    List<LotAffinage> findAllWithFabricationDetails();

    @EntityGraph(attributePaths = { "fabrication", "fabrication.recette", "fabrication.recette.fromage",
            "fabrication.operateur" })
    @Query("SELECT l FROM LotAffinage l WHERE l.id = :id")
    Optional<LotAffinage> findByIdWithFabricationDetails(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT l FROM LotAffinage l WHERE l.id = :id")
    Optional<LotAffinage> findByIdForUpdate(@Param("id") Long id);
}
