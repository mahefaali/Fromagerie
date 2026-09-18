package com.fromagerie_back.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.persistence.FetchType;

@Entity
public class Fabrication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numeroLot;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime dateHeureDebut;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recette_id", nullable = false)
    private Recette recette;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal quantiteLait;

    @NotNull
    @Column(nullable = false)
    private BigDecimal temperatureLait;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrigineLait origineLait;

    @NotNull
    @Column(nullable = false)
    private BigDecimal temperatureChauffage;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer dureeChauffageMinutes;

    @NotBlank
    @Column(nullable = false)
    private String typePresure;

    @NotNull
    @Positive
    @Column(nullable = false)
    private BigDecimal quantitePresure;

    @NotBlank
    @Column(nullable = false)
    private String typeFerments;

    @NotNull
    @Positive
    @Column(nullable = false)
    private BigDecimal quantiteFerments;

    @NotNull
    @Column(nullable = false)
    private BigDecimal temperatureMiseEnMoule;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer dureeEgouttageMinutes;

    @NotNull
    @Positive
    @Column(nullable = false)
    private BigDecimal poidsTotalFromages;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal rendement;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer nombreFromages;

    @ManyToOne(fetch = FetchType.LAZY)
    // The legacy database can contain batches recorded before operator traceability existed.
    @JoinColumn(name = "operateur_id")
    private Utilisateur operateur;

    @Column(columnDefinition = "TEXT")
    private String observations;

    public Long getId() {
        return id;
    }

    public String getNumeroLot() {
        return numeroLot;
    }

    public LocalDateTime getDateHeureDebut() {
        return dateHeureDebut;
    }

    public Recette getRecette() {
        return recette;
    }

    public BigDecimal getQuantiteLait() {
        return quantiteLait;
    }

    public BigDecimal getTemperatureLait() {
        return temperatureLait;
    }

    public OrigineLait getOrigineLait() {
        return origineLait;
    }

    public BigDecimal getTemperatureChauffage() {
        return temperatureChauffage;
    }

    public Integer getDureeChauffageMinutes() {
        return dureeChauffageMinutes;
    }

    public String getTypePresure() {
        return typePresure;
    }

    public BigDecimal getQuantitePresure() {
        return quantitePresure;
    }

    public String getTypeFerments() {
        return typeFerments;
    }

    public BigDecimal getQuantiteFerments() {
        return quantiteFerments;
    }

    public BigDecimal getTemperatureMiseEnMoule() {
        return temperatureMiseEnMoule;
    }

    public Integer getDureeEgouttageMinutes() {
        return dureeEgouttageMinutes;
    }

    public BigDecimal getPoidsTotalFromages() {
        return poidsTotalFromages;
    }

    public BigDecimal getRendement() {
        return rendement;
    }

    public Integer getNombreFromages() {
        return nombreFromages;
    }

    public Utilisateur getOperateur() {
        return operateur;
    }

    public String getObservations() {
        return observations;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNumeroLot(String numeroLot) {
        this.numeroLot = numeroLot;
    }

    public void setDateHeureDebut(LocalDateTime dateHeureDebut) {
        this.dateHeureDebut = dateHeureDebut;
    }

    public void setRecette(Recette recette) {
        this.recette = recette;
    }

    public void setQuantiteLait(BigDecimal quantiteLait) {
        this.quantiteLait = quantiteLait;
    }

    public void setTemperatureLait(BigDecimal temperatureLait) {
        this.temperatureLait = temperatureLait;
    }

    public void setOrigineLait(OrigineLait origineLait) {
        this.origineLait = origineLait;
    }

    public void setTemperatureChauffage(BigDecimal temperatureChauffage) {
        this.temperatureChauffage = temperatureChauffage;
    }

    public void setDureeChauffageMinutes(Integer dureeChauffageMinutes) {
        this.dureeChauffageMinutes = dureeChauffageMinutes;
    }

    public void setTypePresure(String typePresure) {
        this.typePresure = typePresure;
    }

    public void setQuantitePresure(BigDecimal quantitePresure) {
        this.quantitePresure = quantitePresure;
    }

    public void setTypeFerments(String typeFerments) {
        this.typeFerments = typeFerments;
    }

    public void setQuantiteFerments(BigDecimal quantiteFerments) {
        this.quantiteFerments = quantiteFerments;
    }

    public void setTemperatureMiseEnMoule(BigDecimal temperatureMiseEnMoule) {
        this.temperatureMiseEnMoule = temperatureMiseEnMoule;
    }

    public void setDureeEgouttageMinutes(Integer dureeEgouttageMinutes) {
        this.dureeEgouttageMinutes = dureeEgouttageMinutes;
    }

    public void setPoidsTotalFromages(BigDecimal poidsTotalFromages) {
        this.poidsTotalFromages = poidsTotalFromages;
    }

    public void setRendement(BigDecimal rendement) {
        this.rendement = rendement;
    }

    public void setNombreFromages(Integer nombreFromages) {
        this.nombreFromages = nombreFromages;
    }

    public void setOperateur(Utilisateur operateur) {
        this.operateur = operateur;
    }

    public void setObservations(String observations) {
        this.observations = observations;
    }

}
