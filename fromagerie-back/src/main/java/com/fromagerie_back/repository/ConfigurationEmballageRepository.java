package com.fromagerie_back.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fromagerie_back.model.ConfigurationEmballage;

public interface ConfigurationEmballageRepository extends JpaRepository<ConfigurationEmballage, Long> {
    @EntityGraph(attributePaths = { "fromage", "emballage" })
    List<ConfigurationEmballage> findAllByOrderByFromageNomAscEmballageNomAsc();

    @EntityGraph(attributePaths = "emballage")
    List<ConfigurationEmballage> findByFromageIdAndActifTrue(Long fromageId);

    boolean existsByFromageIdAndEmballageId(Long fromageId, Long emballageId);
    boolean existsByFromageIdAndEmballageIdAndIdNot(Long fromageId, Long emballageId, Long id);
}
