package com.fromagerie_back.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fromagerie_back.model.RegleMainOeuvre;
import com.fromagerie_back.model.TypeOperationMainOeuvre;

public interface RegleMainOeuvreRepository extends JpaRepository<RegleMainOeuvre, Long> {
    List<RegleMainOeuvre> findAllByOrderByTypeOperationAscDateDebutValiditeDesc();
    List<RegleMainOeuvre> findByTypeOperation(TypeOperationMainOeuvre typeOperation);
}
