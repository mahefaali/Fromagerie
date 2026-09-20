package com.fromagerie_back.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.CompositeLogoutHandler;
import org.springframework.security.web.authentication.logout.CookieClearingLogoutHandler;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfLogoutHandler;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.fromagerie_back.security.CustomUserDetailsService;
import com.fromagerie_back.security.RestSecurityErrorHandler;

import jakarta.servlet.DispatcherType;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(
            CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(DaoAuthenticationProvider authenticationProvider) {
        return new ProviderManager(authenticationProvider);
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public CsrfTokenRepository csrfTokenRepository() {
        HttpSessionCsrfTokenRepository repository = new HttpSessionCsrfTokenRepository();
        repository.setHeaderName("X-CSRF-TOKEN");
        return repository;
    }

    @Bean
    public LogoutHandler restLogoutHandler(
            SecurityContextRepository securityContextRepository,
            CsrfTokenRepository csrfTokenRepository) {
        SecurityContextLogoutHandler securityContextLogoutHandler = new SecurityContextLogoutHandler();
        securityContextLogoutHandler.setSecurityContextRepository(securityContextRepository);

        return new CompositeLogoutHandler(
                new CsrfLogoutHandler(csrfTokenRepository),
                securityContextLogoutHandler,
                new CookieClearingLogoutHandler("JSESSIONID"));
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://192.168.100.9:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Content-Type", "Accept", "X-CSRF-TOKEN"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            SecurityContextRepository securityContextRepository,
            CsrfTokenRepository csrfTokenRepository,
            RestSecurityErrorHandler securityErrorHandler) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfTokenRepository)
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
                .securityContext(context -> context
                        .requireExplicitSave(true)
                        .securityContextRepository(securityContextRepository))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .requestCache(cache -> cache.disable())
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())
                .logout(logout -> logout.disable())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(securityErrorHandler)
                        .accessDeniedHandler(securityErrorHandler))
                .authorizeHttpRequests(authorize -> authorize
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/auth/login", "/api/auth/csrf").permitAll()
                        .requestMatchers("/api/auth/me", "/api/auth/logout").authenticated()
                        .requestMatchers("/api/utilisateurs/**").hasRole("PROPRIETAIRE")
                        .requestMatchers("/api/configuration/couts/**").hasRole("PROPRIETAIRE")
                        .requestMatchers("/api/documents/**").hasRole("PROPRIETAIRE")
                        .requestMatchers("/api/couts-production/**", "/api/rentabilite/**", "/api/performances/**")
                        .hasRole("PROPRIETAIRE")
                        .requestMatchers(HttpMethod.GET, "/api/recettes/**", "/api/matieres-premieres/**")
                        .hasAnyRole("PROPRIETAIRE", "FABRICATION")
                        .requestMatchers(HttpMethod.GET, "/api/caves/**")
                        .hasAnyRole("PROPRIETAIRE", "FABRICATION")
                        .requestMatchers("/api/caves/**")
                        .hasRole("PROPRIETAIRE")
                        .requestMatchers("/api/recettes/**", "/api/matieres-premieres/**")
                        .hasRole("PROPRIETAIRE")
                        .requestMatchers(HttpMethod.POST, "/api/affinages/*/sortie-stock")
                        .hasAnyRole("PROPRIETAIRE", "FABRICATION")
                        .requestMatchers("/api/fabrications/**", "/api/affinage/**", "/api/affinages/**")
                        .hasAnyRole("PROPRIETAIRE", "FABRICATION")
                        .requestMatchers(HttpMethod.GET, "/api/tracabilite/**", "/api/lots-lait/**")
                        .hasAnyRole("PROPRIETAIRE", "FABRICATION", "VENTE")
                        .requestMatchers("/api/lots-lait/**", "/api/analyses-lait/**")
                        .hasRole("PROPRIETAIRE")
                        .requestMatchers(HttpMethod.GET, "/api/emplacements-stock/**")
                        .hasAnyRole("PROPRIETAIRE", "FABRICATION", "VENTE")
                        .requestMatchers(HttpMethod.GET, "/api/stock-fromages-finis/**")
                        .hasAnyRole("PROPRIETAIRE", "VENTE")
                        .requestMatchers(HttpMethod.POST, "/api/stock-fromages-finis/*/pertes")
                        .hasAnyRole("PROPRIETAIRE", "VENTE")
                        .requestMatchers("/api/emplacements-stock/**", "/api/stock-fromages-finis/**")
                        .hasRole("PROPRIETAIRE")
                        .requestMatchers("/api/commandes/**", "/api/clients/**", "/api/factures/**", "/api/ventes/**")
                        .hasAnyRole("PROPRIETAIRE", "VENTE")
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().denyAll());

        return http.build();
    }
}
