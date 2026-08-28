package com.fromagerie_back.repository;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import com.fromagerie_back.model.Livraison;
public interface LivraisonRepository extends JpaRepository<Livraison,Long> { Optional<Livraison> findByCommandeId(Long commandeId); }
