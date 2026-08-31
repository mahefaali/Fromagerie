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
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "regle_main_oeuvre")
public class RegleMainOeuvre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type_operation", nullable = false, length = 30)
    private TypeOperationMainOeuvre typeOperation;

    @NotNull
    @Positive
    @Column(name = "duree_standard_minutes", nullable = false)
    private Integer dureeStandardMinutes;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "cout_horaire", nullable = false, precision = 19, scale = 4)
    private BigDecimal coutHoraire;

    @NotNull
    @Column(name = "date_debut_validite", nullable = false)
    private LocalDate dateDebutValidite;

    @Column(name = "date_fin_validite")
    private LocalDate dateFinValidite;

    @Column(nullable = false)
    private boolean actif = true;

    public Long getId() { return id; }
    public TypeOperationMainOeuvre getTypeOperation() { return typeOperation; }
    public void setTypeOperation(TypeOperationMainOeuvre typeOperation) { this.typeOperation = typeOperation; }
    public Integer getDureeStandardMinutes() { return dureeStandardMinutes; }
    public void setDureeStandardMinutes(Integer dureeStandardMinutes) { this.dureeStandardMinutes = dureeStandardMinutes; }
    public BigDecimal getCoutHoraire() { return coutHoraire; }
    public void setCoutHoraire(BigDecimal coutHoraire) { this.coutHoraire = coutHoraire; }
    public LocalDate getDateDebutValidite() { return dateDebutValidite; }
    public void setDateDebutValidite(LocalDate dateDebutValidite) { this.dateDebutValidite = dateDebutValidite; }
    public LocalDate getDateFinValidite() { return dateFinValidite; }
    public void setDateFinValidite(LocalDate dateFinValidite) { this.dateFinValidite = dateFinValidite; }
    public boolean isActif() { return actif; }
    public void setActif(boolean actif) { this.actif = actif; }
}
