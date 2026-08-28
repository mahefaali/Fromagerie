package com.fromagerie_back.model;

import jakarta.persistence.*;

@Entity @Table(name="reservation_stock")
public class ReservationStock {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) private LigneCommande ligneCommande;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) private StockFromageFini stockFromageFini;
    @Column(nullable=false) private Integer quantiteReservee;
    public Long getId(){return id;} public LigneCommande getLigneCommande(){return ligneCommande;} public void setLigneCommande(LigneCommande v){ligneCommande=v;} public StockFromageFini getStockFromageFini(){return stockFromageFini;} public void setStockFromageFini(StockFromageFini v){stockFromageFini=v;} public Integer getQuantiteReservee(){return quantiteReservee;} public void setQuantiteReservee(Integer v){quantiteReservee=v;}
}
