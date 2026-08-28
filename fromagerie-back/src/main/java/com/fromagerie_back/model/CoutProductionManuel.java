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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

@Entity
@Table(name = "cout_production_manuel")
public class CoutProductionManuel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fromage_id", nullable = false, unique = true)
    private Fromage fromage;

    @NotNull
    @PositiveOrZero
    @Column(name = "cout_unitaire", nullable = false, precision = 19, scale = 4)
    private BigDecimal coutUnitaire;

    @NotNull
    @Column(name = "date_mise_a_jour", nullable = false)
    private LocalDateTime dateMiseAJour;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_modification_id")
    private Utilisateur utilisateurModification;

    public Long getId() { return id; }
    public Fromage getFromage() { return fromage; }
    public void setFromage(Fromage fromage) { this.fromage = fromage; }
    public BigDecimal getCoutUnitaire() { return coutUnitaire; }
    public void setCoutUnitaire(BigDecimal coutUnitaire) { this.coutUnitaire = coutUnitaire; }
    public LocalDateTime getDateMiseAJour() { return dateMiseAJour; }
    public void setDateMiseAJour(LocalDateTime dateMiseAJour) { this.dateMiseAJour = dateMiseAJour; }
    public Utilisateur getUtilisateurModification() { return utilisateurModification; }
    public void setUtilisateurModification(Utilisateur utilisateurModification) { this.utilisateurModification = utilisateurModification; }
}
