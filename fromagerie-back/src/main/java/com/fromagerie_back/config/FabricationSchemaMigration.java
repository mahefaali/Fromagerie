package com.fromagerie_back.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
@Order(2)
@ConditionalOnProperty(name = "app.schema-migration.enabled", havingValue = "true")
public class FabricationSchemaMigration implements ApplicationRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(FabricationSchemaMigration.class);

    private final JdbcTemplate jdbcTemplate;

    public FabricationSchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        migrateOperatorRelation();
        migrateRecipeCheeseRelation();
        migrateHistoricalYields();
        createAnalyticsIndexes();
    }

    private void migrateHistoricalYields() {
        int updatedYields = jdbcTemplate.update("""
                UPDATE fabrication
                SET rendement = ROUND((poids_total_fromages * 100) / quantite_lait, 2)
                WHERE rendement IS NULL
                  AND poids_total_fromages IS NOT NULL
                  AND quantite_lait IS NOT NULL
                  AND quantite_lait > 0
                """);
        if (updatedYields > 0) {
            LOGGER.info("Migration: rendement recalculé pour {} fabrication(s) historique(s)", updatedYields);
        }
    }

    private void migrateOperatorRelation() {
        if (!columnExists("fabrication", "operateur_id")) {
            jdbcTemplate.execute("ALTER TABLE fabrication ADD COLUMN operateur_id BIGINT");
            LOGGER.info("Migration: colonne fabrication.operateur_id créée");
        }

        if (!foreignKeyExists("fabrication", "operateur_id")) {
            jdbcTemplate.execute("""
                    ALTER TABLE fabrication
                    ADD CONSTRAINT fk_fabrication_operateur
                    FOREIGN KEY (operateur_id) REFERENCES utilisateurs(id)
                    """);
            LOGGER.info("Migration: clé étrangère fabrication.operateur_id créée");
        }
    }

    private void migrateRecipeCheeseRelation() {
        if (!columnExists("recette", "fromage_id")) {
            jdbcTemplate.execute("ALTER TABLE recette ADD COLUMN fromage_id BIGINT");
            LOGGER.info("Migration: colonne recette.fromage_id créée");
        }

        int createdCheeses = jdbcTemplate.update("""
                INSERT INTO fromage (nom, description)
                SELECT DISTINCT recette.nom, 'Créé automatiquement depuis une recette historique'
                FROM recette
                WHERE recette.fromage_id IS NULL
                  AND recette.nom IS NOT NULL
                  AND NOT EXISTS (
                      SELECT 1 FROM fromage WHERE fromage.nom = recette.nom
                  )
                """);

        int linkedRecipes = jdbcTemplate.update("""
                UPDATE recette
                SET fromage_id = (
                    SELECT MIN(fromage.id)
                    FROM fromage
                    WHERE fromage.nom = recette.nom
                )
                WHERE recette.fromage_id IS NULL
                """);

        if (createdCheeses > 0 || linkedRecipes > 0) {
            LOGGER.info(
                    "Migration: {} fromage(s) créé(s) et {} recette(s) historique(s) reliée(s)",
                    createdCheeses,
                    linkedRecipes);
        }

        Integer recipesWithoutCheese = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM recette WHERE fromage_id IS NULL",
                Integer.class);
        if (recipesWithoutCheese != null && recipesWithoutCheese > 0) {
            throw new IllegalStateException(
                    "Migration impossible: certaines recettes historiques n'ont pas de nom exploitable");
        }

        if (columnIsNullable("recette", "fromage_id")) {
            jdbcTemplate.execute("ALTER TABLE recette ALTER COLUMN fromage_id SET NOT NULL");
            LOGGER.info("Migration: colonne recette.fromage_id rendue obligatoire");
        }

        if (!foreignKeyExists("recette", "fromage_id")) {
            jdbcTemplate.execute("""
                    ALTER TABLE recette
                    ADD CONSTRAINT fk_recette_fromage
                    FOREIGN KEY (fromage_id) REFERENCES fromage(id)
                    """);
            LOGGER.info("Migration: clé étrangère recette.fromage_id créée");
        }
    }

    private void createAnalyticsIndexes() {
        jdbcTemplate.execute("""
                CREATE INDEX IF NOT EXISTS idx_fabrication_date_heure_debut
                ON fabrication (date_heure_debut)
                """);
        jdbcTemplate.execute("""
                CREATE INDEX IF NOT EXISTS idx_fabrication_recette_id
                ON fabrication (recette_id)
                """);
        jdbcTemplate.execute("""
                CREATE INDEX IF NOT EXISTS idx_recette_fromage_id
                ON recette (fromage_id)
                """);
        LOGGER.info("Migration: indexes analytiques vérifiés");
    }

    private boolean columnExists(String tableName, String columnName) {
        return Boolean.TRUE.equals(jdbcTemplate.queryForObject("""
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_schema = current_schema()
                      AND table_name = ?
                      AND column_name = ?
                )
                """, Boolean.class, tableName, columnName));
    }

    private boolean columnIsNullable(String tableName, String columnName) {
        return Boolean.TRUE.equals(jdbcTemplate.queryForObject("""
                SELECT is_nullable = 'YES'
                FROM information_schema.columns
                WHERE table_schema = current_schema()
                  AND table_name = ?
                  AND column_name = ?
                """, Boolean.class, tableName, columnName));
    }

    private boolean foreignKeyExists(String tableName, String columnName) {
        return Boolean.TRUE.equals(jdbcTemplate.queryForObject("""
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.table_constraints constraints
                    JOIN information_schema.key_column_usage columns
                      ON constraints.constraint_name = columns.constraint_name
                     AND constraints.table_schema = columns.table_schema
                    WHERE constraints.table_schema = current_schema()
                      AND constraints.table_name = ?
                      AND constraints.constraint_type = 'FOREIGN KEY'
                      AND columns.column_name = ?
                )
                """, Boolean.class, tableName, columnName));
    }
}
