package com.fromagerie_back.model;

import java.math.BigDecimal;
import jakarta.persistence.*;

@Entity @Table(name = "ligne_commande")
public class LigneCommande {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) private Commande commande;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) private Fromage fromage;
    @Column(nullable=false) private Integer quantiteCommandee;
    @Column(nullable=false, precision=19, scale=2) private BigDecimal prixUnitaire;
    public Long getId(){return id;} public Commande getCommande(){return commande;} public void setCommande(Commande v){commande=v;} public Fromage getFromage(){return fromage;} public void setFromage(Fromage v){fromage=v;} public Integer getQuantiteCommandee(){return quantiteCommandee;} public void setQuantiteCommandee(Integer v){quantiteCommandee=v;} public BigDecimal getPrixUnitaire(){return prixUnitaire;} public void setPrixUnitaire(BigDecimal v){prixUnitaire=v;}
}
