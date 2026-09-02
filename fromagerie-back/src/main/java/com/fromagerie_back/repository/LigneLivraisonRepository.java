package com.fromagerie_back.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fromagerie_back.model.LigneLivraison;

public interface LigneLivraisonRepository extends JpaRepository<LigneLivraison, Long> {
    @Query("""
            select ll from LigneLivraison ll
            join fetch ll.livraison liv
            join fetch liv.commande commande
            join fetch commande.client client
            join fetch ll.ligneCommande ligneCommande
            join fetch ligneCommande.fromage fromage
            join fetch ll.stockFromageFini stock
            join fetch stock.lotAffinage lot
            join fetch lot.fabrication fabrication
            where ll.quantiteLivree > 0
              and liv.dateLivraison between :dateDebut and :dateFin
              and (:fromageId is null or fromage.id = :fromageId)
              and (:clientId is null or client.id = :clientId)
            """)
    List<LigneLivraison> findLivreesPourRentabilite(
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin,
            @Param("fromageId") Long fromageId,
            @Param("clientId") Long clientId);
}
