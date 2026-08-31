package com.fromagerie_back.model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "emballage", uniqueConstraints = @UniqueConstraint(name = "uk_emballage_nom", columnNames = "nom"))
public class Emballage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 120)
    private String nom;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "cout_unitaire", nullable = false, precision = 19, scale = 4)
    private BigDecimal coutUnitaire;

    @NotBlank
    @Column(nullable = false, length = 40)
    private String unite;

    @Column(nullable = false)
    private boolean actif = true;

    public Long getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public BigDecimal getCoutUnitaire() {
        return coutUnitaire;
    }

    public void setCoutUnitaire(BigDecimal coutUnitaire) {
        this.coutUnitaire = coutUnitaire;
    }

    public String getUnite() {
        return unite;
    }

    public void setUnite(String unite) {
        this.unite = unite;
    }

    public boolean isActif() {
        return actif;
    }

    public void setActif(boolean actif) {
        this.actif = actif;
    }
}
