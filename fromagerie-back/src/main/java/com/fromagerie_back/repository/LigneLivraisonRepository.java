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
            join fetch commande.client
            join fetch ll.ligneCommande ligneCommande
            join fetch ligneCommande.fromage
            join fetch ll.stockFromageFini stock
            join fetch stock.lotAffinage lot
            join fetch lot.fabrication fabrication
            where lower(commande.numeroCommande) like lower(concat('%', :numeroCommande, '%'))
              and ll.quantiteLivree > 0
            order by case when lower(commande.numeroCommande) = lower(:numeroCommande) then 0 else 1 end,
                     commande.dateCommande desc, commande.id desc, liv.dateLivraison desc, ll.id
            """)
    List<LigneLivraison> findDeliveredByNumeroCommandeContaining(@Param("numeroCommande") String numeroCommande);

    @Query("""
            select ll from LigneLivraison ll join fetch ll.livraison liv join fetch liv.commande c
            join fetch c.client join fetch ll.stockFromageFini s join fetch s.lotAffinage a
            where a.fabrication.id=:fabricationId and ll.quantiteLivree>0 order by liv.dateLivraison desc
            """)
    List<LigneLivraison> findTraceByFabricationId(@Param("fabricationId") Long fabricationId);
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
