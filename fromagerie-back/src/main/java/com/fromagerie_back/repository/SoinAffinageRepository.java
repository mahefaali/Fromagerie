package com.fromagerie_back.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fromagerie_back.model.SoinAffinage;

public interface SoinAffinageRepository extends JpaRepository<SoinAffinage, Long> {

    @EntityGraph(attributePaths = "utilisateur")
    List<SoinAffinage> findByLotAffinageIdOrderByDateHeureDesc(Long lotId);
}
