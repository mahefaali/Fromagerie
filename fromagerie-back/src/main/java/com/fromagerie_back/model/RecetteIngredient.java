package com.fromagerie_back.model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(
        name = "recette_ingredient",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_recette_ingredient_matiere",
                columnNames = { "recette_id", "matiere_premiere_id" }))
public class RecetteIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recette_id", nullable = false)
    private Recette recette;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "matiere_premiere_id", nullable = false)
    private MatierePremiere matierePremiere;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal quantite;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UniteMesure unite;

    @NotNull
    @Column(name = "cout_unitaire_reference", nullable = false, precision = 19, scale = 4)
    private BigDecimal coutUnitaireReference;

    public Long getId() {
        return id;
    }

    public Recette getRecette() {
        return recette;
    }

    public MatierePremiere getMatierePremiere() {
        return matierePremiere;
    }

    public BigDecimal getQuantite() {
        return quantite;
    }

    public UniteMesure getUnite() {
        return unite;
    }

    public BigDecimal getCoutUnitaireReference() {
        return coutUnitaireReference;
    }

    public void setRecette(Recette recette) {
        this.recette = recette;
    }

    public void setMatierePremiere(MatierePremiere matierePremiere) {
        this.matierePremiere = matierePremiere;
    }

    public void setQuantite(BigDecimal quantite) {
        this.quantite = quantite;
    }

    public void setUnite(UniteMesure unite) {
        this.unite = unite;
    }

    public void setCoutUnitaireReference(BigDecimal coutUnitaireReference) {
        this.coutUnitaireReference = coutUnitaireReference;
    }
}
