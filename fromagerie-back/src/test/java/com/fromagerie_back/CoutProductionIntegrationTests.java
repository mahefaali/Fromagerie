package com.fromagerie_back;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.http.MediaType.APPLICATION_JSON;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import com.fromagerie_back.model.Equipement;
import com.fromagerie_back.model.RegleAmortissement;
import com.fromagerie_back.model.RegleCoutEnergie;
import com.fromagerie_back.model.TypeOperationEnergie;
import com.fromagerie_back.model.UniteCalculEnergie;
import com.fromagerie_back.repository.EquipementRepository;
import com.fromagerie_back.repository.RegleAmortissementRepository;
import com.fromagerie_back.repository.RegleCoutEnergieRepository;

@SpringBootTest
@AutoConfigureMockMvc
class CoutProductionIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EquipementRepository equipementRepository;

    @Autowired
    private RegleAmortissementRepository regleAmortissementRepository;

    @Autowired
    private RegleCoutEnergieRepository regleCoutEnergieRepository;

    @BeforeEach
    void setUp() {
        regleAmortissementRepository.deleteAll();
        equipementRepository.deleteAll();
        regleCoutEnergieRepository.deleteAll();
    }

    @Test
    void energyRulesCannotOverlapForTheSameOperationWithDifferentUnits() throws Exception {
        RegleCoutEnergie existing = new RegleCoutEnergie();
        existing.setTypeOperation(TypeOperationEnergie.CHAUFFE);
        existing.setUniteCalcul(UniteCalculEnergie.PAR_HEURE);
        existing.setCoutStandard(new BigDecimal("0.1000"));
        existing.setDateDebutValidite(LocalDate.of(2026, 7, 1));
        existing.setActif(true);
        regleCoutEnergieRepository.saveAndFlush(existing);

        mockMvc.perform(post("/api/configuration/couts/energie")
                        .with(user("owner").roles("PROPRIETAIRE"))
                        .with(csrf())
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "typeOperation": "CHAUFFE",
                                  "coutStandard": 0.05,
                                  "uniteCalcul": "PAR_FABRICATION",
                                  "dateDebutValidite": "2026-06-01",
                                  "dateFinValidite": "2026-07-31",
                                  "actif": true
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message")
                        .value("La règle énergie chevauche une période existante pour ce type d'opération"));
    }

    @Test
    void ownerCanReadAmortissementWithItsEquipmentAfterRepositorySessionCloses() throws Exception {
        Equipement equipement = new Equipement();
        equipement.setNom("Cuve de test");
        equipement.setActif(true);
        equipement = equipementRepository.saveAndFlush(equipement);

        RegleAmortissement regle = new RegleAmortissement();
        regle.setEquipement(equipement);
        regle.setCoutParFabrication(new BigDecimal("4.5000"));
        regle.setDateDebutValidite(LocalDate.of(2026, 1, 1));
        regle.setActif(true);
        regleAmortissementRepository.saveAndFlush(regle);

        mockMvc.perform(get("/api/configuration/couts/amortissements")
                        .with(user("owner").roles("PROPRIETAIRE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].equipementNom").value("Cuve de test"))
                .andExpect(jsonPath("$[0].coutParFabrication").value(4.5));
    }

    @Test
    void profitabilityApisAreRestrictedToOwner() throws Exception {
        mockMvc.perform(get("/api/couts-production/lots").with(user("owner").roles("PROPRIETAIRE")))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/couts-production/lots").with(user("worker").roles("FABRICATION")))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/rentabilite/analyse")
                        .param("dateDebut", "1900-01-01")
                        .param("dateFin", "1900-01-31")
                        .with(user("owner").roles("PROPRIETAIRE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.synthese.chiffreAffaires").value(0));
        mockMvc.perform(get("/api/rentabilite/analyse")
                        .param("dateDebut", "1900-01-01")
                        .param("dateFin", "1900-01-31")
                        .with(user("seller").roles("VENTE")))
                .andExpect(status().isForbidden());
    }
}
