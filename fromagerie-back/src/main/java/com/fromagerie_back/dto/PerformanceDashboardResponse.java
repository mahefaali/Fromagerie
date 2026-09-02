package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PerformanceDashboardResponse(
        Periode periode,
        Periode periodePrecedente,
        Indicateur rendementMoyen,
        Indicateur tauxPerte,
        Indicateur coutMoyenKg,
        Indicateur margeBrute,
        List<RendementFromage> rendementsParFromage,
        List<PerteFromage> pertesParFromage,
        List<CoutMensuel> evolutionCouts,
        List<MargeMensuelle> evolutionMarges,
        List<PoidsFromage> poidsMoyens,
        List<AffinageFromage> dureesAffinage) {

    public record Periode(LocalDate dateDebut, LocalDate dateFin) {}
    public record Indicateur(BigDecimal valeur, BigDecimal evolution) {}
    public record RendementFromage(Long fromageId, String fromageNom, BigDecimal rendement) {}
    public record PerteFromage(Long fromageId, String fromageNom, long quantiteEntree,
            long quantitePerdue, BigDecimal tauxPerte) {}
    public record CoutMensuel(int annee, int mois, BigDecimal coutMoyenKg) {}
    public record MargeMensuelle(int annee, int mois, BigDecimal chiffreAffaires,
            BigDecimal coutAttribue, BigDecimal margeBrute) {}
    public record PoidsFromage(Long fromageId, String fromageNom, BigDecimal poidsMoyenKg) {}
    public record AffinageFromage(Long fromageId, String fromageNom, BigDecimal dureePrevueJours,
            BigDecimal dureeReelleJours, BigDecimal ecartJours) {}
}
