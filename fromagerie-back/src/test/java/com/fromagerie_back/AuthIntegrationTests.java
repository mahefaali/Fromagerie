package com.fromagerie_back;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

import com.fromagerie_back.exception.InvalidCredentialException;
import com.fromagerie_back.exception.BusinessValidationException;
import com.fromagerie_back.model.Role;
import com.fromagerie_back.model.Utilisateur;
import com.fromagerie_back.repository.UtilisateurRepository;
import com.fromagerie_back.service.UtilisateurService;

@SpringBootTest
@AutoConfigureMockMvc
class AuthIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private UtilisateurService utilisateurService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Utilisateur proprietaire;
    private Utilisateur fabrication;
    private Utilisateur vente;

    @BeforeEach
    void setUp() {
        utilisateurRepository.deleteAll();
        proprietaire = utilisateurService.createUser(
                "gilles", "Gilles Payet", "mot-de-passe-solide", Role.PROPRIETAIRE, true);
        fabrication = utilisateurService.createUser(
                "jean-hugues", "Jean-Hugues", "1234", Role.FABRICATION, true);
        vente = utilisateurService.createUser(
                "nathalie", "Nathalie", "5678", Role.VENTE, true);
    }

    @Test
    void validOwnerLoginCreatesSession() throws Exception {
        login("gilles", "mot-de-passe-solide")
                .andExpect(status().isOk())
                .andExpect(request().sessionAttribute(
                        HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                        org.hamcrest.Matchers.notNullValue()))
                .andExpect(jsonPath("$.id").value(proprietaire.getId()))
                .andExpect(jsonPath("$.role").value("PROPRIETAIRE"))
                .andExpect(jsonPath("$.credentialHash").doesNotExist());
    }

    @Test
    void validFabricationLoginWithPinCreatesSession() throws Exception {
        login("jean-hugues", "1234")
                .andExpect(status().isOk())
                .andExpect(request().sessionAttribute(
                        HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                        org.hamcrest.Matchers.notNullValue()))
                .andExpect(jsonPath("$.role").value("FABRICATION"));
    }

    @Test
    void validVenteLoginWithPinSucceeds() throws Exception {
        login("nathalie", "5678")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("VENTE"));
    }

    @Test
    void wrongOwnerPasswordReturnsUnauthorized() throws Exception {
        login("gilles", "incorrect")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Identifiants invalides"));
    }

    @Test
    void wrongEmployeePinReturnsUnauthorized() throws Exception {
        login("jean-hugues", "9999")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Identifiants invalides"));
    }

    @Test
    void meReturnsCurrentUserWithValidSession() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", "mot-de-passe-solide");

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("gilles"))
                .andExpect(jsonPath("$.nom").value("Gilles Payet"))
                .andExpect(jsonPath("$.role").value("PROPRIETAIRE"));
    }

    @Test
    void meWithoutSessionReturnsUnauthorizedJson() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Authentification requise"));
    }

    @Test
    void logoutInvalidatesSessionAndMeThenReturnsUnauthorized() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", "mot-de-passe-solide");

        mockMvc.perform(post("/api/auth/logout").session(session).with(csrf().asHeader()))
                .andExpect(status().isNoContent())
                .andExpect(cookie().maxAge("JSESSIONID", 0));

        assertThat(session.isInvalid()).isTrue();
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void businessEndpointWithoutSessionReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/fromages"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void authenticatedUserWithoutRequiredRoleReceivesForbidden() throws Exception {
        MockHttpSession session = authenticatedSession("nathalie", "5678");

        mockMvc.perform(get("/api/fabrications").session(session))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("Accès refusé"));
    }

    @Test
    void ownerSessionCanAccessConfigurationApis() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", "mot-de-passe-solide");

        mockMvc.perform(get("/api/utilisateurs").session(session))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/configuration/couts/emballages").session(session))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/configuration/couts/lait").session(session))
                .andExpect(status().isNotFound());
    }

    @Test
    void missingAuthenticatedApiIsNotReportedAsAccessDenied() throws Exception {
        MockHttpSession session = authenticatedSession("gilles", "mot-de-passe-solide");

        mockMvc.perform(get("/api/route-inexistante").session(session))
                .andExpect(status().isNotFound());
    }

    @Test
    void inactiveUserCannotAuthenticate() throws Exception {
        Utilisateur inactive = utilisateurService.createUser("inactive", "Inactive", "4321", Role.FABRICATION, true);
        utilisateurService.deactivateUser(inactive.getId());

        login("inactive", "4321")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Identifiants invalides"));

        assertThat(utilisateurRepository.findById(inactive.getId())).isPresent()
                .get()
                .extracting(Utilisateur::isActif)
                .isEqualTo(false);
    }

    @Test
    void deactivationKeepsUserForHistoricalReferencesAndHidesItByDefault() {
        Long userId = fabrication.getId();
        String credentialHash = fabrication.getCredentialHash();

        utilisateurService.deactivateUser(userId);

        Utilisateur persisted = utilisateurRepository.findById(userId).orElseThrow();
        assertThat(persisted.getId()).isEqualTo(userId);
        assertThat(persisted.getCredentialHash()).isEqualTo(credentialHash);
        assertThat(persisted.isActif()).isFalse();
        assertThat(utilisateurService.findAllUsers(false)).noneMatch(user -> user.getId().equals(userId));
        assertThat(utilisateurService.findAllUsers(true)).anyMatch(user -> user.getId().equals(userId));
    }

    @Test
    void deactivatedUserCanBeReactivated() throws Exception {
        utilisateurService.deactivateUser(fabrication.getId());

        utilisateurService.reactivateUser(fabrication.getId());

        assertThat(utilisateurRepository.findById(fabrication.getId()).orElseThrow().isActif()).isTrue();
        login("jean-hugues", "1234")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("FABRICATION"));
    }

    @Test
    void ownerCannotBeDeactivated() {
        assertThatThrownBy(() -> utilisateurService.deactivateUser(proprietaire.getId()))
                .isInstanceOf(BusinessValidationException.class)
                .hasMessage("Un compte propriétaire ne peut pas être désactivé");

        assertThat(utilisateurRepository.findById(proprietaire.getId()).orElseThrow().isActif()).isTrue();
    }

    @Test
    void employeePinMustContainExactlyFourDigitsOnCreateAndUpdate() {
        assertThatThrownBy(() -> utilisateurService.createUser(
                "invalid", "Invalid", "12345", Role.FABRICATION, true))
                .isInstanceOf(InvalidCredentialException.class);

        assertThatThrownBy(() -> utilisateurService.updateCredential(fabrication.getId(), "12a4"))
                .isInstanceOf(InvalidCredentialException.class);
    }

    @Test
    void credentialsAreHashedBeforePersistence() {
        assertThat(proprietaire.getCredentialHash()).isNotEqualTo("mot-de-passe-solide");
        assertThat(fabrication.getCredentialHash()).isNotEqualTo("1234");
        assertThat(passwordEncoder.matches("1234", fabrication.getCredentialHash())).isTrue();
    }

    @Test
    void twoEmployeesCanSharePinAndAuthenticateIndependently() throws Exception {
        Utilisateur secondEmployee = utilisateurService.createUser(
                "marie", "Marie", "1234", Role.VENTE, true);

        assertThat(secondEmployee.getCredentialHash()).isNotEqualTo(fabrication.getCredentialHash());

        login("jean-hugues", "1234")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("jean-hugues"));
        login("marie", "1234")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("marie"));
    }

    @Test
    void mutatingRequestRequiresCsrfToken() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("gilles", "mot-de-passe-solide")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        login("gilles", "mot-de-passe-solide")
                .andExpect(status().isOk());
    }

    @Test
    void csrfEndpointReturnsTokenAndCorsAllowsReactOrigin() throws Exception {
        MvcResult csrfResult = mockMvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.headerName").value("X-CSRF-TOKEN"))
                .andReturn();

        assertThat(csrfResult.getRequest().getSession(false)).isNotNull();

        mockMvc.perform(options("/api/auth/login")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "Content-Type,X-CSRF-TOKEN"))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(
                        result.getResponse().getHeader("Access-Control-Allow-Origin"))
                        .isEqualTo("http://localhost:5173"))
                .andExpect(result -> assertThat(
                        result.getResponse().getHeader("Access-Control-Allow-Credentials"))
                        .isEqualTo("true"));
    }

    @Test
    void csrfTokenIsRenewedAfterLogin() throws Exception {
        MvcResult initialCsrfResult = mockMvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk())
                .andReturn();
        MockHttpSession session = (MockHttpSession) initialCsrfResult.getRequest().getSession(false);
        String initialToken = extractToken(initialCsrfResult);

        mockMvc.perform(post("/api/auth/login")
                        .session(session)
                        .header("X-CSRF-TOKEN", initialToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("gilles", "mot-de-passe-solide")))
                .andExpect(status().isOk());

        MvcResult renewedCsrfResult = mockMvc.perform(get("/api/auth/csrf").session(session))
                .andExpect(status().isOk())
                .andReturn();

        assertThat(extractToken(renewedCsrfResult)).isNotEqualTo(initialToken);
    }

    private ResultActions login(String username, String password) throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                .with(csrf().asHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson(username, password)));
    }

    private MockHttpSession authenticatedSession(String username, String password) throws Exception {
        MvcResult result = login(username, password)
                .andExpect(status().isOk())
                .andReturn();
        return (MockHttpSession) result.getRequest().getSession(false);
    }

    private String loginJson(String username, String password) {
        return """
                {"username":"%s","password":"%s"}
                """.formatted(username, password);
    }

    private String extractToken(MvcResult result) throws Exception {
        String responseBody = result.getResponse().getContentAsString();
        String marker = "\"token\":\"";
        int tokenStart = responseBody.indexOf(marker) + marker.length();
        int tokenEnd = responseBody.indexOf('"', tokenStart);
        return responseBody.substring(tokenStart, tokenEnd);
    }
}
