package com.fromagerie_back.dto;
import java.math.BigDecimal; import java.time.*; import java.util.List;
import com.fromagerie_back.model.*;
public record TracabiliteResponse(FabricationTrace fabrication,AffinageTrace affinage,StockTrace stock,List<VenteTrace> ventes,List<LotLaitTrace> lotsLait,boolean laitDetailleDisponible){
 public record FabricationTrace(Long id,String numeroLot,LocalDateTime dateFabrication,String fromage,String recette,BigDecimal quantiteLait,BigDecimal temperatureLait,OrigineLait origineHistorique,Long operateurId,String operateurNom){}
 public record AffinageTrace(Long id,LocalDate dateMiseEnCave,LocalDate dateSortiePrevue,String statut){}
 public record StockTrace(Long id,LocalDate dateEntree,Integer quantiteInitiale,String statut){}
 public record VenteTrace(Long ligneLivraisonId,String numeroLivraison,LocalDate dateLivraison,String client,Integer quantiteLivree){}
 public record LotLaitTrace(Long id,String numeroLot,LocalDateTime dateTraite,TypeTraite typeTraite,BigDecimal quantiteUtilisee,List<LotLaitDtos.AnalyseResponse> analyses){}
}
