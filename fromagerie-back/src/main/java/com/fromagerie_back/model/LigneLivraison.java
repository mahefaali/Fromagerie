package com.fromagerie_back.model;

import jakarta.persistence.*;

@Entity @Table(name="ligne_livraison")
public class LigneLivraison {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) private Livraison livraison;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) private LigneCommande ligneCommande;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) private StockFromageFini stockFromageFini;
    @Column(nullable=false) private Integer quantitePrevue;
    @Column(nullable=false) private Integer quantiteLivree;
    public Long getId(){return id;} public Livraison getLivraison(){return livraison;} public void setLivraison(Livraison v){livraison=v;} public LigneCommande getLigneCommande(){return ligneCommande;} public void setLigneCommande(LigneCommande v){ligneCommande=v;} public StockFromageFini getStockFromageFini(){return stockFromageFini;} public void setStockFromageFini(StockFromageFini v){stockFromageFini=v;} public Integer getQuantitePrevue(){return quantitePrevue;} public void setQuantitePrevue(Integer v){quantitePrevue=v;} public Integer getQuantiteLivree(){return quantiteLivree;} public void setQuantiteLivree(Integer v){quantiteLivree=v;}
}
