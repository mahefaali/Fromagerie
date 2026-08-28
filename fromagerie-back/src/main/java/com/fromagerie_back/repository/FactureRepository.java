package com.fromagerie_back.repository;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import com.fromagerie_back.model.Facture;
public interface FactureRepository extends JpaRepository<Facture,Long> { Optional<Facture> findByCommandeId(Long commandeId); }
