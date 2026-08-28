package com.fromagerie_back;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import com.fromagerie_back.model.Fabrication;
import com.fromagerie_back.model.Fromage;
import com.fromagerie_back.model.OrigineLait;
import com.fromagerie_back.model.Recette;
import com.fromagerie_back.repository.FabricationRepository;
import com.fromagerie_back.repository.FromageRepository;
import com.fromagerie_back.repository.RecetteRepository;

@SpringBootTest
@AutoConfigureMockMvc
class FabricationAnalyticsIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private FabricationRepository fabricationRepository;

    @Autowired
    private RecetteRepository recetteRepository;

    @Autowired
    private FromageRepository fromageRepository;

    private Fromage tomme;
    private Fromage cirque;
    private Recette tommeRecipe;
    private Recette cirqueRecipe;

    @BeforeEach
    void setUp() {
        fabricationRepository.deleteAll();
        recetteRepository.deleteAll();
        fromageRepository.deleteAll();

        tomme = fromageRepository.save(new Fromage(null, "Tomme", "Tomme test"));
        cirque = fromageRepository.save(new Fromage(null, "Cirque", "Cirque test"));
        tommeRecipe = recipe("Tomme v1", tomme);
        cirqueRecipe = recipe("Cirque v1", cirque);
    }

    @Test
    void temperatureHistoryFiltersCheesePeriodAndOrdersChronologically() throws Exception {
        fabrication("T-2", "2026-08-20T10:00:00", tommeRecipe, "10", "39");
        fabrication("T-1", "2026-08-19T10:00:00", tommeRecipe, "11", "37");
        fabrication("C-1", "2026-08-19T11:00:00", cirqueRecipe, "50", "80");
        fabrication("OLD", "2026-07-01T10:00:00", tommeRecipe, "9", "36");

        mockMvc.perform(get("/api/fabrications/analytics/temperatures")
                        .param("fromageId", tomme.getId().toString())
                        .param("dateDebut", "2026-08-01")
                        .param("dateFin", "2026-08-31")
                        .with(user("owner").roles("PROPRIETAIRE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].numeroLot").value("T-1"))
                .andExpect(jsonPath("$[1].numeroLot").value("T-2"))
                .andExpect(jsonPath("$[0].fromageNom").value("Tomme"));
    }

    @Test
    void yieldHistoryReturnsCorrectCountAverageMinimumAndMaximum() throws Exception {
        fabrication("T-1", "2026-08-19T10:00:00", tommeRecipe, "9", "37");
        fabrication("T-2", "2026-08-20T10:00:00", tommeRecipe, "10", "38");
        fabrication("T-3", "2026-08-21T10:00:00", tommeRecipe, "12", "39");

        mockMvc.perform(get("/api/fabrications/analytics/rendements")
                        .param("fromageId", tomme.getId().toString())
                        .with(user("employee").roles("FABRICATION")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombreFabrications").value(3))
                .andExpect(jsonPath("$.moyenne").value(10.33))
                .andExpect(jsonPath("$.minimum").value(9))
                .andExpect(jsonPath("$.maximum").value(12))
                .andExpect(jsonPath("$.historique.length()").value(3));
    }

    @Test
    void emptyYieldHistoryHasNullStatisticsAndEmptyHistory() throws Exception {
        mockMvc.perform(get("/api/fabrications/analytics/rendements")
                        .param("fromageId", tomme.getId().toString())
                        .with(user("owner").roles("PROPRIETAIRE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombreFabrications").value(0))
                .andExpect(jsonPath("$.moyenne").doesNotExist())
                .andExpect(jsonPath("$.minimum").doesNotExist())
                .andExpect(jsonPath("$.maximum").doesNotExist())
                .andExpect(jsonPath("$.historique").isEmpty());
    }

    @Test
    void seasonalStatisticsDoNotMixAnotherCheese() throws Exception {
        fabrication("DRY", "2026-08-20T10:00:00", tommeRecipe, "10", "38");
        fabrication("WET", "2026-02-20T10:00:00", tommeRecipe, "12", "38");
        fabrication("OTHER", "2026-08-20T11:00:00", cirqueRecipe, "80", "80");

        mockMvc.perform(get("/api/fabrications/analytics/rendements/saisons")
                        .param("fromageId", tomme.getId().toString())
                        .with(user("owner").roles("PROPRIETAIRE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fromageNom").value("Tomme"))
                .andExpect(jsonPath("$.saisonSeche.nombreFabrications").value(1))
                .andExpect(jsonPath("$.saisonSeche.moyenne").value(10))
                .andExpect(jsonPath("$.saisonHumide.nombreFabrications").value(1))
                .andExpect(jsonPath("$.saisonHumide.moyenne").value(12));
    }

    @Test
    void seasonalComparisonClassifiesEveryYieldAtSeasonBoundaries() throws Exception {
        fabrication("DRY-START", "2024-05-01T10:00:00", tommeRecipe, "9", "38");
        fabrication("DRY-END", "2024-10-31T10:00:00", tommeRecipe, "10", "38");
        fabrication("WET-START", "2024-11-01T10:00:00", tommeRecipe, "11", "38");
        fabrication("WET-END", "2024-04-30T10:00:00", tommeRecipe, "12", "38");
        fabrication("LEAP-DAY", "2024-02-29T10:00:00", tommeRecipe, "13", "38");

        mockMvc.perform(get("/api/fabrications/analytics/rendements/saisons")
                        .param("fromageId", tomme.getId().toString())
                        .with(user("owner").roles("PROPRIETAIRE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.saisonSeche.nombreFabrications").value(2))
                .andExpect(jsonPath("$.saisonHumide.nombreFabrications").value(3));
    }

    @Test
    void seasonWithoutDataIsExplicit() throws Exception {
        fabrication("DRY", "2026-08-20T10:00:00", tommeRecipe, "10", "38");

        mockMvc.perform(get("/api/fabrications/analytics/rendements/saisons")
                        .param("fromageId", tomme.getId().toString())
                        .with(user("owner").roles("PROPRIETAIRE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.saisonHumide.nombreFabrications").value(0))
                .andExpect(jsonPath("$.saisonHumide.donneesDisponibles").value(false));
    }

    @Test
    void invalidDatesAndUnknownReferencesAreRejected() throws Exception {
        mockMvc.perform(get("/api/fabrications/analytics/rendements")
                        .param("dateDebut", "2026-09-01")
                        .param("dateFin", "2026-08-01")
                        .with(user("owner").roles("PROPRIETAIRE")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("dateDebut doit être antérieure ou égale à dateFin"));

        mockMvc.perform(get("/api/fabrications/analytics/rendements")
                        .param("fromageId", "999999")
                        .with(user("owner").roles("PROPRIETAIRE")))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/fabrications/analytics/rendements")
                        .param("recetteId", "999999")
                        .with(user("owner").roles("PROPRIETAIRE")))
                .andExpect(status().isNotFound());
    }

    @Test
    void insufficientBaselineIsReportedWithoutFalseAnomaly() throws Exception {
        Fabrication target = fabrication("TARGET", "2026-08-25T10:00:00", tommeRecipe, "3", "20");

        mockMvc.perform(get("/api/fabrications/{id}/analytics/anomalies", target.getId())
                        .with(user("owner").roles("PROPRIETAIRE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("DONNEES_INSUFFISANTES"))
                .andExpect(jsonPath("$.anomalies").isEmpty());
    }

    @Test
    void detectsLowYieldAndHighTemperatureWithExplanatoryBounds() throws Exception {
        for (int index = 1; index <= 4; index++) {
            fabrication("BASE-" + index, "2026-08-1" + index + "T10:00:00", tommeRecipe, "10", "38");
        }
        Fabrication target = fabrication("TARGET", "2026-08-25T10:00:00", tommeRecipe, "5", "60");

        mockMvc.perform(get("/api/fabrications/{id}/analytics/anomalies", target.getId())
                        .with(user("owner").roles("PROPRIETAIRE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("ANOMALIE"))
                .andExpect(jsonPath("$.baselineUtilisee").value("MEME_RECETTE_ET_SAISON"))
                .andExpect(jsonPath("$.nombreEchantillons").value(4))
                .andExpect(jsonPath("$.anomalies.length()").value(2))
                .andExpect(jsonPath("$.anomalies[0].borneBasse").exists())
                .andExpect(jsonPath("$.anomalies[0].borneHaute").exists())
                .andExpect(jsonPath("$.anomalies[0].message").isNotEmpty());
    }

    @Test
    void anotherCheeseDoesNotProvideAnomalyBaseline() throws Exception {
        for (int index = 1; index <= 4; index++) {
            fabrication("OTHER-" + index, "2026-08-1" + index + "T10:00:00", cirqueRecipe, "10", "38");
        }
        Fabrication target = fabrication("TARGET", "2026-08-25T10:00:00", tommeRecipe, "5", "60");

        mockMvc.perform(get("/api/fabrications/{id}/analytics/anomalies", target.getId())
                        .with(user("owner").roles("PROPRIETAIRE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("DONNEES_INSUFFISANTES"))
                .andExpect(jsonPath("$.nombreEchantillons").value(0));
    }

    @Test
    void analyticsSecurityAllowsOperationalRolesAndRejectsSalesAndAnonymous() throws Exception {
        String endpoint = "/api/fabrications/analytics/rendements";
        mockMvc.perform(get(endpoint).with(user("owner").roles("PROPRIETAIRE")))
                .andExpect(status().isOk());
        mockMvc.perform(get(endpoint).with(user("employee").roles("FABRICATION")))
                .andExpect(status().isOk());
        mockMvc.perform(get(endpoint).with(user("sales").roles("VENTE")))
                .andExpect(status().isForbidden());
        mockMvc.perform(get(endpoint))
                .andExpect(status().isUnauthorized());
    }

    private Recette recipe(String name, Fromage cheese) {
        Recette recipe = new Recette(name);
        recipe.setFromage(cheese);
        return recetteRepository.save(recipe);
    }

    private Fabrication fabrication(
            String lot, String date, Recette recipe, String yield, String heatingTemperature) {
        Fabrication fabrication = new Fabrication();
        fabrication.setNumeroLot(lot);
        fabrication.setDateHeureDebut(LocalDateTime.parse(date));
        fabrication.setRecette(recipe);
        fabrication.setQuantiteLait(new BigDecimal("100"));
        fabrication.setTemperatureLait(new BigDecimal("34"));
        fabrication.setOrigineLait(OrigineLait.TRAITE_MATIN);
        fabrication.setTemperatureChauffage(new BigDecimal(heatingTemperature));
        fabrication.setDureeChauffageMinutes(45);
        fabrication.setTypePresure("Présure animale");
        fabrication.setQuantitePresure(BigDecimal.ONE);
        fabrication.setTypeFerments("Ferments");
        fabrication.setQuantiteFerments(BigDecimal.ONE);
        fabrication.setTemperatureMiseEnMoule(new BigDecimal("31"));
        fabrication.setDureeEgouttageMinutes(720);
        fabrication.setPoidsTotalFromages(new BigDecimal("10"));
        fabrication.setRendement(new BigDecimal(yield));
        fabrication.setNombreFromages(10);
        return fabricationRepository.save(fabrication);
    }
}
