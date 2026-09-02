package com.fromagerie_back.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(5)
@ConditionalOnProperty(name = "app.schema-migration.enabled", havingValue = "true")
public class CoutProductionSchemaMigration implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    public CoutProductionSchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS tarif_lait (
                    id BIGSERIAL PRIMARY KEY,
                    saison VARCHAR(20) NOT NULL,
                    prix_par_litre NUMERIC(19,4) NOT NULL,
                    date_debut_validite DATE NOT NULL,
                    date_fin_validite DATE,
                    actif BOOLEAN NOT NULL DEFAULT TRUE
                )
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS emballage (
                    id BIGSERIAL PRIMARY KEY,
                    nom VARCHAR(120) NOT NULL UNIQUE,
                    cout_unitaire NUMERIC(19,4) NOT NULL,
                    unite VARCHAR(40) NOT NULL,
                    actif BOOLEAN NOT NULL DEFAULT TRUE
                )
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS regle_cout_energie (
                    id BIGSERIAL PRIMARY KEY,
                    type_operation VARCHAR(30) NOT NULL,
                    cout_standard NUMERIC(19,4) NOT NULL,
                    unite_calcul VARCHAR(30) NOT NULL,
                    date_debut_validite DATE NOT NULL,
                    date_fin_validite DATE,
                    actif BOOLEAN NOT NULL DEFAULT TRUE
                )
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS consommation_emballage (
                    id BIGSERIAL PRIMARY KEY,
                    lot_affinage_id BIGINT NOT NULL,
                    emballage_id BIGINT NOT NULL,
                    quantite INTEGER NOT NULL,
                    etape VARCHAR(30) NOT NULL,
                    date_heure TIMESTAMP NOT NULL,
                    utilisateur_id BIGINT NOT NULL,
                    cout_unitaire_reference NUMERIC(19,4) NOT NULL,
                    CONSTRAINT fk_consommation_emballage_lot FOREIGN KEY (lot_affinage_id) REFERENCES lot_affinage(id),
                    CONSTRAINT fk_consommation_emballage_emballage FOREIGN KEY (emballage_id) REFERENCES emballage(id),
                    CONSTRAINT fk_consommation_emballage_utilisateur FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
                )
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS regle_main_oeuvre (
                    id BIGSERIAL PRIMARY KEY,
                    type_operation VARCHAR(30) NOT NULL,
                    duree_standard_minutes INTEGER NOT NULL,
                    cout_horaire NUMERIC(19,4) NOT NULL,
                    date_debut_validite DATE NOT NULL,
                    date_fin_validite DATE,
                    actif BOOLEAN NOT NULL DEFAULT TRUE,
                    CONSTRAINT ck_regle_main_oeuvre_duree_positive CHECK (duree_standard_minutes > 0)
                )
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS equipement (
                    id BIGSERIAL PRIMARY KEY,
                    nom VARCHAR(120) NOT NULL UNIQUE,
                    description VARCHAR(500),
                    actif BOOLEAN NOT NULL DEFAULT TRUE
                )
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS regle_amortissement (
                    id BIGSERIAL PRIMARY KEY,
                    equipement_id BIGINT NOT NULL,
                    cout_par_fabrication NUMERIC(19,4) NOT NULL,
                    date_debut_validite DATE NOT NULL,
                    date_fin_validite DATE,
                    actif BOOLEAN NOT NULL DEFAULT TRUE,
                    CONSTRAINT fk_regle_amortissement_equipement FOREIGN KEY (equipement_id) REFERENCES equipement(id)
                )
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS configuration_emballage (
                    id BIGSERIAL PRIMARY KEY,
                    fromage_id BIGINT NOT NULL,
                    emballage_id BIGINT NOT NULL,
                    quantite_par_unite NUMERIC(19,4) NOT NULL,
                    actif BOOLEAN NOT NULL DEFAULT TRUE,
                    CONSTRAINT fk_configuration_emballage_fromage FOREIGN KEY (fromage_id) REFERENCES fromage(id),
                    CONSTRAINT fk_configuration_emballage_emballage FOREIGN KEY (emballage_id) REFERENCES emballage(id),
                    CONSTRAINT uk_configuration_emballage_fromage_emballage UNIQUE (fromage_id, emballage_id),
                    CONSTRAINT ck_configuration_emballage_quantite_positive CHECK (quantite_par_unite > 0)
                )
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS cout_production_lot (
                    id BIGSERIAL PRIMARY KEY,
                    fabrication_id BIGINT NOT NULL UNIQUE,
                    cout_lait NUMERIC(19,4) NOT NULL,
                    cout_matieres NUMERIC(19,4) NOT NULL,
                    cout_emballage NUMERIC(19,4) NOT NULL,
                    cout_energie NUMERIC(19,4) NOT NULL,
                    cout_main_oeuvre NUMERIC(19,4) NOT NULL,
                    cout_amortissement NUMERIC(19,4) NOT NULL,
                    cout_total NUMERIC(19,4) NOT NULL,
                    cout_par_kg NUMERIC(19,4) NOT NULL,
                    cout_par_unite NUMERIC(19,4) NOT NULL,
                    nombre_unites_finales INTEGER NOT NULL,
                    date_calcul TIMESTAMP NOT NULL,
                    CONSTRAINT fk_cout_production_lot_fabrication FOREIGN KEY (fabrication_id) REFERENCES fabrication(id)
                )
                """);
    }
}
