package com.fromagerie_back;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import com.fromagerie_back.repository.EquipementRepository;
import com.fromagerie_back.repository.RegleAmortissementRepository;

@SpringBootTest
@AutoConfigureMockMvc
class CoutProductionIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EquipementRepository equipementRepository;

    @Autowired
    private RegleAmortissementRepository regleAmortissementRepository;

    @BeforeEach
    void setUp() {
        regleAmortissementRepository.deleteAll();
        equipementRepository.deleteAll();
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
}
