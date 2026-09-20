package com.fromagerie_back.config;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import com.fromagerie_back.service.SaisonService;

@Component
@Order(6)
@ConditionalOnProperty(name = "app.schema-migration.enabled", havingValue = "true")
public class CoutLaitLotSchemaMigration implements ApplicationRunner {
    private static final Logger LOGGER = LoggerFactory.getLogger(CoutLaitLotSchemaMigration.class);
    private final JdbcTemplate jdbc;
    private final SaisonService saisons;

    public CoutLaitLotSchemaMigration(JdbcTemplate jdbc, SaisonService saisons) {
        this.jdbc = jdbc;
        this.saisons = saisons;
    }

    @Override
    public void run(ApplicationArguments args) {
        jdbc.execute("ALTER TABLE lot_lait ADD COLUMN IF NOT EXISTS cout_unitaire NUMERIC(19,4)");
        if (tableExists("tarif_lait")) {
            List<LotHistorique> lots = jdbc.query(
                    "SELECT id, numero_lot, CAST(date_traite AS DATE) FROM lot_lait WHERE cout_unitaire IS NULL",
                    (rs, row) -> new LotHistorique(rs.getLong(1), rs.getString(2), rs.getDate(3).toLocalDate()));
            for (LotHistorique lot : lots) {
                String saison = saisons.determinerSaison(lot.date()).name();
                List<java.math.BigDecimal> prix = jdbc.query(
                        "SELECT prix_par_litre FROM tarif_lait WHERE actif = TRUE AND saison = ? "
                                + "AND date_debut_validite <= ? AND (date_fin_validite IS NULL OR date_fin_validite >= ?)",
                        (rs, row) -> rs.getBigDecimal(1), saison, Date.valueOf(lot.date()), Date.valueOf(lot.date()));
                if (prix.size() == 1) {
                    jdbc.update("UPDATE lot_lait SET cout_unitaire = ? WHERE id = ?", prix.getFirst(), lot.id());
                } else {
                    LOGGER.warn("Coût lait historique indéterminable pour le lot {} (id={}): {} tarif(s) applicable(s)",
                            lot.numero(), lot.id(), prix.size());
                }
            }
            jdbc.execute("DROP TABLE tarif_lait");
        }

        rattacherFabricationsHistoriques();
    }

    private boolean tableExists(String table) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE lower(table_name) = lower(?)", Integer.class, table);
        return count != null && count > 0;
    }

    private void rattacherFabricationsHistoriques() {
        jdbc.update("""
                INSERT INTO lot_lait(numero_lot, date_traite, type_traite, quantite, cout_unitaire, observations)
                SELECT 'HIST-LAIT-' || f.id, f.date_heure_debut,
                       CASE WHEN EXTRACT(HOUR FROM f.date_heure_debut) < 12 THEN 'MATIN' ELSE 'SOIR' END,
                       f.quantite_lait,
                       CASE WHEN c.cout_lait IS NOT NULL AND f.quantite_lait > 0
                            THEN ROUND(c.cout_lait / f.quantite_lait, 4) ELSE 0.0000 END,
                       CASE WHEN c.cout_lait IS NOT NULL AND f.quantite_lait > 0
                            THEN 'Lot historique créé automatiquement ; coût unitaire repris du snapshot final.'
                            ELSE 'Lot historique créé automatiquement ; coût historique indéterminable, initialisé à 0 €/L.' END
                FROM fabrication f
                LEFT JOIN cout_production_lot c ON c.fabrication_id = f.id
                WHERE NOT EXISTS (SELECT 1 FROM utilisation_lot_lait u WHERE u.fabrication_id = f.id)
                  AND NOT EXISTS (SELECT 1 FROM lot_lait l WHERE l.numero_lot = 'HIST-LAIT-' || f.id)
                """);
        jdbc.update("""
                INSERT INTO utilisation_lot_lait(fabrication_id, lot_lait_id, quantite_utilisee)
                SELECT f.id, l.id, f.quantite_lait
                FROM fabrication f
                JOIN lot_lait l ON l.numero_lot = 'HIST-LAIT-' || f.id
                WHERE NOT EXISTS (SELECT 1 FROM utilisation_lot_lait u WHERE u.fabrication_id = f.id)
                """);
    }

    private record LotHistorique(Long id, String numero, LocalDate date) {}
}
