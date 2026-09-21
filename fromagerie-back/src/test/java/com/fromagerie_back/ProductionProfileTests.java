package com.fromagerie_back;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfigurationSource;

import com.fromagerie_back.config.DemoAccountSeeder;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:production-profile-test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@ActiveProfiles("prod")
class ProductionProfileTests {

    @Autowired
    private Environment environment;

    @Autowired
    private ApplicationContext context;

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Test
    void productionRequiresExplicitBaselineAndDisablesDemoAccounts() {
        assertThat(environment.getProperty("spring.flyway.baseline-on-migrate")).isEqualTo("false");
        assertThat(environment.getProperty("spring.jpa.show-sql")).isEqualTo("false");
        assertThat(environment.getProperty("server.servlet.session.cookie.secure")).isEqualTo("true");
        assertThat(context.getBeansOfType(DemoAccountSeeder.class)).isEmpty();
        assertThat(corsConfigurationSource.getCorsConfiguration(
                new MockHttpServletRequest("GET", "/api/auth/csrf"))
                .getAllowedOrigins()).isEmpty();
    }
}
