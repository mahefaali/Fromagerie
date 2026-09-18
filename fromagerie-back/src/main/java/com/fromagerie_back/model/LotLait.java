package com.fromagerie_back.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "lot_lait", indexes = @Index(name = "idx_lot_lait_numero", columnList = "numero_lot", unique = true))
public class LotLait {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "numero_lot", nullable = false, unique = true, length = 80) private String numeroLot;
    @Column(name = "date_traite", nullable = false) private LocalDateTime dateTraite;
    @Enumerated(EnumType.STRING) @Column(name = "type_traite", nullable = false, length = 10) private TypeTraite typeTraite;
    @Column(nullable = false, precision = 19, scale = 4) private BigDecimal quantite;
    @Column(columnDefinition = "TEXT") private String observations;
    public Long getId(){return id;} public String getNumeroLot(){return numeroLot;} public void setNumeroLot(String v){numeroLot=v;}
    public LocalDateTime getDateTraite(){return dateTraite;} public void setDateTraite(LocalDateTime v){dateTraite=v;}
    public TypeTraite getTypeTraite(){return typeTraite;} public void setTypeTraite(TypeTraite v){typeTraite=v;}
    public BigDecimal getQuantite(){return quantite;} public void setQuantite(BigDecimal v){quantite=v;}
    public String getObservations(){return observations;} public void setObservations(String v){observations=v;}
}
