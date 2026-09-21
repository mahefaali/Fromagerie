package com.fromagerie_back.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.fromagerie_back.model.Role;
import com.fromagerie_back.service.UtilisateurService;

@Component
@Profile("dev")
public class DemoAccountSeeder implements ApplicationRunner {

    public static final String OWNER_USERNAME = "gilles.demo";
    public static final String EMPLOYEE_USERNAME = "jean.demo";
    public static final String SALES_USERNAME = "nathalie.demo";

    private final UtilisateurService utilisateurService;
    private final String ownerPassword;
    private final String employeePin;
    private final String salesPin;

    public DemoAccountSeeder(UtilisateurService utilisateurService,
            @Value("${DEMO_OWNER_PASSWORD}") String ownerPassword,
            @Value("${DEMO_EMPLOYEE_PIN}") String employeePin,
            @Value("${DEMO_SALES_PIN}") String salesPin) {
        this.utilisateurService = utilisateurService;
        this.ownerPassword = ownerPassword;
        this.employeePin = employeePin;
        this.salesPin = salesPin;
    }

    @Override
    public void run(ApplicationArguments args) {
        seedDemoAccounts();
    }

    public void seedDemoAccounts() {
        createIfMissing(
                OWNER_USERNAME,
                "Gilles Payet Démo",
                ownerPassword,
                Role.PROPRIETAIRE);
        createIfMissing(
                EMPLOYEE_USERNAME,
                "Jean Lebon Démo",
                employeePin,
                Role.FABRICATION);
        createIfMissing(
                SALES_USERNAME,
                "Nathalie Vente Démo",
                salesPin,
                Role.VENTE);
    }

    private void createIfMissing(String username, String nom, String credential, Role role) {
        utilisateurService.ensureDemoUser(username, nom, credential, role);
    }
}
