package com.fromagerie_back;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import com.fromagerie_back.model.Fabrication;
import com.fromagerie_back.model.Fromage;
import com.fromagerie_back.model.Recette;
import com.fromagerie_back.model.Role;
import com.fromagerie_back.model.LotLait;
import com.fromagerie_back.model.MatierePremiere;
import com.fromagerie_back.model.RecetteIngredient;
import com.fromagerie_back.model.TypeTraite;
import com.fromagerie_back.model.UniteMesure;
import com.fromagerie_back.model.Utilisateur;
import com.fromagerie_back.dto.LotLaitDtos.UtilisationRequest;
import com.fromagerie_back.exception.BusinessValidationException;
import com.fromagerie_back.repository.FabricationRepository;
import com.fromagerie_back.repository.FromageRepository;
import com.fromagerie_back.repository.RecetteRepository;
import com.fromagerie_back.repository.LotLaitRepository;
import com.fromagerie_back.repository.MatierePremiereRepository;
import com.fromagerie_back.repository.RecetteIngredientRepository;
import com.fromagerie_back.repository.UtilisationLotLaitRepository;
import com.fromagerie_back.repository.UtilisateurRepository;
import com.fromagerie_back.service.UtilisateurService;
import com.fromagerie_back.service.UtilisationLotLaitService;

@SpringBootTest
@AutoConfigureMockMvc
class FabricationIntegrationTests {

    private static final String OWNER_PASSWORD = "mot-de-passe-solide";
    private static final String FABRICATION_PIN = "1234";
    private static final String VENTE_PIN = "5678";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private FabricationRepository fabricationRepository;

    @Autowired
    private RecetteRepository recetteRepository;

    @Autowired
    private FromageRepository fromageRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private UtilisateurService utilisateurService;

    @Autowired
    private LotLaitRepository lotLaitRepository;

    @Autowired
    private UtilisationLotLaitRepository utilisationLotLaitRepository;

    @Autowired
    private UtilisationLotLaitService utilisationLotLaitService;

    @Autowired
    private MatierePremiereRepository matierePremiereRepository;

    @Autowired
    private RecetteIngredientRepository recetteIngredientRepository;

    private Utilisateur proprietaire;
    private Utilisateur fabricationUser;
    private Fromage fromage;
    private Recette recette;
    private LotLait defaultMilkLot;

    @BeforeEach
    void setUp() {
        utilisationLotLaitRepository.deleteAll();
        fabricationRepository.deleteAll();
        lotLaitRepository.deleteAll();
        recetteRepository.deleteAll();
        matierePremiereRepository.deleteAll();
        fromageRepository.deleteAll();
        utilisateurRepository.deleteAll();

        proprietaire = utilisateurService.createUser(
                "gilles", "Gilles Payet", OWNER_PASSWORD, Role.PROPRIETAIRE, true);
        fabricationUser = utilisateurService.createUser(
                "jean-hugues", "Jean-Hugues", FABRICATION_PIN, Role.FABRICATION, true);
        utilisateurService.createUser(
                "nathalie", "Nathalie", VENTE_PIN, Role.VENTE, true);

        fromage = fromageRepository.save(
                new Fromage(null, "Tomme des Hauts", "Fromage de démonstration"));
        recette = new Recette("Tomme traditionnelle");
        recette.setFromage(fromage);
        recette = recetteRepository.save(recette);

        defaultMilkLot = createMilkLot("LAIT-TEST", 1_000_000);
    }

    @Test
    void oneMilkLotDefinesPersistedFabricationMilkQuantity() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);
        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T08:30:00", 999, 10, 8,
                                ",\"lotsLait\":[{\"lotLaitId\":" + defaultMilkLot.getId() + ",\"quantiteUtilisee\":70}]")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.quantiteLait").value(70))
                .andExpect(jsonPath("$.origineLait").value("TRAITE_MATIN"));

        assertThat(fabricationRepository.findAll().getFirst().getQuantiteLait())
                .isEqualByComparingTo("70");
    }

    @Test
    void severalMilkLotsAreSummedByBackend() throws Exception {
        LotLait secondLot = createMilkLot("LAIT-SECOND", 100);
        secondLot.setTypeTraite(TypeTraite.SOIR);
        secondLot = lotLaitRepository.saveAndFlush(secondLot);
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);
        String usages = ",\"lotsLait\":[{\"lotLaitId\":" + defaultMilkLot.getId()
                + ",\"quantiteUtilisee\":70},{\"lotLaitId\":" + secondLot.getId()
                + ",\"quantiteUtilisee\":30}]";

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T08:30:00", 1, 10, 8, usages)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.quantiteLait").value(100))
                .andExpect(jsonPath("$.origineLait").value("MELANGE"));
    }

    @Test
    void nonPositiveUnavailableDuplicateAndMissingMilkLotsAreRejected() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);
        String prefix = ",\"lotsLait\":";

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T08:30:00", 10, 1, 1,
                                prefix + "[{\"lotLaitId\":" + defaultMilkLot.getId() + ",\"quantiteUtilisee\":0}]")))
                .andExpect(status().isBadRequest());

        LotLait limitedLot = createMilkLot("LAIT-LIMITE", 10);
        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T08:30:00", 10, 1, 1,
                                prefix + "[{\"lotLaitId\":" + limitedLot.getId() + ",\"quantiteUtilisee\":11}]")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Quantité insuffisante dans le lot LAIT-LIMITE : 10 L disponibles, 11 L demandés."));

        String duplicate = "[{\"lotLaitId\":" + defaultMilkLot.getId() + ",\"quantiteUtilisee\":5},"
                + "{\"lotLaitId\":" + defaultMilkLot.getId() + ",\"quantiteUtilisee\":5}]";
        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T08:30:00", 10, 1, 1, prefix + duplicate)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Le lot de lait " + defaultMilkLot.getId() + " est déjà sélectionné pour cette fabrication."));

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T08:30:00", 10, 1, 1, prefix + "[]")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Aucun lot de lait n'a été sélectionné."));

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T08:30:00", 10, 1, 1,
                                prefix + "[{\"lotLaitId\":999999,\"quantiteUtilisee\":10}]")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Le lot de lait 999999 n'existe pas."));
    }

    @Test
    void decimalQuantitiesAreStoredExactlyAndExhaustedLotCannotBeReused() throws Exception {
        LotLait preciseLot = createMilkLot("LAIT-PRECIS", new BigDecimal("12.345"));
        LotLait complementLot = createMilkLot("LAIT-COMPLEMENT", new BigDecimal("0.655"));
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);
        String usages = ",\"lotsLait\":[{\"lotLaitId\":" + preciseLot.getId()
                + ",\"quantiteUtilisee\":12.345},{\"lotLaitId\":" + complementLot.getId()
                + ",\"quantiteUtilisee\":0.655}]";

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T08:30:00", 999, 1, 1, usages)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.quantiteLait").value(13.0));

        Fabrication saved = fabricationRepository.findAll().getFirst();
        assertThat(saved.getQuantiteLait()).isEqualByComparingTo("13.0000");
        assertThat(utilisationLotLaitRepository.findByFabricationIdOrderByLotLaitDateTraiteAsc(saved.getId()))
                .extracting(usage -> usage.getQuantiteUtilisee().stripTrailingZeros().toPlainString())
                .containsExactlyInAnyOrder("12.345", "0.655");

        String exhaustedUsage = ",\"lotsLait\":[{\"lotLaitId\":" + preciseLot.getId()
                + ",\"quantiteUtilisee\":0.0001}]";
        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:30:00", 1, 1, 1, exhaustedUsage)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Quantité insuffisante dans le lot LAIT-PRECIS : 0 L disponibles, 0.0001 L demandés."));
    }

    @Test
    void replacingMilkLotsExcludesTheFabricationsOwnPreviousConsumption() throws Exception {
        LotLait sharedLot = createMilkLot("LAIT-MODIFICATION", 100);
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);
        createWithSingleUsage(session, "2026-08-25T08:30:00", sharedLot, "60");
        createWithSingleUsage(session, "2026-08-25T09:30:00", sharedLot, "20");
        Fabrication first = fabricationRepository.findAll().stream()
                .filter(f -> f.getDateHeureDebut().getHour() == 8).findFirst().orElseThrow();

        utilisationLotLaitService.replace(first.getId(),
                List.of(new UtilisationRequest(sharedLot.getId(), new BigDecimal("70"))));

        assertThat(fabricationRepository.findById(first.getId()).orElseThrow().getQuantiteLait())
                .isEqualByComparingTo("70");
        assertThat(utilisationLotLaitRepository.usedOutside(sharedLot.getId(), null))
                .isEqualByComparingTo("90");
    }

    @Test
    void concurrentConsumptionsCannotExceedAvailableMilk() throws Exception {
        LotLait sharedLot = createMilkLot("LAIT-CONCURRENT", 50);
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);
        createWithSingleUsage(session, "2026-08-25T08:30:00", defaultMilkLot, "1");
        createWithSingleUsage(session, "2026-08-25T09:30:00", defaultMilkLot, "1");
        List<Fabrication> created = fabricationRepository.findAll();
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            Future<Boolean> first = executor.submit(() -> replaceAfterSignal(
                    start, created.get(0).getId(), sharedLot.getId(), "40"));
            Future<Boolean> second = executor.submit(() -> replaceAfterSignal(
                    start, created.get(1).getId(), sharedLot.getId(), "30"));
            start.countDown();

            assertThat(List.of(first.get(), second.get())).containsExactlyInAnyOrder(true, false);
            assertThat(utilisationLotLaitRepository.usedOutside(sharedLot.getId(), null))
                    .isLessThanOrEqualTo(new BigDecimal("50"));
        } finally {
            executor.shutdownNow();
        }
    }

    @Test
    void ownerCanCreateFabricationWithGeneratedLotRendementAndCurrentOperator() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications")
                        .session(session)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T08:30:00", 500, 50, 40, "")))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.numeroLot").value("20260825-001"))
                .andExpect(jsonPath("$.rendement").value(10.0))
                .andExpect(jsonPath("$.operateurId").value(proprietaire.getId()))
                .andExpect(jsonPath("$.operateurNom").value("Gilles Payet"))
                .andExpect(jsonPath("$.fromageNom").value("Tomme des Hauts"))
                .andExpect(jsonPath("$.credentialHash").doesNotExist())
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.pin").doesNotExist());

        Fabrication saved = fabricationRepository
                .findAllWithDetailsOrderByDateHeureDebutDesc()
                .getFirst();
        assertThat(saved.getOperateur().getId()).isEqualTo(proprietaire.getId());
    }

    @Test
    void fabricationRoleCanCreateFabrication() throws Exception {
        MockHttpSession session = authenticatedSession("jean-hugues", FABRICATION_PIN);

        mockMvc.perform(post("/api/fabrications")
                        .session(session)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 24, "")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.operateurId").value(fabricationUser.getId()));
    }

    @Test
    void venteCannotCreateOrUpdateFabrication() throws Exception {
        MockHttpSession venteSession = authenticatedSession("nathalie", VENTE_PIN);

        mockMvc.perform(post("/api/fabrications")
                        .session(venteSession)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 24, "")))
                .andExpect(status().isForbidden());

        Long fabricationId = createFabricationAsOwner();
        mockMvc.perform(put("/api/fabrications/{id}", fabricationId)
                        .session(venteSession)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T10:00:00", 400, 40, 30, "")))
                .andExpect(status().isForbidden());
    }

    @Test
    void createWithoutSessionReturnsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/fabrications")
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 24, "")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void unknownRecipeReturnsNotFound() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications")
                        .session(session)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(999999L, "2026-08-25T09:00:00", 300, 30, 24, "")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Recette introuvable avec l'id : 999999"));
    }

    @Test
    void negativeMilkQuantityReturnsBadRequest() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications")
                        .session(session)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", -1, 30, 24, "")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.quantiteLait").exists());
    }

    @Test
    void nonPositiveCheeseCountReturnsBadRequest() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications")
                        .session(session)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 0, "")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.nombreFromages").exists());
    }

    @Test
    void cheeseCountAboveMilkBasedMaximumIsAlwaysRejected() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 3001,
                                ",\"nombreFromagesFaibleConfirme\":true")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Le nombre de fromages produits ne peut pas dépasser 3000 pour cette quantité de lait."));
    }

    @Test
    void exceptionallyLowCheeseCountRequiresConfirmationAndKeepsDeclaredValue() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);
        String request = validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 1, "");

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Le nombre de fromages produits paraît très faible pour 300 L de lait utilisés. "
                                + "Vérifiez la saisie. Si cette quantité correspond réellement à la fabrication, "
                                + "vous pouvez la confirmer."));

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 1,
                                ",\"nombreFromagesFaibleConfirme\":true")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombreFromages").value(1));
    }

    @ParameterizedTest
    @CsvSource({"100, 1", "100, 4", "200, 9"})
    void lowCheeseCountUsesOnePerTwentyLitersWarningThreshold(int milk, int cheeseCount) throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", milk, 20, cheeseCount, "")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Le nombre de fromages produits paraît très faible pour " + milk
                                + " L de lait utilisés. Vérifiez la saisie. Si cette quantité correspond réellement "
                                + "à la fabrication, vous pouvez la confirmer."));
    }

    @ParameterizedTest
    @CsvSource({"100, 5", "100, 6", "200, 10"})
    void cheeseCountAtOrAboveWarningThresholdNeedsNoConfirmation(int milk, int cheeseCount) throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", milk, 20, cheeseCount, "")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombreFromages").value(cheeseCount));
    }

    @ParameterizedTest
    @ValueSource(strings = {"14.9", "45.1", "300"})
    void milkTemperatureOutsideGlobalGuardReturnsBadRequest(String temperature) throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications")
                        .session(session)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(
                                recette.getId(), "2026-08-25T09:00:00", 300, 30, 24,
                                ",\"temperatureLait\":" + temperature)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.temperatureLait")
                        .value("La température du lait doit être comprise entre 15 °C et 45 °C."));
    }

    @ParameterizedTest
    @ValueSource(strings = {"15", "31.5", "45"})
    void milkTemperatureWithinInclusiveGlobalGuardIsAccepted(String temperature) throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications")
                        .session(session)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 24,
                                ",\"temperatureLait\":" + temperature)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.temperatureLait").value(Double.parseDouble(temperature)));
    }

    @Test
    void nullMilkTemperatureReturnsValidationError() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications")
                        .session(session)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 24,
                                ",\"temperatureLait\":null")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.temperatureLait").exists());
    }

    @ParameterizedTest
    @ValueSource(strings = {"25.9", "48.1", "300"})
    void heatingTemperatureOutsideGlobalGuardReturnsBadRequest(String temperature) throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 24,
                                ",\"temperatureChauffage\":" + temperature)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.temperatureChauffage")
                        .value("La température de chauffage doit être comprise entre 26 °C et 48 °C."));
    }

    @ParameterizedTest
    @ValueSource(strings = {"26", "37", "42.8", "48"})
    void heatingTemperatureWithinInclusiveGlobalGuardIsAccepted(String temperature) throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 24,
                                ",\"temperatureChauffage\":" + temperature)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.temperatureChauffage").value(Double.parseDouble(temperature)));
    }

    @Test
    void nullHeatingTemperatureReturnsValidationError() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 24,
                                ",\"temperatureChauffage\":null")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.temperatureChauffage").exists());
    }

    @ParameterizedTest
    @ValueSource(strings = {"19.9", "50.1"})
    void moldingTemperatureOutsideGlobalGuardReturnsBadRequest(String temperature) throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 24,
                                ",\"temperatureMiseEnMoule\":" + temperature)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.temperatureMiseEnMoule")
                        .value("La température de mise en moule doit être comprise entre 20 °C et 50 °C."));
    }

    @ParameterizedTest
    @ValueSource(strings = {"20", "35.5", "50"})
    void moldingTemperatureWithinInclusiveGlobalGuardIsAccepted(String temperature) throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 24,
                                ",\"temperatureMiseEnMoule\":" + temperature)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.temperatureMiseEnMoule").value(Double.parseDouble(temperature)));
    }

    @Test
    void nullMoldingTemperatureReturnsValidationError() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 24,
                                ",\"temperatureMiseEnMoule\":null")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.temperatureMiseEnMoule").exists());
    }

    @Test
    void moldingTemperatureGuardAlsoAppliesOnUpdate() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);
        Long fabricationId = createFabrication(session, validRequest(
                recette.getId(), "2026-08-25T08:00:00", 300, 30, 24, ""));

        mockMvc.perform(put("/api/fabrications/{id}", fabricationId).session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T08:00:00", 300, 30, 24,
                                ",\"temperatureMiseEnMoule\":50.1")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.temperatureMiseEnMoule")
                        .value("La température de mise en moule doit être comprise entre 20 °C et 50 °C."));
    }

    @ParameterizedTest
    @ValueSource(ints = {-1, 29, 2881, 99999})
    void drainageDurationOutsideGlobalGuardReturnsBadRequest(int duration) throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 24,
                                ",\"dureeEgouttageMinutes\":" + duration)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.dureeEgouttageMinutes")
                        .value("La durée d'égouttage doit être comprise entre 30 minutes et 48 heures."));
    }

    @ParameterizedTest
    @ValueSource(ints = {30, 240, 1440, 2880})
    void drainageDurationWithinInclusiveGlobalGuardIsAccepted(int duration) throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 24,
                                ",\"dureeEgouttageMinutes\":" + duration)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.dureeEgouttageMinutes").value(duration));
    }

    @Test
    void nullDrainageDurationReturnsValidationError() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 24,
                                ",\"dureeEgouttageMinutes\":null")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.dureeEgouttageMinutes").exists());
    }

    @Test
    void drainageDurationGuardAlsoAppliesOnUpdate() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);
        Long fabricationId = createFabrication(session, validRequest(
                recette.getId(), "2026-08-25T08:00:00", 300, 30, 24, ""));

        mockMvc.perform(put("/api/fabrications/{id}", fabricationId).session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T08:00:00", 300, 30, 24,
                                ",\"dureeEgouttageMinutes\":2881")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.dureeEgouttageMinutes")
                        .value("La durée d'égouttage doit être comprise entre 30 minutes et 48 heures."));
    }

    @ParameterizedTest
    @ValueSource(ints = {9, 66, 500})
    void heatingDurationOutsideGlobalGuardReturnsBadRequest(int duration) throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 24,
                                ",\"dureeChauffageMinutes\":" + duration)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.dureeChauffageMinutes")
                        .value("La durée de chauffage doit être comprise entre 10 et 65 minutes."));
    }

    @ParameterizedTest
    @ValueSource(ints = {10, 30, 60, 65})
    void heatingDurationWithinInclusiveGlobalGuardIsAccepted(int duration) throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 24,
                                ",\"dureeChauffageMinutes\":" + duration)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.dureeChauffageMinutes").value(duration));
    }

    @Test
    void nullHeatingDurationReturnsValidationError() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 24,
                                ",\"dureeChauffageMinutes\":null")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.dureeChauffageMinutes").exists());
    }

    @ParameterizedTest
    @ValueSource(strings = {"18", "30", "42", "30.1234"})
    void rennetQuantityWithinFortyPercentGuardIsAccepted(String quantity) throws Exception {
        addRennetIngredient("20.0000", UniteMesure.ML);
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 150, 30, 24,
                                ",\"typePresure\":\"Présure animale\",\"quantitePresure\":" + quantity)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.quantitePresure").value(Double.parseDouble(quantity)));
    }

    @ParameterizedTest
    @ValueSource(strings = {"17.99", "42.01"})
    void rennetQuantityOutsideFortyPercentGuardIsRejected(String quantity) throws Exception {
        addRennetIngredient("20.0000", UniteMesure.ML);
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 150, 30, 24,
                                ",\"typePresure\":\"Présure animale\",\"quantitePresure\":" + quantity)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "La recette recommande 30 ML de présure. Pour cette fabrication, la quantité autorisée est comprise entre 18 et 42 ML (±40 %)."));
    }

    @ParameterizedTest
    @ValueSource(strings = {"0", "-1"})
    void nonPositiveRennetQuantityIsRejected(String quantity) throws Exception {
        addRennetIngredient("20.0000", UniteMesure.ML);
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 150, 30, 24,
                                ",\"typePresure\":\"Présure animale\",\"quantitePresure\":" + quantity)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.quantitePresure").exists());
    }

    @Test
    void nonexistentAlternativeRennetIsRejected() throws Exception {
        addRennetIngredient("20.0000", UniteMesure.ML);
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 150, 30, 24,
                                ",\"typePresure\":\"Présure différente\",\"quantitePresure\":30")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "La présure sélectionnée n'existe pas ou est inactive."));
    }

    @ParameterizedTest
    @ValueSource(strings = {"6", "20", "60"})
    void differentRennetWithinIndicativeRangeIsAccepted(String quantity) throws Exception {
        addRennetIngredient("20.0000", UniteMesure.ML);
        addAlternativeRennet();
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 150, 30, 24,
                                ",\"typePresure\":\"Présure microbienne\",\"quantitePresure\":" + quantity)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.typePresure").value("Présure microbienne"))
                .andExpect(jsonPath("$.quantitePresure").value(Double.parseDouble(quantity)));
    }

    @ParameterizedTest
    @ValueSource(strings = {"3", "61"})
    void differentRennetOutsideIndicativeRangeRequiresConfirmation(String quantity) throws Exception {
        addRennetIngredient("20.0000", UniteMesure.ML);
        addAlternativeRennet();
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);
        String override = ",\"typePresure\":\"Présure microbienne\",\"quantitePresure\":" + quantity;

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 150, 30, 24, override)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "La quantité de présure différente, très éloignée de la référence, doit être confirmée."));

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 150, 30, 24,
                                override + ",\"presureHorsPlageConfirmee\":true")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.typePresure").value("Présure microbienne"))
                .andExpect(jsonPath("$.quantitePresure").value(Double.parseDouble(quantity)));
    }

    @Test
    void differentRennetAtAbsoluteMaximumCanBeConfirmed() throws Exception {
        addRennetIngredient("20.0000", UniteMesure.ML);
        addAlternativeRennet();
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 150, 30, 24,
                                ",\"typePresure\":\"Présure microbienne\",\"quantitePresure\":150,"
                                        + "\"presureHorsPlageConfirmee\":true")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.quantitePresure").value(150));
    }

    @ParameterizedTest
    @ValueSource(strings = {"150.01", "10000"})
    void differentRennetAboveAbsoluteMaximumIsAlwaysRejected(String quantity) throws Exception {
        addRennetIngredient("20.0000", UniteMesure.ML);
        addAlternativeRennet();
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 150, 30, 24,
                                ",\"typePresure\":\"Présure microbienne\",\"quantitePresure\":" + quantity
                                        + ",\"presureHorsPlageConfirmee\":true")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "La quantité de présure saisie est manifestement incohérente avec la quantité de lait utilisée. "
                                + "Maximum autorisé pour cette fabrication : 150 mL."));
    }

    @ParameterizedTest
    @ValueSource(strings = {"9", "15", "21"})
    void recipeFermentWithinFortyPercentGuardIsAccepted(String quantity) throws Exception {
        RecetteIngredient recipeFerment = addFermentIngredient("10.0000", UniteMesure.G);
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 150, 30, 24,
                                ",\"typeFerments\":\"Ferment lactique\",\"quantiteFerments\":" + quantity)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.typeFerments").value("Ferment lactique"))
                .andExpect(jsonPath("$.quantiteFerments").value(Double.parseDouble(quantity)));

        assertThat(recetteIngredientRepository.findById(recipeFerment.getId()).orElseThrow().getQuantite())
                .isEqualByComparingTo("10.0000");
    }

    @ParameterizedTest
    @ValueSource(strings = {"8.99", "21.01"})
    void recipeFermentOutsideFortyPercentGuardIsRejected(String quantity) throws Exception {
        addFermentIngredient("10.0000", UniteMesure.G);
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 150, 30, 24,
                                ",\"typeFerments\":\"Ferment lactique\",\"quantiteFerments\":" + quantity)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "La recette recommande 15 G de ferment. Pour cette fabrication, la quantité autorisée est comprise entre 9 et 21 G (±40 %)."));
    }

    @Test
    void fermentLimitsAreRecalculatedFromActualMilkQuantity() throws Exception {
        addFermentIngredient("10.0000", UniteMesure.G);
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 100, 20, 16,
                                ",\"typeFerments\":\"Ferment lactique\",\"quantiteFerments\":6")))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T10:00:00", 150, 30, 24,
                                ",\"typeFerments\":\"Ferment lactique\",\"quantiteFerments\":6")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "La recette recommande 15 G de ferment. Pour cette fabrication, la quantité autorisée est comprise entre 9 et 21 G (±40 %)."));
    }

    @ParameterizedTest
    @ValueSource(strings = {"3", "15", "30"})
    void comparableAlternativeFermentWithinIndicativeRangeIsAccepted(String quantity) throws Exception {
        addFermentIngredient("10.0000", UniteMesure.G);
        addAlternativeFerment("Ferment thermophile", UniteMesure.G);
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 150, 30, 24,
                                ",\"typeFerments\":\"Ferment thermophile\",\"quantiteFerments\":" + quantity)))
                .andExpect(status().isCreated());
    }

    @ParameterizedTest
    @ValueSource(strings = {"1.5", "2.99", "30.01", "45"})
    void comparableAlternativeFermentExceptionalRangeRequiresConfirmation(String quantity) throws Exception {
        addFermentIngredient("10.0000", UniteMesure.G);
        addAlternativeFerment("Ferment thermophile", UniteMesure.G);
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);
        String override = ",\"typeFerments\":\"Ferment thermophile\",\"quantiteFerments\":" + quantity;

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 150, 30, 24, override)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "La quantité de ferment différente, très éloignée de la référence, doit être confirmée."));

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 150, 30, 24,
                                override + ",\"fermentHorsPlageConfirmee\":true")))
                .andExpect(status().isCreated());
    }

    @ParameterizedTest
    @ValueSource(strings = {"1.49", "45.01", "10000"})
    void comparableAlternativeFermentOutsideAbsoluteRangeIsAlwaysRejected(String quantity) throws Exception {
        addFermentIngredient("10.0000", UniteMesure.G);
        addAlternativeFerment("Ferment thermophile", UniteMesure.G);
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 150, 30, 24,
                                ",\"typeFerments\":\"Ferment thermophile\",\"quantiteFerments\":" + quantity
                                        + ",\"fermentHorsPlageConfirmee\":true")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void nonComparableAlternativeFermentDoesNotApplyFalseConversion() throws Exception {
        addFermentIngredient("10.0000", UniteMesure.G);
        addAlternativeFerment("Ferment en dose", UniteMesure.UNITE);
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 150, 30, 24,
                                ",\"typeFerments\":\"Ferment en dose\",\"quantiteFerments\":100")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.quantiteFerments").value(100));
    }

    @ParameterizedTest
    @ValueSource(strings = {"0", "-1"})
    void nonPositiveFermentQuantityIsRejected(String quantity) throws Exception {
        addFermentIngredient("10.0000", UniteMesure.G);
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 150, 30, 24,
                                ",\"typeFerments\":\"Ferment lactique\",\"quantiteFerments\":" + quantity)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.quantiteFerments").exists());
    }

    @ParameterizedTest
    @ValueSource(strings = {"0.5", "70.1", "100"})
    void cheeseYieldOutsideAbsoluteRangeIsRejected(String weight) throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 100, 10, 24,
                                ",\"poidsTotalFromages\":" + weight)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Le poids total des fromages saisi est manifestement incohérent avec la quantité de lait utilisée."));
    }

    @ParameterizedTest
    @ValueSource(strings = {"1", "4.99", "30.1", "50", "70"})
    void abnormalCheeseYieldRequiresConfirmation(String weight) throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);
        boolean low = new BigDecimal(weight).compareTo(new BigDecimal("5")) < 0;
        String override = ",\"poidsTotalFromages\":" + weight;

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 100, 10, 24, override)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(low
                        ? "Le rendement paraît anormalement faible. Vérifiez le poids total saisi. Si cette valeur correspond réellement à la fabrication, vous pouvez la confirmer."
                        : "Le rendement paraît anormalement élevé. Vérifiez le poids total saisi. Si cette valeur correspond réellement à la fabrication, vous pouvez la confirmer."));

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 100, 10, 24,
                                override + ",\"rendementAnormalConfirme\":true")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.poidsTotalFromages").value(Double.parseDouble(weight)))
                .andExpect(jsonPath("$.rendement").value(Double.parseDouble(weight)));
    }

    @ParameterizedTest
    @ValueSource(strings = {"5", "10", "30"})
    void normalCheeseYieldIsAccepted(String weight) throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 100, 10, 24,
                                ",\"poidsTotalFromages\":" + weight)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rendement").value(Double.parseDouble(weight)));
    }

    @ParameterizedTest
    @ValueSource(strings = {"0", "-1"})
    void nonPositiveCheeseWeightIsRejected(String weight) throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 100, 10, 24,
                                ",\"poidsTotalFromages\":" + weight)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.poidsTotalFromages").exists());
    }

    @Test
    void nullCheeseWeightIsRejected() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 100, 10, 24,
                                ",\"poidsTotalFromages\":null")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.poidsTotalFromages").exists());
    }

    @Test
    void cheeseYieldIsRecalculatedWhenActualMilkQuantityChanges() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 100, 5, 24, "")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rendement").value(5));

        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T10:00:00", 200, 5, 24, "")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Le rendement paraît anormalement faible. Vérifiez le poids total saisi. Si cette valeur "
                                + "correspond réellement à la fabrication, vous pouvez la confirmer."));
    }

    @Test
    void cheeseYieldGuardAlsoAppliesOnUpdate() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);
        Long fabricationId = createFabrication(session, validRequest(
                recette.getId(), "2026-08-25T08:00:00", 100, 10, 24, ""));

        mockMvc.perform(put("/api/fabrications/{id}", fabricationId).session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T08:00:00", 100, 10, 24,
                                ",\"poidsTotalFromages\":70.1,\"rendementAnormalConfirme\":true")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Le poids total des fromages saisi est manifestement incohérent avec la quantité de lait utilisée."));
    }

    @Test
    void generatedLotsArePresentAndSequentiallyUniqueForSameDay() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        createFabrication(session, validRequest(
                recette.getId(), "2026-08-25T08:00:00", 500, 50, 40, ""));
        createFabrication(session, validRequest(
                recette.getId(), "2026-08-25T12:00:00", 450, 45, 36, ""));

        assertThat(fabricationRepository.existsByNumeroLot("20260825-001")).isTrue();
        assertThat(fabricationRepository.existsByNumeroLot("20260825-002")).isTrue();
        assertThat(fabricationRepository.findAll())
                .extracting(Fabrication::getNumeroLot)
                .doesNotHaveDuplicates();
    }

    @Test
    void listReturnsSummaryDtosNewestFirstWithoutCredentials() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);
        createFabrication(session, validRequest(
                recette.getId(), "2026-08-24T08:00:00", 500, 50, 40, ""));
        createFabrication(session, validRequest(
                recette.getId(), "2026-08-25T12:00:00", 450, 45, 36, ""));

        mockMvc.perform(get("/api/fabrications").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].dateHeureDebut").value("2026-08-25T12:00:00"))
                .andExpect(jsonPath("$[0].recetteNom").value("Tomme traditionnelle"))
                .andExpect(jsonPath("$[0].fromageNom").value("Tomme des Hauts"))
                .andExpect(jsonPath("$[0].operateurNom").value("Gilles Payet"))
                .andExpect(jsonPath("$[0].quantiteLait").value(450))
                .andExpect(jsonPath("$[0].poidsTotalFromages").value(45))
                .andExpect(jsonPath("$[0].nombreFromages").value(36))
                .andExpect(jsonPath("$[0].credentialHash").doesNotExist());
    }

    @Test
    void fabricationRoleCanReadFabricationsAndRecipes() throws Exception {
        MockHttpSession session = authenticatedSession("jean-hugues", FABRICATION_PIN);

        mockMvc.perform(get("/api/fabrications").session(session))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/recettes").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(recette.getId()));
    }

    @Test
    void recipeListReturnsDatabaseOptionsAndRejectsVente() throws Exception {
        MockHttpSession ownerSession = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(get("/api/recettes").session(ownerSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(recette.getId()))
                .andExpect(jsonPath("$[0].nom").value("Tomme traditionnelle"))
                .andExpect(jsonPath("$[0].fromageNom").value("Tomme des Hauts"));

        MockHttpSession venteSession = authenticatedSession("nathalie", VENTE_PIN);
        mockMvc.perform(get("/api/recettes").session(venteSession))
                .andExpect(status().isForbidden());
    }

    @Test
    void singleVariantUsesItsLatestActiveVersion() throws Exception {
        String variante = recette.getVarianteKey();
        recette.setActive(false);
        recetteRepository.saveAndFlush(recette);
        Recette latest = saveRecipe("Tomme traditionnelle révisée", variante, 2, true);
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications")
                        .session(session)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validSelectionRequest(
                                fromage.getId(), null, "2026-08-26T08:00:00", 500, 50, 40)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.recetteId").value(latest.getId()));
    }

    @Test
    void multipleVariantsExposeOnlyActiveChoicesAndResolveRequestedVariant() throws Exception {
        Recette herbs = saveRecipe("Aux herbes", "HERBES", 1, true);
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(get("/api/fromages/{fromageId}/recettes/variantes", fromage.getId())
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].variante").value("HERBES"))
                .andExpect(jsonPath("$[0].libelle").value("Aux herbes"));

        mockMvc.perform(post("/api/fabrications")
                        .session(session)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validSelectionRequest(
                                fromage.getId(), "HERBES", "2026-08-26T09:00:00", 500, 50, 40)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.recetteId").value(herbs.getId()));
    }

    @Test
    void historicalRecipeIdCanNeverForceAnOldVersionForNewFabrication() throws Exception {
        Recette oldVersion = recette;
        String variante = oldVersion.getVarianteKey();
        oldVersion.setActive(false);
        recetteRepository.saveAndFlush(oldVersion);
        Recette latest = saveRecipe("Tomme traditionnelle révisée", variante, 2, true);
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications")
                        .session(session)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(oldVersion.getId(), "2026-08-26T10:00:00", 500, 50, 40, "")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.recetteId").value(latest.getId()));
    }

    @Test
    void existingFabricationKeepsItsHistoricalRecipeAfterNewVersion() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);
        Long fabricationId = createFabrication(session, validRequest(
                recette.getId(), "2026-08-26T11:00:00", 500, 50, 40, ""));
        Long historicalRecipeId = recette.getId();
        String variante = recette.getVarianteKey();

        recette.setActive(false);
        recetteRepository.saveAndFlush(recette);
        saveRecipe("Tomme traditionnelle révisée", variante, 2, true);

        Fabrication existing = fabricationRepository.findByIdWithDetails(fabricationId).orElseThrow();
        assertThat(existing.getRecette().getId()).isEqualTo(historicalRecipeId);
    }

    @Test
    void unknownVariantReturnsNotFound() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications")
                        .session(session)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validSelectionRequest(
                                fromage.getId(), "INCONNUE", "2026-08-26T12:00:00", 500, 50, 40)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value(
                        "Variante introuvable pour le fromage " + fromage.getId() + " : INCONNUE"));
    }

    @Test
    void variantWithoutActiveVersionReturnsClearBusinessError() throws Exception {
        recette.setActive(false);
        recetteRepository.saveAndFlush(recette);
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications")
                        .session(session)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validSelectionRequest(
                                fromage.getId(), recette.getVarianteKey(), "2026-08-26T13:00:00", 500, 50, 40)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Aucune version active n'existe pour la variante " + recette.getVarianteKey()));
    }

    @Test
    void unknownCheeseReturnsNotFound() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications")
                        .session(session)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validSelectionRequest(
                                999999L, null, "2026-08-26T14:00:00", 500, 50, 40)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Fromage introuvable avec l'id : 999999"));
    }

    @Test
    void multipleActiveVersionsForVariantReturnConflict() throws Exception {
        saveRecipe("Tomme incohérente", recette.getVarianteKey(), 2, true);
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications")
                        .session(session)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validSelectionRequest(
                                fromage.getId(), recette.getVarianteKey(), "2026-08-26T15:00:00", 500, 50, 40)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(
                        "Plusieurs versions actives existent pour la variante " + recette.getVarianteKey()));
    }

    @Test
    void detailReturnsCompleteDtoAndUnknownIdReturnsNotFound() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);
        Long id = createFabrication(session, validRequest(
                recette.getId(), "2026-08-25T08:00:00", 500, 50, 40, ""));

        mockMvc.perform(get("/api/fabrications/{id}", id).session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.quantiteLait").value(500))
                .andExpect(jsonPath("$.origineLait").value("TRAITE_MATIN"))
                .andExpect(jsonPath("$.typePresure").value("Présure animale"))
                .andExpect(jsonPath("$.credentialHash").doesNotExist());

        mockMvc.perform(get("/api/fabrications/{id}", 999999).session(session))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void updateChangesAllowedValuesRecalculatesYieldAndPreservesLotAndOperator() throws Exception {
        MockHttpSession ownerSession = authenticatedSession("gilles", OWNER_PASSWORD);
        Long id = createFabrication(ownerSession, validRequest(
                recette.getId(), "2026-08-25T08:00:00", 500, 50, 40, ""));
        String originalLot = fabricationRepository.findById(id).orElseThrow().getNumeroLot();
        MockHttpSession fabricationSession = authenticatedSession("jean-hugues", FABRICATION_PIN);

        String ignoredProtectedFields = """
                ,"numeroLot":"LOT-FALSIFIE","operateurId":%d
                """.formatted(fabricationUser.getId());

        mockMvc.perform(put("/api/fabrications/{id}", id)
                        .session(fabricationSession)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(
                                recette.getId(),
                                "2026-08-26T10:15:00",
                                400,
                                60,
                                35,
                                ignoredProtectedFields)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dateHeureDebut").value("2026-08-26T10:15:00"))
                .andExpect(jsonPath("$.quantiteLait").value(400))
                .andExpect(jsonPath("$.poidsTotalFromages").value(60))
                .andExpect(jsonPath("$.rendement").value(15.0))
                .andExpect(jsonPath("$.numeroLot").value(originalLot))
                .andExpect(jsonPath("$.operateurId").value(proprietaire.getId()));

        Fabrication updated = fabricationRepository.findByIdWithDetails(id).orElseThrow();
        assertThat(updated.getNumeroLot()).isEqualTo(originalLot);
        assertThat(updated.getOperateur().getId()).isEqualTo(proprietaire.getId());
        assertThat(updated.getRendement()).isEqualByComparingTo("15.00");
    }

    @Test
    void updateUnknownFabricationReturnsNotFound() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(put("/api/fabrications/{id}", 999999)
                        .session(session)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 30, 24, "")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Fabrication introuvable avec l'id : 999999"));
    }

    private Long createFabricationAsOwner() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);
        return createFabrication(session, validRequest(
                recette.getId(), "2026-08-25T08:00:00", 500, 50, 40, ""));
    }

    private Long createFabrication(MockHttpSession session, String content) throws Exception {
        mockMvc.perform(post("/api/fabrications")
                        .session(session)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(content))
                .andExpect(status().isCreated());

        return fabricationRepository.findAll().stream()
                .max((left, right) -> Long.compare(left.getId(), right.getId()))
                .orElseThrow()
                .getId();
    }

    private MockHttpSession authenticatedSession(String username, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"%s","password":"%s"}
                                """.formatted(username, password)))
                .andExpect(status().isOk())
                .andReturn();
        return (MockHttpSession) result.getRequest().getSession(false);
    }

    private LotLait createMilkLot(String number, int quantity) {
        return createMilkLot(number, BigDecimal.valueOf(quantity));
    }

    private void addRennetIngredient(String quantity, UniteMesure unit) {
        MatierePremiere material = new MatierePremiere();
        material.setNom("Présure animale");
        material.setUniteReference(unit);
        material.setCoutUnitaire(new BigDecimal("0.2000"));
        material.setActif(true);
        material = matierePremiereRepository.saveAndFlush(material);

        RecetteIngredient ingredient = new RecetteIngredient();
        ingredient.setMatierePremiere(material);
        ingredient.setQuantite(new BigDecimal(quantity));
        ingredient.setUnite(unit);
        ingredient.setCoutUnitaireReference(material.getCoutUnitaire());
        recette.addIngredient(ingredient);
        recetteIngredientRepository.saveAndFlush(ingredient);
    }

    private void addAlternativeRennet() {
        MatierePremiere material = new MatierePremiere();
        material.setNom("Présure microbienne");
        material.setUniteReference(UniteMesure.ML);
        material.setCoutUnitaire(new BigDecimal("0.3000"));
        material.setActif(true);
        matierePremiereRepository.saveAndFlush(material);
    }

    private RecetteIngredient addFermentIngredient(String quantity, UniteMesure unit) {
        MatierePremiere material = new MatierePremiere();
        material.setNom("Ferment lactique");
        material.setUniteReference(unit);
        material.setCoutUnitaire(new BigDecimal("1.0000"));
        material.setActif(true);
        material = matierePremiereRepository.saveAndFlush(material);

        RecetteIngredient ingredient = new RecetteIngredient();
        ingredient.setMatierePremiere(material);
        ingredient.setQuantite(new BigDecimal(quantity));
        ingredient.setUnite(unit);
        ingredient.setCoutUnitaireReference(material.getCoutUnitaire());
        recette.addIngredient(ingredient);
        return recetteIngredientRepository.saveAndFlush(ingredient);
    }

    private void addAlternativeFerment(String name, UniteMesure unit) {
        MatierePremiere material = new MatierePremiere();
        material.setNom(name);
        material.setUniteReference(unit);
        material.setCoutUnitaire(new BigDecimal("1.0000"));
        material.setActif(true);
        matierePremiereRepository.saveAndFlush(material);
    }

    private LotLait createMilkLot(String number, BigDecimal quantity) {
        LotLait lot = new LotLait();
        lot.setNumeroLot(number);
        lot.setDateTraite(LocalDateTime.of(2026, 8, 25, 6, 0));
        lot.setTypeTraite(TypeTraite.MATIN);
        lot.setQuantite(quantity);
        return lotLaitRepository.saveAndFlush(lot);
    }

    private void createWithSingleUsage(MockHttpSession session, String date, LotLait lot, String quantity)
            throws Exception {
        String coherentWeight = new BigDecimal(quantity).multiply(new BigDecimal("0.10")).toPlainString();
        String usage = ",\"lotsLait\":[{\"lotLaitId\":" + lot.getId()
                + ",\"quantiteUtilisee\":" + quantity + "}],\"nombreFromagesFaibleConfirme\":true,"
                + "\"rendementAnormalConfirme\":true,\"poidsTotalFromages\":" + coherentWeight;
        mockMvc.perform(post("/api/fabrications").session(session).with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), date, 1, 1, 1, usage)))
                .andExpect(status().isCreated());
    }

    private boolean replaceAfterSignal(CountDownLatch start, Long fabricationId, Long lotId, String quantity)
            throws Exception {
        start.await();
        try {
            utilisationLotLaitService.replace(fabricationId,
                    List.of(new UtilisationRequest(lotId, new BigDecimal(quantity))));
            return true;
        } catch (BusinessValidationException expected) {
            return false;
        }
    }

    private Recette saveRecipe(
            String name,
            String variante,
            int version,
            boolean active) {
        Recette versionedRecipe = new Recette(name);
        versionedRecipe.setFromage(fromage);
        versionedRecipe.setVarianteKey(variante);
        versionedRecipe.setNumeroVersion(version);
        versionedRecipe.setActive(active);
        return recetteRepository.saveAndFlush(versionedRecipe);
    }

    private String validSelectionRequest(
            Long fromageId,
            String variante,
            String dateHeureDebut,
            int quantiteLait,
            int poidsTotalFromages,
            int nombreFromages) {
        String selection = variante == null
                ? "\"fromageId\":" + fromageId
                : "\"fromageId\":" + fromageId + ",\"variante\":\"" + variante + "\"";
        return validRequestWithSelection(
                selection, dateHeureDebut, quantiteLait, poidsTotalFromages, nombreFromages, "");
    }

    private String validRequest(
            Long recetteId,
            String dateHeureDebut,
            int quantiteLait,
            int poidsTotalFromages,
            int nombreFromages,
            String extraFields) {
        return validRequestWithSelection(
                "\"recetteId\":" + recetteId,
                dateHeureDebut,
                quantiteLait,
                poidsTotalFromages,
                nombreFromages,
                extraFields);
    }

    private String validRequestWithSelection(
            String selection,
            String dateHeureDebut,
            int quantiteLait,
            int poidsTotalFromages,
            int nombreFromages,
            String extraFields) {
        return """
                {
                  "dateHeureDebut":"%s",
                  %s,
                  "quantiteLait":%d,
                  "lotsLait":[{"lotLaitId":%d,"quantiteUtilisee":%d}],
                  "temperatureLait":34.5,
                  "origineLait":"TRAITE_MATIN",
                  "temperatureChauffage":38.0,
                  "dureeChauffageMinutes":45,
                  "typePresure":"Présure animale",
                  "quantitePresure":12.5,
                  "typeFerments":"Ferments thermophiles",
                  "quantiteFerments":8.0,
                  "temperatureMiseEnMoule":31.0,
                  "dureeEgouttageMinutes":720,
                  "poidsTotalFromages":%d,
                  "nombreFromages":%d,
                  "observations":"Fabrication test"
                  %s
                }
                """.formatted(
                dateHeureDebut,
                selection,
                quantiteLait,
                defaultMilkLot.getId(),
                quantiteLait,
                poidsTotalFromages,
                nombreFromages,
                extraFields);
    }
}
