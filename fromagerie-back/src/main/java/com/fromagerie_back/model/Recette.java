package com.fromagerie_back.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(
        name = "uk_recette_variante_version",
        columnNames = { "variante_key", "numero_version" }))
public class Recette {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fromage_id", nullable = false)
    private Fromage fromage;

    @Column(name = "variante_key", length = 36, updatable = false)
    private String varianteKey;

    @Column(name = "numero_version")
    private Integer numeroVersion;

    private Boolean active;

    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "cout_matiere_estime", precision = 19, scale = 2)
    private BigDecimal coutMatiereEstime;

    @Column(name = "frequence_retournement_jours")
    private Integer frequenceRetournementJours;

    @OneToMany(mappedBy = "recette", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecetteIngredient> ingredients = new ArrayList<>();

    @OneToMany(mappedBy = "recette", fetch = FetchType.LAZY)
    private List<Fabrication> fabrications = new ArrayList<>();

    public Recette() {
    }

    public Recette(String nom) {
        this.nom = nom;
    }

    @PrePersist
    void initializeVersionMetadata() {
        if (varianteKey == null) {
            varianteKey = UUID.randomUUID().toString();
        }
        if (numeroVersion == null) {
            numeroVersion = 1;
        }
        if (active == null) {
            active = true;
        }
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
        if (coutMatiereEstime == null) {
            coutMatiereEstime = BigDecimal.ZERO.setScale(2);
        }
        if (frequenceRetournementJours != null && frequenceRetournementJours <= 0) {
            frequenceRetournementJours = null;
        }
    }

    public Long getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public Fromage getFromage() {
        return fromage;
    }

    public void setFromage(Fromage fromage) {
        this.fromage = fromage;
    }

    public List<Fabrication> getFabrications() {
        return fabrications;
    }

    public String getVarianteKey() {
        return varianteKey;
    }

    public Integer getNumeroVersion() {
        return numeroVersion;
    }

    public boolean isActive() {
        return active == null || active;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public BigDecimal getCoutMatiereEstime() {
        return coutMatiereEstime == null ? BigDecimal.ZERO.setScale(2) : coutMatiereEstime;
    }

    public Integer getFrequenceRetournementJours() {
        return frequenceRetournementJours;
    }

    public List<RecetteIngredient> getIngredients() {
        return ingredients;
    }

    public void addFabrication(Fabrication fabrication) {
        fabrications.add(fabrication);
        fabrication.setRecette(this);
    }

    public void setVarianteKey(String varianteKey) {
        this.varianteKey = varianteKey;
    }

    public void setNumeroVersion(Integer numeroVersion) {
        this.numeroVersion = numeroVersion;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public void setCoutMatiereEstime(BigDecimal coutMatiereEstime) {
        this.coutMatiereEstime = coutMatiereEstime;
    }

    public void setFrequenceRetournementJours(Integer frequenceRetournementJours) {
        this.frequenceRetournementJours = frequenceRetournementJours;
    }

    public void addIngredient(RecetteIngredient ingredient) {
        ingredients.add(ingredient);
        ingredient.setRecette(this);
    }
}
