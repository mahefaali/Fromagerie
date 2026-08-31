package com.fromagerie_back.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "regle_cout_energie")
public class RegleCoutEnergie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type_operation", nullable = false, length = 30)
    private TypeOperationEnergie typeOperation;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "cout_standard", nullable = false, precision = 19, scale = 4)
    private BigDecimal coutStandard;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "unite_calcul", nullable = false, length = 30)
    private UniteCalculEnergie uniteCalcul;

    @NotNull
    @Column(name = "date_debut_validite", nullable = false)
    private LocalDate dateDebutValidite;

    @Column(name = "date_fin_validite")
    private LocalDate dateFinValidite;

    @Column(nullable = false)
    private boolean actif = true;

    public Long getId() { return id; }
    public TypeOperationEnergie getTypeOperation() { return typeOperation; }
    public void setTypeOperation(TypeOperationEnergie typeOperation) { this.typeOperation = typeOperation; }
    public BigDecimal getCoutStandard() { return coutStandard; }
    public void setCoutStandard(BigDecimal coutStandard) { this.coutStandard = coutStandard; }
    public UniteCalculEnergie getUniteCalcul() { return uniteCalcul; }
    public void setUniteCalcul(UniteCalculEnergie uniteCalcul) { this.uniteCalcul = uniteCalcul; }
    public LocalDate getDateDebutValidite() { return dateDebutValidite; }
    public void setDateDebutValidite(LocalDate dateDebutValidite) { this.dateDebutValidite = dateDebutValidite; }
    public LocalDate getDateFinValidite() { return dateFinValidite; }
    public void setDateFinValidite(LocalDate dateFinValidite) { this.dateFinValidite = dateFinValidite; }
    public boolean isActif() { return actif; }
    public void setActif(boolean actif) { this.actif = actif; }
}
