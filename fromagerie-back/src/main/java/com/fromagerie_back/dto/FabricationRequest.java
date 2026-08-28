package com.fromagerie_back.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fromagerie_back.model.OrigineLait;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class FabricationRequest {

    @NotNull
    @PastOrPresent(message = "La date de début ne peut pas être dans le futur")
    private LocalDateTime dateHeureDebut;

    private Long recetteId;

    @NotNull
    @Positive
    @DecimalMax(value = "10000", message = "La quantité de lait dépasse la capacité maximale autorisée")
    private BigDecimal quantiteLait;

    @NotNull
    @DecimalMin(value = "-50", message = "La température doit être supérieure ou égale à -50 °C")
    @DecimalMax(value = "200", message = "La température ne peut pas dépasser 200 °C")
    private BigDecimal temperatureLait;

    @NotNull
    private OrigineLait origineLait;

    @NotNull
    @DecimalMin(value = "-50", message = "La température doit être supérieure ou égale à -50 °C")
    @DecimalMax(value = "200", message = "La température ne peut pas dépasser 200 °C")
    private BigDecimal temperatureChauffage;

    @NotNull
    @Positive
    @Max(value = 10080, message = "La durée ne peut pas dépasser 10080 minutes")
    private Integer dureeChauffageMinutes;

    @NotBlank
    @Size(max = 255, message = "Le type de présure ne peut pas dépasser 255 caractères")
    private String typePresure;

    @NotNull
    @Positive
    @DecimalMax(value = "100000", message = "La quantité de présure dépasse la limite technique autorisée")
    private BigDecimal quantitePresure;

    @NotBlank
    @Size(max = 255, message = "Le type de ferments ne peut pas dépasser 255 caractères")
    private String typeFerments;

    @NotNull
    @Positive
    @DecimalMax(value = "100000", message = "La quantité de ferments dépasse la limite technique autorisée")
    private BigDecimal quantiteFerments;

    @NotNull
    @DecimalMin(value = "-50", message = "La température doit être supérieure ou égale à -50 °C")
    @DecimalMax(value = "200", message = "La température ne peut pas dépasser 200 °C")
    private BigDecimal temperatureMiseEnMoule;

    @NotNull
    @Positive
    @Max(value = 10080, message = "La durée ne peut pas dépasser 10080 minutes")
    private Integer dureeEgouttageMinutes;

    @NotNull
    @Positive
    @DecimalMax(value = "10000", message = "Le poids total dépasse la capacité maximale autorisée")
    private BigDecimal poidsTotalFromages;

    @NotNull
    @Positive
    @Max(value = 100000, message = "Le nombre de fromages dépasse la limite technique autorisée")
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
