package com.fromagerie_back.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.fromagerie_back.exception.BusinessConflictException;
import com.fromagerie_back.model.ConfigurationEmballage;
import com.fromagerie_back.model.CoutProductionLot;
import com.fromagerie_back.model.Emballage;
import com.fromagerie_back.model.Equipement;
import com.fromagerie_back.model.Fabrication;
import com.fromagerie_back.model.Fromage;
import com.fromagerie_back.model.LotAffinage;
import com.fromagerie_back.model.MatierePremiere;
import com.fromagerie_back.model.Recette;
import com.fromagerie_back.model.RecetteIngredient;
import com.fromagerie_back.model.RegleAmortissement;
import com.fromagerie_back.model.RegleCoutEnergie;
import com.fromagerie_back.model.RegleMainOeuvre;
import com.fromagerie_back.model.TarifLait;
import com.fromagerie_back.model.TypeOperationEnergie;
import com.fromagerie_back.model.TypeOperationMainOeuvre;
import com.fromagerie_back.model.TypeSaison;
import com.fromagerie_back.model.UniteCalculEnergie;
import com.fromagerie_back.repository.ConfigurationEmballageRepository;
import com.fromagerie_back.repository.CoutProductionLotRepository;
import com.fromagerie_back.repository.RegleAmortissementRepository;
import com.fromagerie_back.repository.RegleCoutEnergieRepository;
import com.fromagerie_back.repository.RegleMainOeuvreRepository;
import com.fromagerie_back.repository.SoinAffinageRepository;
import com.fromagerie_back.repository.TarifLaitRepository;

class CoutProductionCalculServiceTests {
    private final CoutProductionLotRepository couts = mock(CoutProductionLotRepository.class);
    private final TarifLaitRepository tarifs = mock(TarifLaitRepository.class);
    private final ConfigurationEmballageRepository emballages = mock(ConfigurationEmballageRepository.class);
    private final RegleCoutEnergieRepository energie = mock(RegleCoutEnergieRepository.class);
    private final RegleMainOeuvreRepository mainOeuvre = mock(RegleMainOeuvreRepository.class);
    private final RegleAmortissementRepository amortissements = mock(RegleAmortissementRepository.class);
    private final SoinAffinageRepository soins = mock(SoinAffinageRepository.class);
    private final SaisonService saisons = mock(SaisonService.class);
    private CoutProductionCalculService service;

    @BeforeEach
    void setUp() {
        service = new CoutProductionCalculService(couts, tarifs, emballages, energie, mainOeuvre,
                amortissements, soins, saisons);
        when(couts.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(soins.findByLotAffinageIdOrderByDateHeureDesc(any())).thenReturn(List.of());
    }

    @Test
    void calculeToutesLesComposantesSansCompterLeLaitDeuxFois() {
        LotAffinage lot = lotComplet();
        LocalDate fabricationDate = LocalDate.of(2026, 1, 1);
        when(couts.findByFabricationId(10L)).thenReturn(Optional.empty());
        when(saisons.determinerSaison(fabricationDate)).thenReturn(TypeSaison.SECHE);
        when(tarifs.findBySaison(TypeSaison.SECHE)).thenReturn(List.of(tarif("2.0000", fabricationDate)));
        when(emballages.findByFromageIdAndActifTrue(1L)).thenReturn(List.of(configurationEmballage("0.5000")));
        when(energie.findAll()).thenReturn(List.of(
                regleEnergie(TypeOperationEnergie.CHAUFFE, UniteCalculEnergie.PAR_HEURE, "3.0000", fabricationDate),
                regleEnergie(TypeOperationEnergie.AFFINAGE_CAVE, UniteCalculEnergie.PAR_FROMAGE_PAR_JOUR, "0.1000", fabricationDate)));
        when(mainOeuvre.findByTypeOperation(TypeOperationMainOeuvre.FABRICATION))
                .thenReturn(List.of(regleMainOeuvre(TypeOperationMainOeuvre.FABRICATION, 60, "10.0000", fabricationDate)));
        when(mainOeuvre.findByTypeOperation(TypeOperationMainOeuvre.PREPARATION_VENTE))
                .thenReturn(List.of(regleMainOeuvre(TypeOperationMainOeuvre.PREPARATION_VENTE, 30, "10.0000", fabricationDate)));
        when(amortissements.findAll()).thenReturn(List.of(regleAmortissement("4.0000", fabricationDate)));

        CoutProductionLot result = service.calculerPourSortie(lot, 5, LocalDate.of(2026, 1, 3));

        assertThat(result.getCoutLait()).isEqualByComparingTo("20.0000");
        assertThat(result.getCoutMatieres()).isEqualByComparingTo("0.6000");
        assertThat(result.getCoutEmballage()).isEqualByComparingTo("2.5000");
        assertThat(result.getCoutEnergie()).isEqualByComparingTo("4.0000");
        assertThat(result.getCoutMainOeuvre()).isEqualByComparingTo("15.0000");
        assertThat(result.getCoutAmortissement()).isEqualByComparingTo("4.0000");
        assertThat(result.getCoutTotal()).isEqualByComparingTo("46.1000");
        assertThat(result.getCoutParKg()).isEqualByComparingTo("4.6100");
        assertThat(result.getCoutParUnite()).isEqualByComparingTo("9.2200");
        assertThat(result.getNombreUnitesFinales()).isEqualTo(5);
    }

    @Test
    void refuseLaFinalisationSiAucunEmballageNestConfigure() {
        LotAffinage lot = lotComplet();
        LocalDate date = LocalDate.of(2026, 1, 1);
        when(couts.findByFabricationId(10L)).thenReturn(Optional.empty());
        when(saisons.determinerSaison(date)).thenReturn(TypeSaison.SECHE);
        when(tarifs.findBySaison(TypeSaison.SECHE)).thenReturn(List.of(tarif("2.0000", date)));
        when(emballages.findByFromageIdAndActifTrue(1L)).thenReturn(List.of());

        assertThatThrownBy(() -> service.calculerPourSortie(lot, 5, LocalDate.of(2026, 1, 3)))
                .isInstanceOf(BusinessConflictException.class)
                .hasMessageContaining("Aucun emballage actif");
        verify(couts, never()).save(any());
    }

    @Test
    void refuseLaFinalisationSiLaRecetteNeContientAucuneMatiereValoriseeHorsLait() {
        LotAffinage lot = lotComplet();
        LocalDate date = LocalDate.of(2026, 1, 1);
        lot.getFabrication().getRecette().getIngredients().clear();
        lot.getFabrication().getRecette().addIngredient(ingredient("Lait cru", "10.0000", "2.0000"));
        when(couts.findByFabricationId(10L)).thenReturn(Optional.empty());
        when(saisons.determinerSaison(date)).thenReturn(TypeSaison.SECHE);
        when(tarifs.findBySaison(TypeSaison.SECHE)).thenReturn(List.of(tarif("2.0000", date)));

        assertThatThrownBy(() -> service.calculerPourSortie(lot, 5, LocalDate.of(2026, 1, 3)))
                .isInstanceOf(BusinessConflictException.class)
                .hasMessageContaining("aucune matière valorisée hors lait");
        verify(emballages, never()).findByFromageIdAndActifTrue(any());
        verify(couts, never()).save(any());
    }

    @Test
    void refuseLaFinalisationSiLesMatieresHorsLaitOntUnCoutNul() {
        LotAffinage lot = lotComplet();
        LocalDate date = LocalDate.of(2026, 1, 1);
        lot.getFabrication().getRecette().getIngredients().clear();
        lot.getFabrication().getRecette().addIngredient(ingredient("Sel", "2.0000", "0.0000"));
        when(couts.findByFabricationId(10L)).thenReturn(Optional.empty());
        when(saisons.determinerSaison(date)).thenReturn(TypeSaison.SECHE);
        when(tarifs.findBySaison(TypeSaison.SECHE)).thenReturn(List.of(tarif("2.0000", date)));

        assertThatThrownBy(() -> service.calculerPourSortie(lot, 5, LocalDate.of(2026, 1, 3)))
                .isInstanceOf(BusinessConflictException.class)
                .hasMessageContaining("aucune matière valorisée hors lait");
        verify(couts, never()).save(any());
    }

    @Test
    void retourneLeSnapshotExistantSansRecalculer() {
        LotAffinage lot = lotComplet();
        CoutProductionLot existing = new CoutProductionLot();
        when(couts.findByFabricationId(10L)).thenReturn(Optional.of(existing));

        assertThat(service.calculerPourSortie(lot, 5, LocalDate.of(2026, 1, 3))).isSameAs(existing);
        verify(tarifs, never()).findBySaison(any());
        verify(couts, never()).save(any());
    }

    private LotAffinage lotComplet() {
        Fromage fromage = new Fromage(1L, "Tomme", null);
        Recette recette = new Recette("Tomme nature");
        recette.setFromage(fromage);
        recette.addIngredient(ingredient("Sel", "2.0000", "3.0000"));
        recette.addIngredient(ingredient("Lait cru", "50.0000", "9.0000"));
        Fabrication fabrication = new Fabrication();
        fabrication.setId(10L);
        fabrication.setNumeroLot("LOT-10");
        fabrication.setDateHeureDebut(LocalDateTime.of(2026, 1, 1, 8, 0));
        fabrication.setRecette(recette);
        fabrication.setQuantiteLait(new BigDecimal("10.0000"));
        fabrication.setDureeChauffageMinutes(60);
        fabrication.setPoidsTotalFromages(new BigDecimal("10.0000"));
        fabrication.setNombreFromages(5);
        LotAffinage lot = new LotAffinage();
        lot.setFabrication(fabrication);
        lot.setQuantiteInitiale(5);
        lot.setDateMiseEnCave(LocalDate.of(2026, 1, 1));
        return lot;
    }

    private RecetteIngredient ingredient(String nom, String quantite, String cout) {
        MatierePremiere matiere = new MatierePremiere();
        matiere.setNom(nom);
        RecetteIngredient ingredient = new RecetteIngredient();
        ingredient.setMatierePremiere(matiere);
        ingredient.setQuantite(new BigDecimal(quantite));
        ingredient.setCoutUnitaireReference(new BigDecimal(cout));
        return ingredient;
    }

    private TarifLait tarif(String prix, LocalDate date) {
        TarifLait tarif = new TarifLait();
        tarif.setSaison(TypeSaison.SECHE);
        tarif.setPrixParLitre(new BigDecimal(prix));
        tarif.setDateDebutValidite(date);
        tarif.setActif(true);
        return tarif;
    }

    private ConfigurationEmballage configurationEmballage(String cout) {
        Emballage emballage = new Emballage();
        emballage.setNom("Papier");
        emballage.setCoutUnitaire(new BigDecimal(cout));
        emballage.setActif(true);
        ConfigurationEmballage configuration = new ConfigurationEmballage();
        configuration.setEmballage(emballage);
        configuration.setQuantiteParUnite(BigDecimal.ONE);
        configuration.setActif(true);
        return configuration;
    }

    private RegleCoutEnergie regleEnergie(TypeOperationEnergie type, UniteCalculEnergie unite, String cout,
            LocalDate date) {
        RegleCoutEnergie regle = new RegleCoutEnergie();
        regle.setTypeOperation(type);
        regle.setUniteCalcul(unite);
        regle.setCoutStandard(new BigDecimal(cout));
        regle.setDateDebutValidite(date);
        regle.setActif(true);
        return regle;
    }

    private RegleMainOeuvre regleMainOeuvre(TypeOperationMainOeuvre type, int minutes, String cout,
            LocalDate date) {
        RegleMainOeuvre regle = new RegleMainOeuvre();
        regle.setTypeOperation(type);
        regle.setDureeStandardMinutes(minutes);
        regle.setCoutHoraire(new BigDecimal(cout));
        regle.setDateDebutValidite(date);
        regle.setActif(true);
        return regle;
    }

    private RegleAmortissement regleAmortissement(String cout, LocalDate date) {
        Equipement equipement = new Equipement();
        equipement.setNom("Cuve");
        equipement.setActif(true);
        RegleAmortissement regle = new RegleAmortissement();
        regle.setEquipement(equipement);
        regle.setCoutParFabrication(new BigDecimal(cout));
        regle.setDateDebutValidite(date);
        regle.setActif(true);
        return regle;
    }
}
