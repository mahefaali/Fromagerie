package com.fromagerie_back.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(
        name = "uk_etagere_cave_numero", columnNames = { "cave_id", "numero" }))
public class Etagere {

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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cave_id", nullable = false)
    private Cave cave;

    @OneToMany(mappedBy = "etagere", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordre ASC, numero ASC")
    private List<Rangee> rangees = new ArrayList<>();

    public Long getId() { return id; }
    public Integer getNumero() { return numero; }
    public Integer getOrdre() { return ordre; }
    public Cave getCave() { return cave; }
    public List<Rangee> getRangees() { return rangees; }

    public void setNumero(Integer numero) { this.numero = numero; }
    public void setOrdre(Integer ordre) { this.ordre = ordre; }
    public void setCave(Cave cave) { this.cave = cave; }

    public void addRangee(Rangee rangee) {
        rangees.add(rangee);
        rangee.setEtagere(this);
    }
}
