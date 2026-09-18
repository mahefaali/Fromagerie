package com.fromagerie_back.model;

import java.math.BigDecimal;
import jakarta.persistence.*;

@Entity
@Table(name="utilisation_lot_lait", uniqueConstraints=@UniqueConstraint(name="uk_utilisation_fabrication_lot", columnNames={"fabrication_id","lot_lait_id"}), indexes={@Index(name="idx_utilisation_fabrication",columnList="fabrication_id"),@Index(name="idx_utilisation_lot",columnList="lot_lait_id")})
public class UtilisationLotLait {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="fabrication_id",nullable=false) private Fabrication fabrication;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="lot_lait_id",nullable=false) private LotLait lotLait;
    @Column(name="quantite_utilisee",nullable=false,precision=19,scale=4) private BigDecimal quantiteUtilisee;
    public Long getId(){return id;} public Fabrication getFabrication(){return fabrication;} public void setFabrication(Fabrication v){fabrication=v;}
    public LotLait getLotLait(){return lotLait;} public void setLotLait(LotLait v){lotLait=v;}
    public BigDecimal getQuantiteUtilisee(){return quantiteUtilisee;} public void setQuantiteUtilisee(BigDecimal v){quantiteUtilisee=v;}
}
