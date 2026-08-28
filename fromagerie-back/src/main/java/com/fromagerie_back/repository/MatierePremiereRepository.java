package com.fromagerie_back.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fromagerie_back.model.MatierePremiere;

public interface MatierePremiereRepository extends JpaRepository<MatierePremiere, Long> {

    List<MatierePremiere> findAllByOrderByNomAsc();

    boolean existsByNomIgnoreCase(String nom);

    boolean existsByNomIgnoreCaseAndIdNot(String nom, Long id);
}
