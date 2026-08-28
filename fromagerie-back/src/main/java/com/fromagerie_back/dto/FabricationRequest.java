package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fromagerie_back.model.OrigineLait;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class FabricationRequest {

    @NotNull
    private LocalDateTime dateHeureDebut;

    private Long recetteId;

    @NotNull
    @Positive
    private BigDecimal quantiteLait;

    @NotNull
    private BigDecimal temperatureLait;

    @NotNull
    private OrigineLait origineLait;

    @NotNull
    private BigDecimal temperatureChauffage;

    @NotNull
    @Positive
    private Integer dureeChauffageMinutes;

    @NotBlank
    private String typePresure;

    @NotNull
    @Positive
    private BigDecimal quantitePresure;

    @NotBlank
    private String typeFerments;

    @NotNull
    @Positive
    private BigDecimal quantiteFerments;

    @NotNull
    private BigDecimal temperatureMiseEnMoule;

    @NotNull
    @Positive
    private Integer dureeEgouttageMinutes;

    @NotNull
    @Positive
    private BigDecimal poidsTotalFromages;

    @NotNull
    @Positive
    private Integer nombreFromages;

    private String observations;

    public void setDateHeureDebut(LocalDateTime dateHeureDebut) {
        this.dateHeureDebut = dateHeureDebut;
    }

    public void setRecetteId(Long recetteId) {
        this.recetteId = recetteId;
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

    public void setNombreFromages(Integer nombreFromages) {
        this.nombreFromages = nombreFromages;
    }

    public void setObservations(String observations) {
        this.observations = observations;
    }

    public LocalDateTime getDateHeureDebut() {
        return dateHeureDebut;
    }

    public Long getRecetteId() {
        return recetteId;
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

    public Integer getNombreFromages() {
        return nombreFromages;
    }

    public String getObservations() {
        return observations;
    }

    

}
