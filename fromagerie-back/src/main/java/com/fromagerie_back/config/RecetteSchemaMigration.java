package com.fromagerie_back.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(3)
@ConditionalOnProperty(name = "app.schema-migration.enabled", havingValue = "true")
public class RecetteSchemaMigration implements ApplicationRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(RecetteSchemaMigration.class);

    private final JdbcTemplate jdbcTemplate;

    public RecetteSchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        addColumnIfMissing("variante_key", "VARCHAR(36)");
        addColumnIfMissing("numero_version", "INTEGER");
        addColumnIfMissing("active", "BOOLEAN");
        addColumnIfMissing("date_creation", "TIMESTAMP");
        addColumnIfMissing("cout_matiere_estime", "NUMERIC(19,2)");
        addColumnIfMissing("frequence_retournement_jours", "INTEGER");

        int migrated = jdbcTemplate.update("""
                UPDATE recette
                SET variante_key = COALESCE(variante_key, 'legacy-' || id),
                    numero_version = COALESCE(numero_version, 1),
                    active = COALESCE(active, TRUE),
                    date_creation = COALESCE(date_creation, CURRENT_TIMESTAMP),
                    cout_matiere_estime = COALESCE(cout_matiere_estime, 0),
                    frequence_retournement_jours = NULLIF(frequence_retournement_jours, 0)
                WHERE variante_key IS NULL
                   OR numero_version IS NULL
                   OR active IS NULL
                   OR date_creation IS NULL
                   OR cout_matiere_estime IS NULL
                """);

        int familiesClassified = jdbcTemplate.update("""
                WITH recipe_families AS (
                    SELECT fromage_id,
                           variante_key AS previous_key,
                           MIN(id) AS first_recipe_id,
                           MAX(CASE WHEN LOWER(TRIM(nom)) = 'classique' THEN 1 ELSE 0 END) AS is_classic
                    FROM recette
                    GROUP BY fromage_id, variante_key
                ), ranked_families AS (
                    SELECT fromage_id,
                           previous_key,
                           first_recipe_id,
                           ROW_NUMBER() OVER (
                               PARTITION BY fromage_id
                               ORDER BY is_classic DESC, first_recipe_id
                           ) AS base_rank
                    FROM recipe_families
                ), family_keys AS (
                    SELECT fromage_id,
                           previous_key,
                           CASE
                               WHEN base_rank = 1 AND previous_key LIKE 'legacy-%' THEN previous_key
                               WHEN base_rank = 1 THEN 'legacy-' || first_recipe_id
                               WHEN previous_key LIKE 'legacy-%' THEN 'variant-' || first_recipe_id
                               ELSE previous_key
                           END AS classified_key
                    FROM ranked_families
                )
                UPDATE recette target
                SET variante_key = classified.classified_key
                FROM family_keys classified
                WHERE target.fromage_id = classified.fromage_id
                  AND target.variante_key = classified.previous_key
                  AND target.variante_key <> classified.classified_key
                """);

        jdbcTemplate.execute("ALTER TABLE recette ALTER COLUMN variante_key SET NOT NULL");
        jdbcTemplate.execute("ALTER TABLE recette ALTER COLUMN numero_version SET NOT NULL");
        jdbcTemplate.execute("ALTER TABLE recette ALTER COLUMN active SET NOT NULL");
        jdbcTemplate.execute("ALTER TABLE recette ALTER COLUMN date_creation SET NOT NULL");
        jdbcTemplate.execute("ALTER TABLE recette ALTER COLUMN cout_matiere_estime SET NOT NULL");
        jdbcTemplate.execute("""
                UPDATE recette
                SET frequence_retournement_jours = NULL
                WHERE frequence_retournement_jours <= 0
                """);
        jdbcTemplate.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS uk_recette_variante_version
                ON recette (variante_key, numero_version)
                """);

        if (migrated > 0) {
            LOGGER.info("Migration: {} recette(s) historique(s) initialisée(s) en version 1", migrated);
        }
        if (familiesClassified > 0) {
            LOGGER.info("Migration: {} version(s) classifiée(s) entre recette de base et variantes",
                    familiesClassified);
        }
    }

    private void addColumnIfMissing(String columnName, String definition) {
        jdbcTemplate.execute("ALTER TABLE recette ADD COLUMN IF NOT EXISTS " + columnName + " " + definition);
    }
}
