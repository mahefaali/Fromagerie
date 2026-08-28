package com.fromagerie_back.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "lot_affinage", uniqueConstraints = @UniqueConstraint(
        name = "uk_lot_affinage_fabrication", columnNames = "fabrication_id"))
public class LotAffinage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fabrication_id", nullable = false, unique = true)
    private Fabrication fabrication;

    @NotNull
    @Positive
    @Column(name = "quantite_initiale", nullable = false)
    private Integer quantiteInitiale;

    @NotNull
    @Column(name = "date_mise_en_cave", nullable = false)
    private LocalDate dateMiseEnCave;

    @NotNull
    @Column(name = "date_sortie_prevue", nullable = false)
    private LocalDate dateSortiePrevue;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatutLotAffinage statut;

    public Long getId() { return id; }
    public Fabrication getFabrication() { return fabrication; }
    public Integer getQuantiteInitiale() { return quantiteInitiale; }
    public LocalDate getDateMiseEnCave() { return dateMiseEnCave; }
    public LocalDate getDateSortiePrevue() { return dateSortiePrevue; }
    public StatutLotAffinage getStatut() { return statut; }

    public void setFabrication(Fabrication fabrication) { this.fabrication = fabrication; }
    public void setQuantiteInitiale(Integer quantiteInitiale) { this.quantiteInitiale = quantiteInitiale; }
    public void setDateMiseEnCave(LocalDate dateMiseEnCave) { this.dateMiseEnCave = dateMiseEnCave; }
    public void setDateSortiePrevue(LocalDate dateSortiePrevue) { this.dateSortiePrevue = dateSortiePrevue; }
    public void setStatut(StatutLotAffinage statut) { this.statut = statut; }
}
