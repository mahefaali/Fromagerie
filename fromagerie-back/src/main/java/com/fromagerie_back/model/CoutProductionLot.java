package com.fromagerie_back.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "cout_production_lot")
public class CoutProductionLot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fabrication_id", nullable = false, unique = true)
    private Fabrication fabrication;

    @Column(name = "cout_lait", nullable = false, precision = 19, scale = 4)
    private BigDecimal coutLait;
    @Column(name = "cout_matieres", nullable = false, precision = 19, scale = 4)
    private BigDecimal coutMatieres;
    @Column(name = "cout_emballage", nullable = false, precision = 19, scale = 4)
    private BigDecimal coutEmballage;
    @Column(name = "cout_energie", nullable = false, precision = 19, scale = 4)
    private BigDecimal coutEnergie;
    @Column(name = "cout_main_oeuvre", nullable = false, precision = 19, scale = 4)
    private BigDecimal coutMainOeuvre;
    @Column(name = "cout_amortissement", nullable = false, precision = 19, scale = 4)
    private BigDecimal coutAmortissement;
    @Column(name = "cout_total", nullable = false, precision = 19, scale = 4)
    private BigDecimal coutTotal;
    @Column(name = "cout_par_kg", nullable = false, precision = 19, scale = 4)
    private BigDecimal coutParKg;
    @Column(name = "cout_par_unite", nullable = false, precision = 19, scale = 4)
    private BigDecimal coutParUnite;
    @Column(name = "nombre_unites_finales", nullable = false)
    private Integer nombreUnitesFinales;
    @Column(name = "date_calcul", nullable = false)
    private LocalDateTime dateCalcul;

    public Long getId() { return id; }
    public Fabrication getFabrication() { return fabrication; }
    public BigDecimal getCoutLait() { return coutLait; }
    public BigDecimal getCoutMatieres() { return coutMatieres; }
    public BigDecimal getCoutEmballage() { return coutEmballage; }
    public BigDecimal getCoutEnergie() { return coutEnergie; }
    public BigDecimal getCoutMainOeuvre() { return coutMainOeuvre; }
    public BigDecimal getCoutAmortissement() { return coutAmortissement; }
    public BigDecimal getCoutTotal() { return coutTotal; }
    public BigDecimal getCoutParKg() { return coutParKg; }
    public BigDecimal getCoutParUnite() { return coutParUnite; }
    public Integer getNombreUnitesFinales() { return nombreUnitesFinales; }
    public LocalDateTime getDateCalcul() { return dateCalcul; }
    public void setFabrication(Fabrication fabrication) { this.fabrication = fabrication; }
    public void setCoutLait(BigDecimal value) { coutLait = value; }
    public void setCoutMatieres(BigDecimal value) { coutMatieres = value; }
    public void setCoutEmballage(BigDecimal value) { coutEmballage = value; }
    public void setCoutEnergie(BigDecimal value) { coutEnergie = value; }
    public void setCoutMainOeuvre(BigDecimal value) { coutMainOeuvre = value; }
    public void setCoutAmortissement(BigDecimal value) { coutAmortissement = value; }
    public void setCoutTotal(BigDecimal value) { coutTotal = value; }
    public void setCoutParKg(BigDecimal value) { coutParKg = value; }
    public void setCoutParUnite(BigDecimal value) { coutParUnite = value; }
    public void setNombreUnitesFinales(Integer value) { nombreUnitesFinales = value; }
    public void setDateCalcul(LocalDateTime value) { dateCalcul = value; }
}
