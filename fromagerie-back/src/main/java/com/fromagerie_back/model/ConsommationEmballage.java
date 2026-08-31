package com.fromagerie_back.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "consommation_emballage")
public class ConsommationEmballage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lot_affinage_id", nullable = false)
    private LotAffinage lotAffinage;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "emballage_id", nullable = false)
    private Emballage emballage;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer quantite;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EtapeEmballage etape;

    @NotNull
    @Column(name = "date_heure", nullable = false)
    private LocalDateTime dateHeure;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @NotNull
    @Column(name = "cout_unitaire_reference", nullable = false, precision = 19, scale = 4)
    private BigDecimal coutUnitaireReference;

    public Long getId() {
        return id;
    }

    public LotAffinage getLotAffinage() {
        return lotAffinage;
    }

    public void setLotAffinage(LotAffinage lotAffinage) {
        this.lotAffinage = lotAffinage;
    }

    public Emballage getEmballage() {
        return emballage;
    }

    public void setEmballage(Emballage emballage) {
        this.emballage = emballage;
    }

    public Integer getQuantite() {
        return quantite;
    }

    public void setQuantite(Integer quantite) {
        this.quantite = quantite;
    }

    public EtapeEmballage getEtape() {
        return etape;
    }

    public void setEtape(EtapeEmballage etape) {
        this.etape = etape;
    }

    public LocalDateTime getDateHeure() {
        return dateHeure;
    }

    public void setDateHeure(LocalDateTime dateHeure) {
        this.dateHeure = dateHeure;
    }

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    public BigDecimal getCoutUnitaireReference() {
        return coutUnitaireReference;
    }

    public void setCoutUnitaireReference(BigDecimal coutUnitaireReference) {
        this.coutUnitaireReference = coutUnitaireReference;
    }
}
