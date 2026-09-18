package com.fromagerie_back.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;

@Entity @Table(name="livraison")
public class Livraison {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    // Nullable uniquement pour assurer la compatibilité avec les livraisons historiques.
    @Column(name="numero_livraison", unique=true, length=40) private String numeroLivraison;
    @OneToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="commande_id", unique=true) private Commande commande;
    @Column(nullable=false) private LocalDate dateLivraison;
    private String observations;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) private Utilisateur utilisateur;
    @OneToMany(mappedBy="livraison", cascade=CascadeType.ALL, orphanRemoval=true) private List<LigneLivraison> lignes=new ArrayList<>();
    public Long getId(){return id;} public String getNumeroLivraison(){return numeroLivraison;} public void setNumeroLivraison(String v){numeroLivraison=v;} public Commande getCommande(){return commande;} public void setCommande(Commande v){commande=v;} public LocalDate getDateLivraison(){return dateLivraison;} public void setDateLivraison(LocalDate v){dateLivraison=v;} public String getObservations(){return observations;} public void setObservations(String v){observations=v;} public Utilisateur getUtilisateur(){return utilisateur;} public void setUtilisateur(Utilisateur v){utilisateur=v;} public List<LigneLivraison> getLignes(){return lignes;} public void addLigne(LigneLivraison v){lignes.add(v);v.setLivraison(this);}
}
