package com.fromagerie_back.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fromagerie_back.model.RegleCoutEnergie;
import com.fromagerie_back.model.TypeOperationEnergie;

public interface RegleCoutEnergieRepository extends JpaRepository<RegleCoutEnergie, Long> {
    List<RegleCoutEnergie> findAllByOrderByTypeOperationAscDateDebutValiditeDesc();
    List<RegleCoutEnergie> findByTypeOperation(TypeOperationEnergie typeOperation);
}
