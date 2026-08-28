package com.fromagerie_back;

import static com.fromagerie_back.config.DemoAccountSeeder.EMPLOYEE_PIN;
import static com.fromagerie_back.config.DemoAccountSeeder.EMPLOYEE_USERNAME;
import static com.fromagerie_back.config.DemoAccountSeeder.OWNER_PASSWORD;
import static com.fromagerie_back.config.DemoAccountSeeder.OWNER_USERNAME;
import static com.fromagerie_back.config.DemoAccountSeeder.SALES_PIN;
import static com.fromagerie_back.config.DemoAccountSeeder.SALES_USERNAME;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

import com.fromagerie_back.config.DemoAccountSeeder;
import com.fromagerie_back.model.Role;
import com.fromagerie_back.model.Utilisateur;
import com.fromagerie_back.repository.UtilisateurRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class DemoAccountSeederDevTests {

    @Autowired
    private DemoAccountSeeder demoAccountSeeder;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MockMvc mockMvc;

    @BeforeEach
    void restoreDemoAccounts() {
        demoAccountSeeder.seedDemoAccounts();
    }

    @Test
    void demoAccountsExistInDevelopmentWithEncodedCredentials() {
        Utilisateur owner = utilisateurRepository.findByUsername(OWNER_USERNAME).orElseThrow();
        Utilisateur employee = utilisateurRepository.findByUsername(EMPLOYEE_USERNAME).orElseThrow();
        Utilisateur salesEmployee = utilisateurRepository.findByUsername(SALES_USERNAME).orElseThrow();

        assertThat(owner.getNom()).isEqualTo("Gilles Payet Démo");
        assertThat(owner.getRole()).isEqualTo(Role.PROPRIETAIRE);
        assertThat(owner.getCredentialHash()).isNotEqualTo(OWNER_PASSWORD);
        assertThat(passwordEncoder.matches(OWNER_PASSWORD, owner.getCredentialHash())).isTrue();

        assertThat(employee.getNom()).isEqualTo("Jean Lebon Démo");
        assertThat(employee.getRole()).isEqualTo(Role.FABRICATION);
        assertThat(employee.getCredentialHash()).isNotEqualTo(EMPLOYEE_PIN);
        assertThat(passwordEncoder.matches(EMPLOYEE_PIN, employee.getCredentialHash())).isTrue();

        assertThat(salesEmployee.getNom()).isEqualTo("Nathalie Vente Démo");
        assertThat(salesEmployee.getRole()).isEqualTo(Role.VENTE);
        assertThat(salesEmployee.getCredentialHash()).isNotEqualTo(SALES_PIN);
        assertThat(passwordEncoder.matches(SALES_PIN, salesEmployee.getCredentialHash())).isTrue();
    }

    @Test
    void seedingTwiceDoesNotCreateDuplicates() {
        demoAccountSeeder.seedDemoAccounts();
        demoAccountSeeder.seedDemoAccounts();

        assertThat(utilisateurRepository.findAll())
                .filteredOn(user -> user.getUsername().equals(OWNER_USERNAME))
                .hasSize(1);
        assertThat(utilisateurRepository.findAll())
                .filteredOn(user -> user.getUsername().equals(EMPLOYEE_USERNAME))
                .hasSize(1);
        assertThat(utilisateurRepository.findAll())
                .filteredOn(user -> user.getUsername().equals(SALES_USERNAME))
                .hasSize(1);
    }

    @Test
    void seedingRepairsAnExistingDemoAccountWithAnOldRole() {
        Utilisateur employee = utilisateurRepository.findByUsername(EMPLOYEE_USERNAME).orElseThrow();
        employee.setRole(Role.VENTE);
        utilisateurRepository.save(employee);

        demoAccountSeeder.seedDemoAccounts();

        Utilisateur repairedEmployee = utilisateurRepository.findByUsername(EMPLOYEE_USERNAME).orElseThrow();
        assertThat(repairedEmployee.getRole()).isEqualTo(Role.FABRICATION);
        assertThat(repairedEmployee.isActif()).isTrue();
        assertThat(passwordEncoder.matches(EMPLOYEE_PIN, repairedEmployee.getCredentialHash())).isTrue();
    }

    @Test
    void allDemoCredentialsAuthenticateThroughRealEndpoint() throws Exception {
        login(OWNER_USERNAME, OWNER_PASSWORD)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("PROPRIETAIRE"));

        login(EMPLOYEE_USERNAME, EMPLOYEE_PIN)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("FABRICATION"));

        login(SALES_USERNAME, SALES_PIN)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("VENTE"));
    }

    @Test
    void invalidDemoCredentialsAreRejected() throws Exception {
        login(OWNER_USERNAME, "mot-de-passe-incorrect")
                .andExpect(status().isUnauthorized());

        login(EMPLOYEE_USERNAME, "9999")
                .andExpect(status().isUnauthorized());

        login(SALES_USERNAME, "0000")
                .andExpect(status().isUnauthorized());
    }

    private org.springframework.test.web.servlet.ResultActions login(String username, String password)
            throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"username":"%s","password":"%s"}
                        """.formatted(username, password)));
    }
}
