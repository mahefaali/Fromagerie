package com.fromagerie_back.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.fromagerie_back.dto.RentabiliteAnalyseResponse;
import com.fromagerie_back.model.CoutProductionLot;
import com.fromagerie_back.model.Fabrication;
import com.fromagerie_back.model.LigneLivraison;
import com.fromagerie_back.repository.CoutProductionLotRepository;
import com.fromagerie_back.repository.LigneLivraisonRepository;

class RentabiliteServiceTests {
    @Test
    void utiliseLaQuantiteLivreeEtLeCoutDuLotReelPourChaqueFractionDeCommande() {
        LigneLivraisonRepository livraisons = mock(LigneLivraisonRepository.class);
        CoutProductionLotRepository couts = mock(CoutProductionLotRepository.class);
        LigneLivraison lotA = livraison(10L, "LOT-A", 4, "20.0000");
        LigneLivraison lotB = livraison(11L, "LOT-B", 6, "18.0000");
        when(livraisons.findLivreesPourRentabilite(any(), any(), any(), any())).thenReturn(List.of(lotA, lotB));
        when(couts.findByFabricationIdIn(any())).thenReturn(List.of(
                cout(10L, "6.0000", "12.0000", 10),
                cout(11L, "7.0000", "14.0000", 10)));

        RentabiliteAnalyseResponse result = new RentabiliteService(livraisons, couts)
                .analyser(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31), null, null);

        assertThat(result.synthese().quantiteLivree()).isEqualTo(10);
        assertThat(result.synthese().chiffreAffaires()).isEqualByComparingTo("188.0000");
        assertThat(result.synthese().coutAttribue()).isEqualByComparingTo("66.0000");
        assertThat(result.synthese().margeBrute()).isEqualByComparingTo("122.0000");
        assertThat(result.synthese().tauxRentabilite()).isEqualByComparingTo("184.85");
        assertThat(result.parFromage()).hasSize(1);
        assertThat(result.parFromage().getFirst().coutProductionParKg()).isEqualByComparingTo("5.0000");
        assertThat(result.parClient()).hasSize(1);
        assertThat(result.croisee()).hasSize(1);
        assertThat(result.croisee().getFirst().prixVenteMoyen()).isEqualByComparingTo("18.8000");
    }

    private LigneLivraison livraison(Long fabricationId, String numeroLot, int quantiteLivree, String prix) {
        LigneLivraison ligne = mock(LigneLivraison.class, RETURNS_DEEP_STUBS);
        when(ligne.getStockFromageFini().getLotAffinage().getFabrication().getId()).thenReturn(fabricationId);
        when(ligne.getStockFromageFini().getLotAffinage().getFabrication().getNumeroLot()).thenReturn(numeroLot);
        when(ligne.getQuantiteLivree()).thenReturn(quantiteLivree);
        when(ligne.getLigneCommande().getPrixUnitaire()).thenReturn(new BigDecimal(prix));
        when(ligne.getLigneCommande().getFromage().getId()).thenReturn(1L);
        when(ligne.getLigneCommande().getFromage().getNom()).thenReturn("Tomme");
        when(ligne.getLivraison().getCommande().getClient().getId()).thenReturn(2L);
        when(ligne.getLivraison().getCommande().getClient().getNom()).thenReturn("Épicerie des Hauts");
        return ligne;
    }

    private CoutProductionLot cout(Long fabricationId, String coutUnitaire, String poidsTotal, int nombreUnites) {
        Fabrication fabrication = new Fabrication();
        fabrication.setId(fabricationId);
        fabrication.setPoidsTotalFromages(new BigDecimal(poidsTotal));
        CoutProductionLot cout = new CoutProductionLot();
        cout.setFabrication(fabrication);
        cout.setCoutParUnite(new BigDecimal(coutUnitaire));
        cout.setNombreUnitesFinales(nombreUnites);
        return cout;
    }
}
