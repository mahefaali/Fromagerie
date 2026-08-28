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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fromagerie_back.model.Fabrication;
import com.fromagerie_back.model.Fromage;
import com.fromagerie_back.model.Recette;
import com.fromagerie_back.model.Role;
import com.fromagerie_back.model.Utilisateur;
import com.fromagerie_back.repository.FabricationRepository;
import com.fromagerie_back.repository.FromageRepository;
import com.fromagerie_back.repository.RecetteRepository;
import com.fromagerie_back.repository.UtilisateurRepository;
import com.fromagerie_back.service.UtilisateurService;

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

    private Utilisateur proprietaire;
    private Utilisateur fabricationUser;
    private Fromage fromage;
    private Recette recette;

    @BeforeEach
    void setUp() {
        fabricationRepository.deleteAll();
        recetteRepository.deleteAll();
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
    void absurdTemperatureReturnsBadRequest() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications")
                        .session(session)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(
                                recette.getId(), "2026-08-25T09:00:00", 300, 30, 24,
                                ",\"temperatureLait\":999")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.temperatureLait").exists());
    }

    @Test
    void cheeseWeightCannotExceedMilkQuantity() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", OWNER_PASSWORD);

        mockMvc.perform(post("/api/fabrications")
                        .session(session)
                        .with(csrf().asHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validRequest(recette.getId(), "2026-08-25T09:00:00", 300, 301, 24, "")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Le poids total des fromages ne peut pas dépasser la quantité de lait."));
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
                poidsTotalFromages,
                nombreFromages,
                extraFields);
    }
}
