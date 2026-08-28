package com.fromagerie_back.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.persistence.*;

@Entity @Table(name="facture")
public class Facture {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="numero_facture",nullable=false,unique=true) private String numeroFacture;
    @OneToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="commande_id",unique=true) private Commande commande;
    @Column(nullable=false) private LocalDate dateFacture;
    @Column(nullable=false,precision=19,scale=2) private BigDecimal total;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private ModePaiement modePaiement;
    public Long getId(){return id;} public String getNumeroFacture(){return numeroFacture;} public void setNumeroFacture(String v){numeroFacture=v;} public Commande getCommande(){return commande;} public void setCommande(Commande v){commande=v;} public LocalDate getDateFacture(){return dateFacture;} public void setDateFacture(LocalDate v){dateFacture=v;} public BigDecimal getTotal(){return total;} public void setTotal(BigDecimal v){total=v;} public ModePaiement getModePaiement(){return modePaiement;} public void setModePaiement(ModePaiement v){modePaiement=v;}
}
