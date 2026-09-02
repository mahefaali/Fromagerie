package com.fromagerie_back.model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "configuration_emballage", uniqueConstraints = @UniqueConstraint(
        name = "uk_configuration_emballage_fromage_emballage", columnNames = { "fromage_id", "emballage_id" }))
public class ConfigurationEmballage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fromage_id", nullable = false)
    private Fromage fromage;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "emballage_id", nullable = false)
    private Emballage emballage;

    @Column(name = "quantite_par_unite", nullable = false, precision = 19, scale = 4)
    private BigDecimal quantiteParUnite;

    @Column(nullable = false)
    private boolean actif = true;

    public Long getId() { return id; }
    public Fromage getFromage() { return fromage; }
    public Emballage getEmballage() { return emballage; }
    public BigDecimal getQuantiteParUnite() { return quantiteParUnite; }
    public boolean isActif() { return actif; }
    public void setFromage(Fromage fromage) { this.fromage = fromage; }
    public void setEmballage(Emballage emballage) { this.emballage = emballage; }
    public void setQuantiteParUnite(BigDecimal quantiteParUnite) { this.quantiteParUnite = quantiteParUnite; }
    public void setActif(boolean actif) { this.actif = actif; }
}
