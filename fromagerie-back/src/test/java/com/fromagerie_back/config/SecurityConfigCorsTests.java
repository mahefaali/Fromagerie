package com.fromagerie_back.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class SecurityConfigCorsTests {

    private final SecurityConfig securityConfig = new SecurityConfig();

    @Test
    void configuredOriginsAreTrimmedAndPreserved() {
        var source = securityConfig.corsConfigurationSource(
                "http://localhost:5173, https://app.example.com");
        var configuration = source.getCorsConfiguration(new MockHttpServletRequest("GET", "/api/auth/csrf"));

        assertThat(configuration).isNotNull();
        assertThat(configuration.getAllowedOrigins())
                .containsExactly("http://localhost:5173", "https://app.example.com");
        assertThat(configuration.getAllowCredentials()).isTrue();
    }

    @Test
    void wildcardIsRejectedWhenSessionCookiesAreAllowed() {
        assertThatThrownBy(() -> securityConfig.corsConfigurationSource("*"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("origine CORS explicite");
    }
}
