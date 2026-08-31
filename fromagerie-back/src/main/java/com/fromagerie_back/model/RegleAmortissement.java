package com.fromagerie_back.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "regle_amortissement")
public class RegleAmortissement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipement_id", nullable = false)
    private Equipement equipement;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "cout_par_fabrication", nullable = false, precision = 19, scale = 4)
    private BigDecimal coutParFabrication;

    @NotNull
    @Column(name = "date_debut_validite", nullable = false)
    private LocalDate dateDebutValidite;

    @Column(name = "date_fin_validite")
    private LocalDate dateFinValidite;

    @Column(nullable = false)
    private boolean actif = true;

    public Long getId() { return id; }
    public Equipement getEquipement() { return equipement; }
    public void setEquipement(Equipement equipement) { this.equipement = equipement; }
    public BigDecimal getCoutParFabrication() { return coutParFabrication; }
    public void setCoutParFabrication(BigDecimal coutParFabrication) { this.coutParFabrication = coutParFabrication; }
    public LocalDate getDateDebutValidite() { return dateDebutValidite; }
    public void setDateDebutValidite(LocalDate dateDebutValidite) { this.dateDebutValidite = dateDebutValidite; }
    public LocalDate getDateFinValidite() { return dateFinValidite; }
    public void setDateFinValidite(LocalDate dateFinValidite) { this.dateFinValidite = dateFinValidite; }
    public boolean isActif() { return actif; }
    public void setActif(boolean actif) { this.actif = actif; }
}
