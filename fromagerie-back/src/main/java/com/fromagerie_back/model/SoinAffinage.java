package com.fromagerie_back.model;

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

@Entity
@Table(name = "soin_affinage")
public class SoinAffinage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lot_affinage_id", nullable = false)
    private LotAffinage lotAffinage;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TypeSoinAffinage type;

    @NotNull
    @Column(name = "date_heure", nullable = false)
    private LocalDateTime dateHeure;

    @Column(length = 1000)
    private String observation;

    @Column(name = "etat_croute", length = 255)
    private String etatCroute;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    public Long getId() { return id; }
    public LotAffinage getLotAffinage() { return lotAffinage; }
    public TypeSoinAffinage getType() { return type; }
    public LocalDateTime getDateHeure() { return dateHeure; }
    public String getObservation() { return observation; }
    public String getEtatCroute() { return etatCroute; }
    public Utilisateur getUtilisateur() { return utilisateur; }

    public void setLotAffinage(LotAffinage lotAffinage) { this.lotAffinage = lotAffinage; }
    public void setType(TypeSoinAffinage type) { this.type = type; }
    public void setDateHeure(LocalDateTime dateHeure) { this.dateHeure = dateHeure; }
    public void setObservation(String observation) { this.observation = observation; }
    public void setEtatCroute(String etatCroute) { this.etatCroute = etatCroute; }
    public void setUtilisateur(Utilisateur utilisateur) { this.utilisateur = utilisateur; }
}
