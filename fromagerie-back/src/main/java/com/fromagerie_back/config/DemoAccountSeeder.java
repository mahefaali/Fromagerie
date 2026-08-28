package com.fromagerie_back.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.fromagerie_back.model.Role;
import com.fromagerie_back.service.UtilisateurService;

@Component
@Profile("dev")
public class DemoAccountSeeder implements ApplicationRunner {

    public static final String OWNER_USERNAME = "gilles.demo";
    public static final String OWNER_PASSWORD = "DemoFromagerie2026!";
    public static final String EMPLOYEE_USERNAME = "jean.demo";
    public static final String EMPLOYEE_PIN = "1234";
    public static final String SALES_USERNAME = "nathalie.demo";
    public static final String SALES_PIN = "5678";

    private final UtilisateurService utilisateurService;

    public DemoAccountSeeder(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    @Override
    public void run(ApplicationArguments args) {
        seedDemoAccounts();
    }

    public void seedDemoAccounts() {
        createIfMissing(
                OWNER_USERNAME,
                "Gilles Payet Démo",
                OWNER_PASSWORD,
                Role.PROPRIETAIRE);
        createIfMissing(
                EMPLOYEE_USERNAME,
                "Jean Lebon Démo",
                EMPLOYEE_PIN,
                Role.FABRICATION);
        createIfMissing(
                SALES_USERNAME,
                "Nathalie Vente Démo",
                SALES_PIN,
                Role.VENTE);
    }

    private void createIfMissing(String username, String nom, String credential, Role role) {
        utilisateurService.ensureDemoUser(username, nom, credential, role);
    }
}
