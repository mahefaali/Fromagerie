package com.fromagerie_back.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(
        name = "uk_rangee_etagere_numero", columnNames = { "etagere_id", "numero" }))
public class Rangee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer numero;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer ordre;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer capacite;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "etagere_id", nullable = false)
    private Etagere etagere;

    public Long getId() { return id; }
    public Integer getNumero() { return numero; }
    public Integer getOrdre() { return ordre; }
    public Integer getCapacite() { return capacite; }
    public Etagere getEtagere() { return etagere; }

    public void setNumero(Integer numero) { this.numero = numero; }
    public void setOrdre(Integer ordre) { this.ordre = ordre; }
    public void setCapacite(Integer capacite) { this.capacite = capacite; }
    public void setEtagere(Etagere etagere) { this.etagere = etagere; }
}
