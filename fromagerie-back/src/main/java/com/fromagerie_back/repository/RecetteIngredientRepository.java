package com.fromagerie_back.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fromagerie_back.model.RecetteIngredient;

public interface RecetteIngredientRepository extends JpaRepository<RecetteIngredient, Long> {

    boolean existsByMatierePremiereId(Long matierePremiereId);
}
