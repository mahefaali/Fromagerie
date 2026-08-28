package com.fromagerie_back.dto;
import java.math.BigDecimal; import java.time.LocalDate; import java.util.List;
import com.fromagerie_back.model.*;
public final class CommandeResponses {
 private CommandeResponses() {}
 public record ClientResponse(Long id,String nom,TypeClient typeClient,String telephone,String adresse,boolean actif) {}
 public record ReservationResponse(Long id,Long ligneCommandeId,Long stockId,String lot,String fromage,String emplacement,Integer quantiteReservee,Integer quantiteDisponible) {}
 public record LigneResponse(Long id,Long fromageId,String fromageNom,Integer quantiteCommandee,BigDecimal prixUnitaire,List<ReservationResponse> reservations) {}
 public record LivraisonLigneResponse(Long reservationId,Integer quantitePrevue,Integer quantiteLivree,Integer ecart) {}
 public record LivraisonResponse(LocalDate dateLivraison,String observations,List<LivraisonLigneResponse> lignes) {}
 public record CommandeResponse(Long id,String numeroCommande,ClientResponse client,LocalDate dateCommande,LocalDate dateLivraisonSouhaitee,StatutCommande statut,String observations,List<LigneResponse> lignes,LivraisonResponse livraison) {}
 public record FactureResponse(Long id,String numeroFacture,Long commandeId,LocalDate dateFacture,BigDecimal total,ModePaiement modePaiement) {}
}
