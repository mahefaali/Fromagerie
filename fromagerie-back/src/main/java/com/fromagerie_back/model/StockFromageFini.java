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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "stock_fromage_fini")
public class StockFromageFini {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lot_affinage_id", nullable = false, unique = true)
    private LotAffinage lotAffinage;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "emplacement_stock_id", nullable = false)
    private EmplacementStock emplacementStock;

    @NotNull
    @Column(name = "date_entree_stock", nullable = false)
    private LocalDate dateEntreeStock;

    @NotNull
    @Positive
    @Column(name = "quantite_initiale", nullable = false)
    private Integer quantiteInitiale;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type_date_durabilite", nullable = false, length = 10)
    private TypeDateDurabilite typeDateDurabilite;

    @NotNull
    @Column(name = "date_durabilite", nullable = false)
    private LocalDate dateDurabilite;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutStockFromageFini statut;

    public Long getId() {
        return id;
    }

    public LotAffinage getLotAffinage() {
        return lotAffinage;
    }

    public void setLotAffinage(LotAffinage lotAffinage) {
        this.lotAffinage = lotAffinage;
    }

    public EmplacementStock getEmplacementStock() {
        return emplacementStock;
    }

    public void setEmplacementStock(EmplacementStock emplacementStock) {
        this.emplacementStock = emplacementStock;
    }

    public LocalDate getDateEntreeStock() {
        return dateEntreeStock;
    }

    public void setDateEntreeStock(LocalDate dateEntreeStock) {
        this.dateEntreeStock = dateEntreeStock;
    }

    public Integer getQuantiteInitiale() {
        return quantiteInitiale;
    }

    public void setQuantiteInitiale(Integer quantiteInitiale) {
        this.quantiteInitiale = quantiteInitiale;
    }

    public TypeDateDurabilite getTypeDateDurabilite() {
        return typeDateDurabilite;
    }

    public void setTypeDateDurabilite(TypeDateDurabilite typeDateDurabilite) {
        this.typeDateDurabilite = typeDateDurabilite;
    }

    public LocalDate getDateDurabilite() {
        return dateDurabilite;
    }

    public void setDateDurabilite(LocalDate dateDurabilite) {
        this.dateDurabilite = dateDurabilite;
    }

    public StatutStockFromageFini getStatut() {
        return statut;
    }

    public void setStatut(StatutStockFromageFini statut) {
        this.statut = statut;
    }
}
