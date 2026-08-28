package com.fromagerie_back.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

@Entity
public class Cave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 120)
    private String nom;

    @Column(length = 500)
    private String description;

    @NotNull
    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal temperature;

    @NotNull
    @DecimalMin("0")
    @DecimalMax("100")
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal humidite;

    @NotNull
    @PositiveOrZero
    @Column(name = "age_min_jours", nullable = false)
    private Integer ageMinJours;

    @NotNull
    @PositiveOrZero
    @Column(name = "age_max_jours", nullable = false)
    private Integer ageMaxJours;

    @Column(nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "cave", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordre ASC, numero ASC")
    private List<Etagere> etageres = new ArrayList<>();

    public Long getId() { return id; }
    public String getNom() { return nom; }
    public String getDescription() { return description; }
    public BigDecimal getTemperature() { return temperature; }
    public BigDecimal getHumidite() { return humidite; }
    public Integer getAgeMinJours() { return ageMinJours; }
    public Integer getAgeMaxJours() { return ageMaxJours; }
    public boolean isActive() { return active; }
    public List<Etagere> getEtageres() { return etageres; }

    public void setNom(String nom) { this.nom = nom; }
    public void setDescription(String description) { this.description = description; }
    public void setTemperature(BigDecimal temperature) { this.temperature = temperature; }
    public void setHumidite(BigDecimal humidite) { this.humidite = humidite; }
    public void setAgeMinJours(Integer ageMinJours) { this.ageMinJours = ageMinJours; }
    public void setAgeMaxJours(Integer ageMaxJours) { this.ageMaxJours = ageMaxJours; }
    public void setActive(boolean active) { this.active = active; }

    public void addEtagere(Etagere etagere) {
        etageres.add(etagere);
        etagere.setCave(this);
    }

    public void replaceEtageres(List<Etagere> nouvellesEtageres) {
        etageres.clear();
        nouvellesEtageres.forEach(this::addEtagere);
    }
}
