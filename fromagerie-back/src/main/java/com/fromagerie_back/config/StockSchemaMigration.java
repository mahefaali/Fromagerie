package com.fromagerie_back.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(4)
@ConditionalOnProperty(name = "app.schema-migration.enabled", havingValue = "true")
public class StockSchemaMigration implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    public StockSchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS emplacement_stock (
                    id BIGSERIAL PRIMARY KEY,
                    nom VARCHAR(120) NOT NULL UNIQUE,
                    description VARCHAR(500),
                    active BOOLEAN NOT NULL DEFAULT TRUE
                )
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS stock_fromage_fini (
                    id BIGSERIAL PRIMARY KEY,
                    lot_affinage_id BIGINT NOT NULL UNIQUE,
                    emplacement_stock_id BIGINT NOT NULL,
                    date_entree_stock DATE NOT NULL,
                    quantite_initiale INTEGER NOT NULL,
                    type_date_durabilite VARCHAR(10) NOT NULL,
                    date_durabilite DATE NOT NULL,
                    statut VARCHAR(20) NOT NULL,
                    CONSTRAINT fk_stock_lot_affinage FOREIGN KEY (lot_affinage_id) REFERENCES lot_affinage(id),
                    CONSTRAINT fk_stock_emplacement FOREIGN KEY (emplacement_stock_id) REFERENCES emplacement_stock(id)
                )
                """);
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS mouvement_stock (
                    id BIGSERIAL PRIMARY KEY,
                    stock_fromage_fini_id BIGINT NOT NULL,
                    type VARCHAR(20) NOT NULL,
                    quantite INTEGER NOT NULL,
                    utilisateur_id BIGINT NOT NULL,
                    date_mouvement TIMESTAMP NOT NULL,
                    commentaire VARCHAR(500),
                    CONSTRAINT fk_mouvement_stock FOREIGN KEY (stock_fromage_fini_id) REFERENCES stock_fromage_fini(id),
                    CONSTRAINT fk_mouvement_utilisateur FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
                )
                """);

        // Remove the legacy OneToOne constraint. Multiple lots can share one stock location.
        jdbcTemplate.execute("""
                DO $$
                DECLARE
                    legacy_constraint TEXT;
                BEGIN
                    SELECT c.conname
                    INTO legacy_constraint
                    FROM pg_constraint c
                    JOIN pg_class t ON t.oid = c.conrelid
                    WHERE t.relname = 'stock_fromage_fini'
                      AND c.contype = 'u'
                      AND array_length(c.conkey, 1) = 1
                      AND EXISTS (
                          SELECT 1
                          FROM pg_attribute a
                          WHERE a.attrelid = t.oid
                            AND a.attnum = c.conkey[1]
                            AND a.attname = 'emplacement_stock_id'
                      )
                    LIMIT 1;

                    IF legacy_constraint IS NOT NULL THEN
                        EXECUTE format(
                            'ALTER TABLE stock_fromage_fini DROP CONSTRAINT %I',
                            legacy_constraint
                        );
                    END IF;
                END $$;
                """);

        // Hibernate created this constraint before VENTE was added to the enum.
        jdbcTemplate.execute("""
                ALTER TABLE mouvement_stock
                DROP CONSTRAINT IF EXISTS mouvement_stock_type_check
                """);
        jdbcTemplate.execute("""
                ALTER TABLE mouvement_stock
                ADD CONSTRAINT mouvement_stock_type_check
                CHECK (type IN ('ENTREE', 'SORTIE', 'AJUSTEMENT', 'VENTE'))
                """);

    }
}
