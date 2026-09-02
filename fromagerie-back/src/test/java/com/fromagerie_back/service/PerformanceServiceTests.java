package com.fromagerie_back.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.fromagerie_back.dto.PerformanceDashboardResponse;
import com.fromagerie_back.dto.RentabiliteSyntheseResponse;
import com.fromagerie_back.repository.CoutProductionLotRepository;
import com.fromagerie_back.repository.FabricationRepository;
import com.fromagerie_back.repository.MouvementStockRepository;
import com.fromagerie_back.repository.StockFromageFiniRepository;

class PerformanceServiceTests {
    @Test
    void calculeLesMoyennesPondereesEtLesEvolutionsSansMoyenneDeMoyennes() {
        FabricationRepository fabrications = mock(FabricationRepository.class);
        MouvementStockRepository mouvements = mock(MouvementStockRepository.class);
        CoutProductionLotRepository couts = mock(CoutProductionLotRepository.class);
        StockFromageFiniRepository stocks = mock(StockFromageFiniRepository.class);
        RentabiliteService rentabilite = mock(RentabiliteService.class);

        when(fabrications.findPerformanceAggregates(any(), any(), any()))
                .thenReturn(List.of(fabrication(1L, "Tomme", "10", "100", 5L),
                        fabrication(2L, "Bleu", "30", "100", 10L)))
                .thenReturn(List.of(fabrication(1L, "Tomme", "30", "200", 10L)));
        when(mouvements.findPerformanceAggregates(any(), any(), any()))
                .thenReturn(List.of(mouvement(1L, "Tomme", 80L, 8L), mouvement(2L, "Bleu", 20L, 2L)))
                .thenReturn(List.of(mouvement(1L, "Tomme", 100L, 5L)));
        when(couts.findPerformanceAggregates(any(), any(), any()))
                .thenReturn(List.of(cout(2026, 8, "400", "40")))
                .thenReturn(List.of(cout(2026, 7, "300", "30")));
        when(rentabilite.evolutionMensuelle(any(), any(), any()))
                .thenReturn(List.of(marge(YearMonth.of(2026, 8), "100")))
                .thenReturn(List.of(marge(YearMonth.of(2026, 7), "80")));
        when(stocks.findAffinagePerformance(any(), any(), any())).thenReturn(List.of());

        PerformanceDashboardResponse result = new PerformanceService(fabrications, mouvements, couts, stocks, rentabilite)
                .dashboard(LocalDate.of(2026, 8, 1), LocalDate.of(2026, 8, 31), null);

        assertThat(result.rendementMoyen().valeur()).isEqualByComparingTo("20.00");
        assertThat(result.periodePrecedente().dateDebut()).isEqualTo(LocalDate.of(2026, 7, 1));
        assertThat(result.periodePrecedente().dateFin()).isEqualTo(LocalDate.of(2026, 7, 31));
        assertThat(result.rendementMoyen().evolution()).isEqualByComparingTo("5.00");
        assertThat(result.tauxPerte().valeur()).isEqualByComparingTo("10.00");
        assertThat(result.tauxPerte().evolution()).isEqualByComparingTo("5.00");
        assertThat(result.coutMoyenKg().valeur()).isEqualByComparingTo("10.00");
        assertThat(result.coutMoyenKg().evolution()).isEqualByComparingTo("0.00");
        assertThat(result.margeBrute().evolution()).isEqualByComparingTo("25.00");
        assertThat(result.poidsMoyens().getFirst().poidsMoyenKg()).isEqualByComparingTo("2.00");
    }

    @Test
    void calculeLaDureeReelleDepuisLEntreeEnStockEtConserveLesAbsences() {
        FabricationRepository fabrications = mock(FabricationRepository.class);
        MouvementStockRepository mouvements = mock(MouvementStockRepository.class);
        CoutProductionLotRepository couts = mock(CoutProductionLotRepository.class);
        StockFromageFiniRepository stocks = mock(StockFromageFiniRepository.class);
        RentabiliteService rentabilite = mock(RentabiliteService.class);
        when(fabrications.findPerformanceAggregates(any(), any(), any())).thenReturn(List.of());
        when(mouvements.findPerformanceAggregates(any(), any(), any())).thenReturn(List.of());
        when(couts.findPerformanceAggregates(any(), any(), any())).thenReturn(List.of());
        when(rentabilite.evolutionMensuelle(any(), any(), any())).thenReturn(List.of());
        when(stocks.findAffinagePerformance(any(), any(), any()))
                .thenReturn(List.of(affinage(1L, "Tomme", "2026-08-01", "2026-08-11", "2026-08-13")))
                .thenReturn(List.of());

        PerformanceDashboardResponse result = new PerformanceService(fabrications, mouvements, couts, stocks, rentabilite)
                .dashboard(LocalDate.of(2026, 8, 1), LocalDate.of(2026, 8, 31), 1L);

        assertThat(result.rendementMoyen().valeur()).isNull();
        assertThat(result.tauxPerte().valeur()).isNull();
        assertThat(result.dureesAffinage().getFirst().dureePrevueJours()).isEqualByComparingTo("10.00");
        assertThat(result.dureesAffinage().getFirst().dureeReelleJours()).isEqualByComparingTo("12.00");
        assertThat(result.dureesAffinage().getFirst().ecartJours()).isEqualByComparingTo("2.00");
    }

    private static FabricationRepository.PerformanceProjection fabrication(Long id, String nom, String poids, String lait, Long nombre) {
        return new FabricationRepository.PerformanceProjection() {
            public Long getFromageId() { return id; } public String getFromageNom() { return nom; }
            public BigDecimal getPoidsTotal() { return new BigDecimal(poids); }
            public BigDecimal getQuantiteLait() { return new BigDecimal(lait); }
            public Long getNombreFromages() { return nombre; }
        };
    }
    private static MouvementStockRepository.PerformanceProjection mouvement(Long id, String nom, Long entree, Long perte) {
        return new MouvementStockRepository.PerformanceProjection() {
            public Long getFromageId() { return id; } public String getFromageNom() { return nom; }
            public Long getQuantiteEntree() { return entree; } public Long getQuantitePerdue() { return perte; }
        };
    }
    private static CoutProductionLotRepository.PerformanceProjection cout(Integer annee, Integer mois, String total, String poids) {
        return new CoutProductionLotRepository.PerformanceProjection() {
            public Integer getAnnee() { return annee; } public Integer getMois() { return mois; }
            public BigDecimal getCoutTotal() { return new BigDecimal(total); }
            public BigDecimal getPoidsTotal() { return new BigDecimal(poids); }
        };
    }
    private static RentabiliteService.RentabiliteMensuelle marge(YearMonth mois, String marge) {
        return new RentabiliteService.RentabiliteMensuelle(mois,
                new RentabiliteSyntheseResponse(1, BigDecimal.ZERO, BigDecimal.ZERO, new BigDecimal(marge), BigDecimal.ZERO));
    }
    private static StockFromageFiniRepository.AffinagePerformanceProjection affinage(Long id, String nom, String entree, String prevue, String reelle) {
        return new StockFromageFiniRepository.AffinagePerformanceProjection() {
            public Long getFromageId() { return id; } public String getFromageNom() { return nom; }
            public LocalDate getDateMiseEnCave() { return LocalDate.parse(entree); }
            public LocalDate getDateSortiePrevue() { return LocalDate.parse(prevue); }
            public LocalDate getDateSortieReelle() { return LocalDate.parse(reelle); }
        };
    }
}
