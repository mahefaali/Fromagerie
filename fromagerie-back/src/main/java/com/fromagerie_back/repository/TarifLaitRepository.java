package com.fromagerie_back.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fromagerie_back.model.TarifLait;
import com.fromagerie_back.model.TypeSaison;

public interface TarifLaitRepository extends JpaRepository<TarifLait, Long> {
    List<TarifLait> findAllByOrderBySaisonAscDateDebutValiditeDesc();
    List<TarifLait> findBySaison(TypeSaison saison);
}
