package com.fromagerie_back.model;

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
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "placement_affinage")
public class PlacementAffinage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lot_affinage_id", nullable = false)
    private LotAffinage lotAffinage;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rangee_id", nullable = false)
    private Rangee rangee;

    @NotNull
    @Positive
    @Column(name = "position_debut", nullable = false)
    private Integer positionDebut;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer quantite;

    @NotNull
    @Column(name = "date_debut", nullable = false)
    private LocalDateTime dateDebut;

    @Column(name = "date_fin")
    private LocalDateTime dateFin;

    public Long getId() { return id; }
    public LotAffinage getLotAffinage() { return lotAffinage; }
    public Rangee getRangee() { return rangee; }
    public Integer getPositionDebut() { return positionDebut; }
    public Integer getQuantite() { return quantite; }
    public LocalDateTime getDateDebut() { return dateDebut; }
    public LocalDateTime getDateFin() { return dateFin; }
    public boolean isActif() { return dateFin == null; }

    public void setLotAffinage(LotAffinage lotAffinage) { this.lotAffinage = lotAffinage; }
    public void setRangee(Rangee rangee) { this.rangee = rangee; }
    public void setPositionDebut(Integer positionDebut) { this.positionDebut = positionDebut; }
    public void setQuantite(Integer quantite) { this.quantite = quantite; }
    public void setDateDebut(LocalDateTime dateDebut) { this.dateDebut = dateDebut; }
    public void setDateFin(LocalDateTime dateFin) { this.dateFin = dateFin; }
}
