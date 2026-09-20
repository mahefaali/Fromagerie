package com.fromagerie_back.config;
import org.springframework.boot.*; import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty; import org.springframework.core.annotation.Order; import org.springframework.jdbc.core.JdbcTemplate; import org.springframework.stereotype.Component;
@Component @Order(5) @ConditionalOnProperty(name="app.schema-migration.enabled",havingValue="true")
public class TracabiliteSchemaMigration implements ApplicationRunner{
 private final JdbcTemplate jdbc;public TracabiliteSchemaMigration(JdbcTemplate j){jdbc=j;}
 public void run(ApplicationArguments args){
  jdbc.execute("CREATE TABLE IF NOT EXISTS lot_lait(id BIGSERIAL PRIMARY KEY,numero_lot VARCHAR(80) NOT NULL UNIQUE,date_traite TIMESTAMP NOT NULL,type_traite VARCHAR(10) NOT NULL,quantite NUMERIC(19,4) NOT NULL,cout_unitaire NUMERIC(19,4),observations TEXT,CONSTRAINT ck_lot_lait_quantite CHECK(quantite>0),CONSTRAINT ck_lot_lait_cout CHECK(cout_unitaire>=0))");
  jdbc.execute("ALTER TABLE lot_lait ADD COLUMN IF NOT EXISTS cout_unitaire NUMERIC(19,4)");
  jdbc.execute("CREATE TABLE IF NOT EXISTS utilisation_lot_lait(id BIGSERIAL PRIMARY KEY,fabrication_id BIGINT NOT NULL REFERENCES fabrication(id),lot_lait_id BIGINT NOT NULL REFERENCES lot_lait(id),quantite_utilisee NUMERIC(19,4) NOT NULL,CONSTRAINT uk_utilisation_fabrication_lot UNIQUE(fabrication_id,lot_lait_id),CONSTRAINT ck_utilisation_quantite CHECK(quantite_utilisee>0))");
  jdbc.execute("CREATE TABLE IF NOT EXISTS analyse_lait(id BIGSERIAL PRIMARY KEY,lot_lait_id BIGINT NOT NULL REFERENCES lot_lait(id),date_analyse TIMESTAMP NOT NULL,type_analyse VARCHAR(120) NOT NULL,resultat VARCHAR(255) NOT NULL,unite VARCHAR(40),observation VARCHAR(1000))");
  jdbc.execute("CREATE INDEX IF NOT EXISTS idx_utilisation_fabrication ON utilisation_lot_lait(fabrication_id)");jdbc.execute("CREATE INDEX IF NOT EXISTS idx_utilisation_lot ON utilisation_lot_lait(lot_lait_id)");jdbc.execute("CREATE INDEX IF NOT EXISTS idx_analyse_lot ON analyse_lait(lot_lait_id)");
 }
}
