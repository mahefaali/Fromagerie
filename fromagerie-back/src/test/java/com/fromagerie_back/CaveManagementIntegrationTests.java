package com.fromagerie_back;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fromagerie_back.model.Cave;
import com.fromagerie_back.repository.CaveRepository;

@SpringBootTest
@AutoConfigureMockMvc
class CaveManagementIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CaveRepository caveRepository;

    @BeforeEach
    void setUp() {
        caveRepository.deleteAll();
    }

    @Test
    void ownerCreatesAndReadsCompleteOrderedStructureWithCalculatedCapacity() throws Exception {
        mockMvc.perform(post("/api/caves")
                        .with(user("owner").roles("PROPRIETAIRE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nom").value("Cave principale"))
                .andExpect(jsonPath("$.capaciteTotale").value(15))
                .andExpect(jsonPath("$.etageres[0].numero").value(1))
                .andExpect(jsonPath("$.etageres[0].rangees[0].numero").value(1))
                .andExpect(jsonPath("$.etageres[1].numero").value(2));

        Cave cave = caveRepository.findAll().getFirst();
        mockMvc.perform(get("/api/caves/{id}", cave.getId())
                        .with(user("employee").roles("FABRICATION")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.etageres.length()").value(2))
                .andExpect(jsonPath("$.etageres[0].rangees.length()").value(2))
                .andExpect(jsonPath("$.capaciteTotale").value(15));
    }

    @Test
    void ownerReplacesPhysicalStructureOnUpdate() throws Exception {
        createCave();
        Cave cave = caveRepository.findAll().getFirst();
        String update = """
                {"nom":"Cave rénovée","description":"","temperature":10.5,"humidite":88,
                 "ageMinJours":3,"ageMaxJours":60,"active":false,
                 "etageres":[{"numero":3,"ordre":1,"rangees":[
                   {"numero":1,"ordre":1,"capacite":12}]}]}
                """;

        mockMvc.perform(put("/api/caves/{id}", cave.getId())
                        .with(user("owner").roles("PROPRIETAIRE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(update))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Cave rénovée"))
                .andExpect(jsonPath("$.active").value(false))
                .andExpect(jsonPath("$.capaciteTotale").value(12))
                .andExpect(jsonPath("$.etageres.length()").value(1));
    }

    @Test
    void rejectsInvalidCapacityHumidityAndAgeRange() throws Exception {
        assertBadRequest(validJson().replace("\"capacite\":4", "\"capacite\":0"));
        assertBadRequest(validJson().replace("\"humidite\":90", "\"humidite\":101"));
        assertBadRequest(validJson().replace("\"ageMaxJours\":45", "\"ageMaxJours\":2"));
    }

    @Test
    void rejectsDuplicateShelfAndRowNumbers() throws Exception {
        String duplicateShelf = validJson().replace("\"numero\":2,\"ordre\":2,\"rangees\"",
                "\"numero\":1,\"ordre\":2,\"rangees\"");
        assertConflict(duplicateShelf);

        String duplicateRow = validJson().replace("\"numero\":2,\"ordre\":2,\"capacite\":6",
                "\"numero\":1,\"ordre\":2,\"capacite\":6");
        assertConflict(duplicateRow);
    }

    @Test
    void missingCaveReturns404AndOnlyOwnerCanWrite() throws Exception {
        mockMvc.perform(get("/api/caves/999999")
                        .with(user("employee").roles("FABRICATION")))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/caves")
                        .with(user("employee").roles("FABRICATION"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validJson()))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/caves/999999")
                        .with(user("employee").roles("FABRICATION"))
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    private void createCave() throws Exception {
        mockMvc.perform(post("/api/caves")
                        .with(user("owner").roles("PROPRIETAIRE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validJson()))
                .andExpect(status().isCreated());
    }

    private void assertBadRequest(String body) throws Exception {
        mockMvc.perform(post("/api/caves")
                        .with(user("owner").roles("PROPRIETAIRE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    private void assertConflict(String body) throws Exception {
        mockMvc.perform(post("/api/caves")
                        .with(user("owner").roles("PROPRIETAIRE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict());
    }

    private String validJson() {
        return """
                {"nom":"Cave principale","description":"Pierre","temperature":11.5,"humidite":90,
                 "ageMinJours":2,"ageMaxJours":45,"active":true,
                 "etageres":[
                   {"numero":2,"ordre":2,"rangees":[{"numero":1,"ordre":1,"capacite":5}]},
                   {"numero":1,"ordre":1,"rangees":[
                     {"numero":2,"ordre":2,"capacite":6},
                     {"numero":1,"ordre":1,"capacite":4}]}
                 ]}
                """;
    }
}
