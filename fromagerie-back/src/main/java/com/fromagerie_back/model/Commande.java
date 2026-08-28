package com.fromagerie_back.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;

@Entity
@Table(name = "commande")
public class Commande {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "numero_commande", nullable = false, unique = true) private String numeroCommande;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private Client client;
    @Column(nullable = false) private LocalDate dateCommande;
    @Column(nullable = false) private LocalDate dateLivraisonSouhaitee;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private StatutCommande statut;
    @Column(length = 1000) private String observations;
    @ManyToOne(fetch = FetchType.LAZY) private Utilisateur utilisateurCreateur;
    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, orphanRemoval = true) private List<LigneCommande> lignes = new ArrayList<>();
    public Long getId(){return id;} public String getNumeroCommande(){return numeroCommande;} public void setNumeroCommande(String v){numeroCommande=v;}
    public Client getClient(){return client;} public void setClient(Client v){client=v;} public LocalDate getDateCommande(){return dateCommande;} public void setDateCommande(LocalDate v){dateCommande=v;}
    public LocalDate getDateLivraisonSouhaitee(){return dateLivraisonSouhaitee;} public void setDateLivraisonSouhaitee(LocalDate v){dateLivraisonSouhaitee=v;} public StatutCommande getStatut(){return statut;} public void setStatut(StatutCommande v){statut=v;}
    public String getObservations(){return observations;} public void setObservations(String v){observations=v;} public Utilisateur getUtilisateurCreateur(){return utilisateurCreateur;} public void setUtilisateurCreateur(Utilisateur v){utilisateurCreateur=v;}
    public List<LigneCommande> getLignes(){return lignes;} public void addLigne(LigneCommande ligne){lignes.add(ligne); ligne.setCommande(this);}
}
