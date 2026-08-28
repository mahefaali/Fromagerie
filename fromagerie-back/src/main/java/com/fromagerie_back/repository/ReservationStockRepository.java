package com.fromagerie_back.repository;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import com.fromagerie_back.model.*;
public interface ReservationStockRepository extends JpaRepository<ReservationStock,Long> {
 @Query("select coalesce(sum(r.quantiteReservee),0) from ReservationStock r where r.stockFromageFini.id=:stockId and r.ligneCommande.commande.statut in :statuts") int sumActiveForStock(@Param("stockId") Long stockId, @Param("statuts") Collection<StatutCommande> statuts);
 List<ReservationStock> findByLigneCommandeCommandeId(Long commandeId);
}
