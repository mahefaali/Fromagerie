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
@Table(name = "perte_stock")
public class PerteStock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stock_fromage_fini_id", nullable = false)
    private StockFromageFini stockFromageFini;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_stock_id")
    private ReservationStock reservationStock;
    @NotNull @Positive
    @Column(nullable = false)
    private Integer quantite;
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TypePerteStock typePerte;
    @NotNull
    @Column(length = 500, nullable = false)
    private String motif;
    @NotNull
    @Column(nullable = false)
    private LocalDateTime dateHeure;
    @NotNull
    @Column(name = "cout_unitaire_reference", nullable = false, precision = 19, scale = 4)
    private BigDecimal coutUnitaireReference;
    @NotNull
    @Column(name = "cout_total", nullable = false, precision = 19, scale = 4)
    private BigDecimal coutTotal;
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;
    public Long getId(){return id;} public StockFromageFini getStockFromageFini(){return stockFromageFini;} public void setStockFromageFini(StockFromageFini s){this.stockFromageFini=s;} public ReservationStock getReservationStock(){return reservationStock;} public void setReservationStock(ReservationStock r){this.reservationStock=r;} public Integer getQuantite(){return quantite;} public void setQuantite(Integer q){this.quantite=q;} public TypePerteStock getTypePerte(){return typePerte;} public void setTypePerte(TypePerteStock t){this.typePerte=t;} public String getMotif(){return motif;} public void setMotif(String m){this.motif=m;} public LocalDateTime getDateHeure(){return dateHeure;} public void setDateHeure(LocalDateTime d){dateHeure=d;} public BigDecimal getCoutUnitaireReference(){return coutUnitaireReference;} public void setCoutUnitaireReference(BigDecimal c){this.coutUnitaireReference=c;} public BigDecimal getCoutTotal(){return coutTotal;} public void setCoutTotal(BigDecimal c){this.coutTotal=c;} public Utilisateur getUtilisateur(){return utilisateur;} public void setUtilisateur(Utilisateur u){this.utilisateur=u;}
}
