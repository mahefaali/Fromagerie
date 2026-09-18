package com.fromagerie_back.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name="analyse_lait", indexes=@Index(name="idx_analyse_lot",columnList="lot_lait_id"))
public class AnalyseLait {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="lot_lait_id",nullable=false) private LotLait lotLait;
    @Column(name="date_analyse",nullable=false) private LocalDateTime dateAnalyse;
    @Column(name="type_analyse",nullable=false,length=120) private String typeAnalyse;
    @Column(nullable=false,length=255) private String resultat;
    @Column(length=40) private String unite;
    @Column(length=1000) private String observation;
    public Long getId(){return id;} public LotLait getLotLait(){return lotLait;} public void setLotLait(LotLait v){lotLait=v;}
    public LocalDateTime getDateAnalyse(){return dateAnalyse;} public void setDateAnalyse(LocalDateTime v){dateAnalyse=v;}
    public String getTypeAnalyse(){return typeAnalyse;} public void setTypeAnalyse(String v){typeAnalyse=v;}
    public String getResultat(){return resultat;} public void setResultat(String v){resultat=v;}
    public String getUnite(){return unite;} public void setUnite(String v){unite=v;} public String getObservation(){return observation;} public void setObservation(String v){observation=v;}
}
