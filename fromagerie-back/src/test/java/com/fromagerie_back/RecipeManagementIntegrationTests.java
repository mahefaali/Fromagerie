package com.fromagerie_back;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fromagerie_back.model.Fabrication;
import com.fromagerie_back.model.Fromage;
import com.fromagerie_back.model.MatierePremiere;
import com.fromagerie_back.model.OrigineLait;
import com.fromagerie_back.model.Recette;
import com.fromagerie_back.model.UniteMesure;
import com.fromagerie_back.dto.RecetteIngredientRequest;
import com.fromagerie_back.dto.RecetteVersionRequest;
import com.fromagerie_back.exception.BusinessConflictException;
import com.fromagerie_back.repository.FabricationRepository;
import com.fromagerie_back.repository.FromageRepository;
import com.fromagerie_back.repository.MatierePremiereRepository;
import com.fromagerie_back.repository.RecetteRepository;
import com.fromagerie_back.service.RecetteService;

@SpringBootTest
@AutoConfigureMockMvc
class RecipeManagementIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private FabricationRepository fabricationRepository;

    @Autowired
    private RecetteRepository recetteRepository;

    @Autowired
    private MatierePremiereRepository matierePremiereRepository;

    @Autowired
    private FromageRepository fromageRepository;

    @Autowired
    private RecetteService recetteService;

    private Fromage cheese;

    @BeforeEach
    void setUp() {
        fabricationRepository.deleteAll();
        recetteRepository.deleteAll();
        matierePremiereRepository.deleteAll();
        fromageRepository.deleteAll();
        cheese = fromageRepository.save(new Fromage(null, "Fromage des Hauts", "Fromage test"));
    }

    @Test
    void ownerCreatesAndUpdatesMaterialWhileOperationalUserCanOnlyRead() throws Exception {
        String body = materialJson("Lait", "L", "0.7000", true);

        mockMvc.perform(post("/api/matieres-premieres")
                        .with(user("owner").roles("PROPRIETAIRE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nom").value("Lait"))
                .andExpect(jsonPath("$.uniteReference").value("L"))
                .andExpect(jsonPath("$.coutUnitaire").value(0.7))
                .andExpect(jsonPath("$.actif").value(true));

        MatierePremiere milk = matierePremiereRepository.findAll().getFirst();
        mockMvc.perform(put("/api/matieres-premieres/{id}", milk.getId())
                        .with(user("owner").roles("PROPRIETAIRE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(materialJson("Lait entier", "L", "0.8000", false)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.coutUnitaire").value(0.8))
                .andExpect(jsonPath("$.actif").value(false));

        mockMvc.perform(get("/api/matieres-premieres")
                        .with(user("employee").roles("FABRICATION")))
                .andExpect(status().isOk());
        mockMvc.perform(put("/api/matieres-premieres/{id}", milk.getId())
                        .with(user("employee").roles("FABRICATION"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    void createsVersionOneWithIngredientsAndBackendCalculatedCost() throws Exception {
        MatierePremiere milk = material("Lait", UniteMesure.L, "0.70", true);
        MatierePremiere salt = material("Sel", UniteMesure.KG, "1.50", true);

        mockMvc.perform(post("/api/recettes")
                        .with(user("owner").roles("PROPRIETAIRE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(recipeJson("Classique", cheese.getId(),
                                ingredientJson(milk.getId(), "100", "L"),
                                ingredientJson(salt.getId(), "2", "KG"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nom").value("Classique"))
                .andExpect(jsonPath("$.varianteKey").value("legacy-" + cheese.getId()))
                .andExpect(jsonPath("$.fromageId").value(cheese.getId()))
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.active").value(true))
                .andExpect(jsonPath("$.quantiteLaitReference").value(100))
                .andExpect(jsonPath("$.ingredients.length()").value(2))
                .andExpect(jsonPath("$.ingredients[0].coutUnitaireReference").value(0.7))
                .andExpect(jsonPath("$.coutMatiereEstime").value(73));
    }

    @Test
    void rejectsInvalidIngredientReferencesDuplicatesUnitsAndInactiveMaterials() throws Exception {
        MatierePremiere milk = material("Lait", UniteMesure.L, "0.70", true);
        MatierePremiere inactive = material("Ferment inactif", UniteMesure.G, "2", false);

        assertRecipeError(
                recipeJson("Négative", cheese.getId(), ingredientJson(milk.getId(), "-1", "L")), 400);
        assertRecipeError(
                recipeJson("Matière inconnue", cheese.getId(), ingredientJson(999999L, "1", "L")), 404);
        assertRecipeError(
                recipeJson("Fromage inconnu", 999999L, ingredientJson(milk.getId(), "1", "L")), 404);
        assertRecipeError(
                recipeJson("Doublon", cheese.getId(),
                        ingredientJson(milk.getId(), "1", "L"),
                        ingredientJson(milk.getId(), "2", "L")), 400);
        assertRecipeError(
                recipeJson("Unité incompatible", cheese.getId(), ingredientJson(milk.getId(), "1", "ML")), 400);
        assertRecipeError(
                recipeJson("Inactive", cheese.getId(), ingredientJson(inactive.getId(), "1", "G")), 400);
    }

    @Test
    void versioningPreservesOldIngredientsCostAndHistoricalFabrication() throws Exception {
        MatierePremiere milk = material("Lait", UniteMesure.L, "1.00", true);
        createRecipe("Classique", ingredientJson(milk.getId(), "10", "L"));
        Recette versionOne = recetteRepository.findForList(cheese.getId(), true, "Classique").getFirst();
        Fabrication historicalBatch = fabrication("HISTORIQUE", versionOne);

        mockMvc.perform(put("/api/matieres-premieres/{id}", milk.getId())
                        .with(user("owner").roles("PROPRIETAIRE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(materialJson("Lait", "L", "2.00", true)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/recettes/{id}/versions", versionOne.getId())
                        .with(user("owner").roles("PROPRIETAIRE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(versionJson("Classique", ingredientJson(milk.getId(), "10", "L"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.version").value(2))
                .andExpect(jsonPath("$.active").value(true))
                .andExpect(jsonPath("$.quantiteLaitReference").value(100))
                .andExpect(jsonPath("$.coutMatiereEstime").value(20));

        mockMvc.perform(get("/api/recettes/{id}", versionOne.getId())
                        .with(user("employee").roles("FABRICATION")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.active").value(false))
                .andExpect(jsonPath("$.coutMatiereEstime").value(10))
                .andExpect(jsonPath("$.ingredients[0].quantite").value(10))
                .andExpect(jsonPath("$.ingredients[0].coutUnitaireReference").value(1));

        mockMvc.perform(get("/api/recettes/{id}/historique", versionOne.getId())
                        .with(user("owner").roles("PROPRIETAIRE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].version").value(1))
                .andExpect(jsonPath("$[0].active").value(false))
                .andExpect(jsonPath("$[1].version").value(2))
                .andExpect(jsonPath("$[1].active").value(true));

        mockMvc.perform(get("/api/recettes")
                        .with(user("employee").roles("FABRICATION")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].version").value(2));
        mockMvc.perform(get("/api/recettes")
                        .param("active", "false")
                        .param("fromageId", cheese.getId().toString())
                        .param("nom", "class")
                        .with(user("owner").roles("PROPRIETAIRE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(versionOne.getId()));

        assertThat(fabricationRepository.findById(historicalBatch.getId()).orElseThrow()
                .getRecette().getId()).isEqualTo(versionOne.getId());

        mockMvc.perform(post("/api/recettes/{id}/versions", versionOne.getId())
                        .with(user("owner").roles("PROPRIETAIRE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(versionJson("Classique", ingredientJson(milk.getId(), "10", "L"))))
                .andExpect(status().isConflict());
    }

    @Test
    void variantsAndTheirVersionHistoriesRemainIndependent() throws Exception {
        MatierePremiere milk = material("Lait", UniteMesure.L, "1", true);
        MatierePremiere herbs = material("Herbes", UniteMesure.G, "3", true);
        createRecipe("Classique", ingredientJson(milk.getId(), "10", "L"));
        createRecipe("Aux herbes",
                ingredientJson(milk.getId(), "10", "L"),
                ingredientJson(herbs.getId(), "2", "G"));

        List<Recette> activeRecipes = recetteRepository.findForList(cheese.getId(), true, null);
        assertThat(activeRecipes).extracting(Recette::getNom).containsExactly("Aux herbes", "Classique");
        Recette classic = activeRecipes.stream().filter(recipe -> recipe.getNom().equals("Classique")).findFirst().orElseThrow();
        Recette herbRecipe = activeRecipes.stream().filter(recipe -> recipe.getNom().equals("Aux herbes")).findFirst().orElseThrow();
        assertThat(classic.getVarianteKey()).startsWith("legacy-");
        assertThat(herbRecipe.getVarianteKey()).doesNotStartWith("legacy-");

        mockMvc.perform(post("/api/recettes/{id}/versions", classic.getId())
                        .with(user("owner").roles("PROPRIETAIRE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(versionJson("Classique", ingredientJson(milk.getId(), "11", "L"))))
                .andExpect(status().isCreated());

        assertThat(recetteRepository.findHistory(classic.getVarianteKey())).hasSize(2);
        assertThat(recetteRepository.findHistory(herbRecipe.getVarianteKey())).hasSize(1);
    }

    @Test
    void rejectsASecondBaseRecipeForTheSameCheese() throws Exception {
        MatierePremiere milk = material("Lait", UniteMesure.L, "1", true);
        createRecipe("Classique", ingredientJson(milk.getId(), "10", "L"));

        mockMvc.perform(post("/api/recettes")
                        .with(user("owner").roles("PROPRIETAIRE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(recipeJson("Autre base", cheese.getId(),
                                ingredientJson(milk.getId(), "12", "L"))))
                .andExpect(status().isConflict());
    }

    @Test
    void recipePermissionsEnforceOwnerWritesFabricationReadsAndRejectSalesAndAnonymous() throws Exception {
        MatierePremiere milk = material("Lait", UniteMesure.L, "1", true);
        String recipe = recipeJson("Classique", cheese.getId(), ingredientJson(milk.getId(), "10", "L"));

        mockMvc.perform(post("/api/recettes")
                        .with(user("employee").roles("FABRICATION"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(recipe))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/recettes")
                        .with(user("sales").roles("VENTE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(recipe))
                .andExpect(status().isForbidden());
        createRecipe("Classique", ingredientJson(milk.getId(), "10", "L"));
        Recette activeRecipe = recetteRepository.findForList(cheese.getId(), true, null).getFirst();
        mockMvc.perform(post("/api/recettes/{id}/versions", activeRecipe.getId())
                        .with(user("employee").roles("FABRICATION"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(versionJson("Classique", ingredientJson(milk.getId(), "11", "L"))))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/recettes").with(user("employee").roles("FABRICATION")))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/recettes").with(user("sales").roles("VENTE")))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/recettes"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void concurrentVersionRequestsProduceOnlyOneNextVersion() throws Exception {
        MatierePremiere milk = material("Lait", UniteMesure.L, "1", true);
        createRecipe("Classique", ingredientJson(milk.getId(), "10", "L"));
        Recette source = recetteRepository.findForList(cheese.getId(), true, null).getFirst();
        RecetteVersionRequest request = versionRequest(milk.getId());
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);

        try (var executor = Executors.newFixedThreadPool(2)) {
            var task = (java.util.concurrent.Callable<String>) () -> {
                ready.countDown();
                start.await(5, TimeUnit.SECONDS);
                try {
                    recetteService.createVersion(source.getId(), request);
                    return "success";
                } catch (BusinessConflictException exception) {
                    return "conflict";
                }
            };
            Future<String> first = executor.submit(task);
            Future<String> second = executor.submit(task);
            assertThat(ready.await(5, TimeUnit.SECONDS)).isTrue();
            start.countDown();

            assertThat(List.of(first.get(10, TimeUnit.SECONDS), second.get(10, TimeUnit.SECONDS)))
                    .containsExactlyInAnyOrder("success", "conflict");
        }

        assertThat(recetteRepository.findHistory(source.getVarianteKey()))
                .extracting(Recette::getNumeroVersion)
                .containsExactly(1, 2);
    }

    @Test
    void changingReferenceUnitOfUsedMaterialIsRejected() throws Exception {
        MatierePremiere milk = material("Lait", UniteMesure.L, "1", true);
        createRecipe("Classique", ingredientJson(milk.getId(), "10", "L"));

        mockMvc.perform(put("/api/matieres-premieres/{id}", milk.getId())
                        .with(user("owner").roles("PROPRIETAIRE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(materialJson("Lait", "ML", "0.001", true)))
                .andExpect(status().isConflict());
    }

    private void assertRecipeError(String body, int expectedStatus) throws Exception {
        mockMvc.perform(post("/api/recettes")
                        .with(user("owner").roles("PROPRIETAIRE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().is(expectedStatus));
    }

    private void createRecipe(String name, String... ingredients) throws Exception {
        mockMvc.perform(post("/api/recettes")
                        .with(user("owner").roles("PROPRIETAIRE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(recipeJson(name, cheese.getId(), "Classique".equals(name), ingredients)))
                .andExpect(status().isCreated());
    }

    private MatierePremiere material(String name, UniteMesure unit, String cost, boolean active) {
        MatierePremiere material = new MatierePremiere();
        material.setNom(name);
        material.setUniteReference(unit);
        material.setCoutUnitaire(new BigDecimal(cost));
        material.setActif(active);
        return matierePremiereRepository.save(material);
    }

    private Fabrication fabrication(String lot, Recette recipe) {
        Fabrication fabrication = new Fabrication();
        fabrication.setNumeroLot(lot);
        fabrication.setDateHeureDebut(LocalDateTime.of(2026, 8, 25, 10, 0));
        fabrication.setRecette(recipe);
        fabrication.setQuantiteLait(new BigDecimal("100"));
        fabrication.setTemperatureLait(new BigDecimal("34"));
        fabrication.setOrigineLait(OrigineLait.TRAITE_MATIN);
        fabrication.setTemperatureChauffage(new BigDecimal("38"));
        fabrication.setDureeChauffageMinutes(45);
        fabrication.setTypePresure("Présure animale");
        fabrication.setQuantitePresure(new BigDecimal("20"));
        fabrication.setTypeFerments("Ferment lactique");
        fabrication.setQuantiteFerments(new BigDecimal("10"));
        fabrication.setTemperatureMiseEnMoule(new BigDecimal("30"));
        fabrication.setDureeEgouttageMinutes(60);
        fabrication.setPoidsTotalFromages(new BigDecimal("10"));
        fabrication.setRendement(new BigDecimal("10"));
        fabrication.setNombreFromages(10);
        return fabricationRepository.save(fabrication);
    }

    private String materialJson(String name, String unit, String cost, boolean active) {
        return """
                {"nom":"%s","uniteReference":"%s","coutUnitaire":%s,"actif":%s}
                """.formatted(name, unit, cost, active);
    }

    private String ingredientJson(Long materialId, String quantity, String unit) {
        return """
                {"matierePremiereId":%d,"quantite":%s,"unite":"%s"}
                """.formatted(materialId, quantity, unit).trim();
    }

    private String recipeJson(String name, Long cheeseId, String... ingredients) {
        return recipeJson(name, cheeseId, true, ingredients);
    }

    private String recipeJson(String name, Long cheeseId, boolean baseRecipe, String... ingredients) {
        return """
                {"nom":"%s","fromageId":%d,"recetteDeBase":%s,"ingredients":[%s]}
                """.formatted(name, cheeseId, baseRecipe, String.join(",", ingredients));
    }

    private String versionJson(String name, String... ingredients) {
        return """
                {"nom":"%s","ingredients":[%s]}
                """.formatted(name, String.join(",", ingredients));
    }

    private RecetteVersionRequest versionRequest(Long materialId) {
        RecetteIngredientRequest ingredient = new RecetteIngredientRequest();
        ingredient.setMatierePremiereId(materialId);
        ingredient.setQuantite(new BigDecimal("11"));
        ingredient.setUnite(UniteMesure.L);
        RecetteVersionRequest request = new RecetteVersionRequest();
        request.setNom("Classique");
        request.setIngredients(List.of(ingredient));
        return request;
    }
}
