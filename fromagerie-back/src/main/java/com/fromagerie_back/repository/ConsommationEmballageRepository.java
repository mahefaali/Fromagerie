package com.fromagerie_back.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fromagerie_back.model.ConsommationEmballage;

public interface ConsommationEmballageRepository extends JpaRepository<ConsommationEmballage, Long> {
    @EntityGraph(attributePaths = { "emballage", "utilisateur", "lotAffinage" })
    List<ConsommationEmballage> findAllByLotAffinageIdOrderByDateHeureDesc(Long lotAffinageId);
}
