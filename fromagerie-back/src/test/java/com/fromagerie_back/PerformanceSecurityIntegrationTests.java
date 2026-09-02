package com.fromagerie_back;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class PerformanceSecurityIntegrationTests {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void proprietairePeutConsulterLeDashboardAvecUnePeriodeVide() throws Exception {
        mockMvc.perform(get("/api/performances/dashboard")
                        .param("dateDebut", "2040-01-01")
                        .param("dateFin", "2040-01-31")
                        .with(user("owner").roles("PROPRIETAIRE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.periode.dateDebut").value("2040-01-01"))
                .andExpect(jsonPath("$.rendementMoyen.valeur").doesNotExist())
                .andExpect(jsonPath("$.evolutionCouts").isEmpty());
    }

    @Test
    void fabricationEtVenteNePeuventPasConsulterLeDashboardStrategique() throws Exception {
        mockMvc.perform(get("/api/performances/dashboard")
                        .with(user("fabrication").roles("FABRICATION")))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/performances/dashboard")
                        .with(user("vente").roles("VENTE")))
                .andExpect(status().isForbidden());
    }
}
