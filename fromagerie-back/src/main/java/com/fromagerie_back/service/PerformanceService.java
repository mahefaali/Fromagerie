package com.fromagerie_back.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fromagerie_back.dto.PerformanceDashboardResponse;
import com.fromagerie_back.dto.PerformanceDashboardResponse.AffinageFromage;
import com.fromagerie_back.dto.PerformanceDashboardResponse.CoutMensuel;
import com.fromagerie_back.dto.PerformanceDashboardResponse.Indicateur;
import com.fromagerie_back.dto.PerformanceDashboardResponse.MargeMensuelle;
import com.fromagerie_back.dto.PerformanceDashboardResponse.PerteFromage;
import com.fromagerie_back.dto.PerformanceDashboardResponse.PoidsFromage;
import com.fromagerie_back.dto.PerformanceDashboardResponse.RendementFromage;
import com.fromagerie_back.exception.BusinessConflictException;
import com.fromagerie_back.repository.CoutProductionLotRepository;
import com.fromagerie_back.repository.FabricationRepository;
import com.fromagerie_back.repository.MouvementStockRepository;
import com.fromagerie_back.repository.StockFromageFiniRepository;

@Service
public class PerformanceService {
    private final FabricationRepository fabricationRepository;
    private final MouvementStockRepository mouvementRepository;
    private final CoutProductionLotRepository coutRepository;
    private final StockFromageFiniRepository stockRepository;
    private final RentabiliteService rentabiliteService;

    public PerformanceService(FabricationRepository fabricationRepository,
            MouvementStockRepository mouvementRepository, CoutProductionLotRepository coutRepository,
            StockFromageFiniRepository stockRepository, RentabiliteService rentabiliteService) {
        this.fabricationRepository = fabricationRepository;
        this.mouvementRepository = mouvementRepository;
        this.coutRepository = coutRepository;
        this.stockRepository = stockRepository;
        this.rentabiliteService = rentabiliteService;
    }

    @Transactional(readOnly = true)
    public PerformanceDashboardResponse dashboard(LocalDate debut, LocalDate fin, Long fromageId) {
        if (debut.isAfter(fin)) {
            throw new BusinessConflictException("dateDebut doit être antérieure ou égale à dateFin");
        }
        long jours = ChronoUnit.DAYS.between(debut, fin) + 1;
        LocalDate finPrecedente = debut.minusDays(1);
        LocalDate debutPrecedente = finPrecedente.minusDays(jours - 1);

        Donnees courantes = charger(debut, fin, fromageId);
        Donnees precedentes = charger(debutPrecedente, finPrecedente, fromageId);

        return new PerformanceDashboardResponse(
                new PerformanceDashboardResponse.Periode(debut, fin),
                new PerformanceDashboardResponse.Periode(debutPrecedente, finPrecedente),
                indicateurPoints(courantes.rendement(), precedentes.rendement()),
                indicateurPoints(courantes.tauxPerte(), precedentes.tauxPerte()),
                indicateurPourcentage(courantes.coutMoyenKg(), precedentes.coutMoyenKg()),
                indicateurPourcentage(courantes.marge(), precedentes.marge()),
                courantes.rendements(), courantes.pertes(), courantes.couts(), courantes.marges(),
                courantes.poids(), courantes.affinages());
    }

    private Donnees charger(LocalDate debut, LocalDate fin, Long fromageId) {
        LocalDateTime debutHeure = debut.atStartOfDay();
        LocalDateTime finExclusive = fin.plusDays(1).atStartOfDay();
        var fabrications = fabricationRepository.findPerformanceAggregates(debutHeure, finExclusive, fromageId);
        var mouvements = mouvementRepository.findPerformanceAggregates(debutHeure, finExclusive, fromageId);
        var coutsSource = coutRepository.findPerformanceAggregates(debutHeure, finExclusive, fromageId);
        var margesSource = rentabiliteService.evolutionMensuelle(debut, fin, fromageId);
        var affinagesSource = stockRepository.findAffinagePerformance(debut, fin, fromageId);

        List<RendementFromage> rendements = fabrications.stream()
                .map(f -> new RendementFromage(f.getFromageId(), f.getFromageNom(),
                        ratio(f.getPoidsTotal(), f.getQuantiteLait(), 100)))
                .toList();
        List<PoidsFromage> poids = fabrications.stream()
                .map(f -> new PoidsFromage(f.getFromageId(), f.getFromageNom(),
                        ratio(f.getPoidsTotal(), BigDecimal.valueOf(f.getNombreFromages()), 1)))
                .toList();
        List<PerteFromage> pertes = mouvements.stream().map(m -> new PerteFromage(
                m.getFromageId(), m.getFromageNom(), m.getQuantiteEntree(), m.getQuantitePerdue(),
                tauxPerte(m.getQuantiteEntree(), m.getQuantitePerdue()))).toList();
        List<CoutMensuel> couts = coutsSource.stream().map(c -> new CoutMensuel(
                c.getAnnee(), c.getMois(), ratio(c.getCoutTotal(), c.getPoidsTotal(), 1))).toList();
        List<MargeMensuelle> marges = margesSource.stream().map(m -> new MargeMensuelle(
                m.mois().getYear(), m.mois().getMonthValue(), m.synthese().chiffreAffaires(),
                m.synthese().coutAttribue(), m.synthese().margeBrute())).toList();

        Map<Long, AffinageAccumulator> parFromage = new LinkedHashMap<>();
        affinagesSource.forEach(a -> parFromage
                .computeIfAbsent(a.getFromageId(), ignored -> new AffinageAccumulator(a.getFromageNom()))
                .add(a.getDateMiseEnCave(), a.getDateSortiePrevue(), a.getDateSortieReelle()));
        List<AffinageFromage> affinages = parFromage.entrySet().stream()
                .map(e -> e.getValue().response(e.getKey())).toList();

        BigDecimal poidsTotal = somme(fabrications.stream().map(FabricationRepository.PerformanceProjection::getPoidsTotal).toList());
        BigDecimal laitTotal = somme(fabrications.stream().map(FabricationRepository.PerformanceProjection::getQuantiteLait).toList());
        long entrees = mouvements.stream().mapToLong(MouvementStockRepository.PerformanceProjection::getQuantiteEntree).sum();
        long perdues = mouvements.stream().mapToLong(MouvementStockRepository.PerformanceProjection::getQuantitePerdue).sum();
        BigDecimal coutTotal = somme(coutsSource.stream().map(CoutProductionLotRepository.PerformanceProjection::getCoutTotal).toList());
        BigDecimal poidsCoute = somme(coutsSource.stream().map(CoutProductionLotRepository.PerformanceProjection::getPoidsTotal).toList());
        BigDecimal marge = somme(marges.stream().map(MargeMensuelle::margeBrute).toList());
        return new Donnees(ratio(poidsTotal, laitTotal, 100), tauxPerte(entrees, perdues),
                ratio(coutTotal, poidsCoute, 1), marges.isEmpty() ? null : scale(marge),
                rendements, pertes, couts, marges, poids, affinages);
    }

    private static BigDecimal tauxPerte(long entrees, long perdues) {
        return entrees == 0 ? null : ratio(BigDecimal.valueOf(perdues), BigDecimal.valueOf(entrees), 100);
    }

    private static BigDecimal ratio(BigDecimal valeur, BigDecimal diviseur, int facteur) {
        if (valeur == null || diviseur == null || diviseur.signum() == 0) return null;
        return valeur.multiply(BigDecimal.valueOf(facteur)).divide(diviseur, 2, RoundingMode.HALF_UP);
    }

    private static BigDecimal somme(List<BigDecimal> valeurs) {
        return valeurs.stream().filter(v -> v != null).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static Indicateur indicateurPoints(BigDecimal actuel, BigDecimal precedent) {
        return new Indicateur(actuel, actuel == null || precedent == null ? null : scale(actuel.subtract(precedent)));
    }

    private static Indicateur indicateurPourcentage(BigDecimal actuel, BigDecimal precedent) {
        BigDecimal evolution = actuel == null || precedent == null || precedent.signum() == 0 ? null
                : actuel.subtract(precedent).multiply(BigDecimal.valueOf(100))
                        .divide(precedent.abs(), 2, RoundingMode.HALF_UP);
        return new Indicateur(actuel, evolution);
    }

    private static BigDecimal scale(BigDecimal valeur) {
        return valeur.setScale(2, RoundingMode.HALF_UP);
    }

    private record Donnees(BigDecimal rendement, BigDecimal tauxPerte, BigDecimal coutMoyenKg, BigDecimal marge,
            List<RendementFromage> rendements, List<PerteFromage> pertes, List<CoutMensuel> couts,
            List<MargeMensuelle> marges, List<PoidsFromage> poids, List<AffinageFromage> affinages) {}

    private static class AffinageAccumulator {
        private final String nom;
        private long prevu;
        private long reel;
        private int nombre;

        AffinageAccumulator(String nom) { this.nom = nom; }
        void add(LocalDate entree, LocalDate prevue, LocalDate reelle) {
            prevu += ChronoUnit.DAYS.between(entree, prevue);
            reel += ChronoUnit.DAYS.between(entree, reelle);
            nombre++;
        }
        AffinageFromage response(Long id) {
            BigDecimal moyennePrevue = BigDecimal.valueOf(prevu).divide(BigDecimal.valueOf(nombre), 2, RoundingMode.HALF_UP);
            BigDecimal moyenneReelle = BigDecimal.valueOf(reel).divide(BigDecimal.valueOf(nombre), 2, RoundingMode.HALF_UP);
            return new AffinageFromage(id, nom, moyennePrevue, moyenneReelle, moyenneReelle.subtract(moyennePrevue));
        }
    }
}
