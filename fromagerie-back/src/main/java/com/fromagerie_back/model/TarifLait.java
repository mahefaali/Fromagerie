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
@Table(name = "tarif_lait")
public class TarifLait {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TypeSaison saison;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "prix_par_litre", nullable = false, precision = 19, scale = 4)
    private BigDecimal prixParLitre;

    @NotNull
    @Column(name = "date_debut_validite", nullable = false)
    private LocalDate dateDebutValidite;

    @Column(name = "date_fin_validite")
    private LocalDate dateFinValidite;

    @Column(nullable = false)
    private boolean actif = true;

    public Long getId() {
        return id;
    }

    public TypeSaison getSaison() {
        return saison;
    }

    public void setSaison(TypeSaison saison) {
        this.saison = saison;
    }

    public BigDecimal getPrixParLitre() {
        return prixParLitre;
    }

    public void setPrixParLitre(BigDecimal prixParLitre) {
        this.prixParLitre = prixParLitre;
    }

    public LocalDate getDateDebutValidite() {
        return dateDebutValidite;
    }

    public void setDateDebutValidite(LocalDate dateDebutValidite) {
        this.dateDebutValidite = dateDebutValidite;
    }

    public LocalDate getDateFinValidite() {
        return dateFinValidite;
    }

    public void setDateFinValidite(LocalDate dateFinValidite) {
        this.dateFinValidite = dateFinValidite;
    }

    public boolean isActif() {
        return actif;
    }

    public void setActif(boolean actif) {
        this.actif = actif;
    }
}
