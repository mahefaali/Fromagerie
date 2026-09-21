package com.fromagerie_back;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:documents-security;DB_CLOSE_DELAY=-1","spring.datasource.driver-class-name=org.h2.Driver","spring.jpa.hibernate.ddl-auto=create-drop","spring.profiles.active=test"})
@AutoConfigureMockMvc
class DocumentReglementaireSecurityTests {
    @Autowired MockMvc mvc;
    @Test void endpointNonAuthentifieEstRefuse() throws Exception { mvc.perform(get("/api/documents/fabrications/1")).andExpect(status().isUnauthorized()); }
    @Test void roleFabricationEstRefuse() throws Exception { mvc.perform(get("/api/documents/fabrications/1").with(user("fabrication").roles("FABRICATION"))).andExpect(status().isForbidden()); }
}
