package com.fromagerie_back.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.fromagerie_back.dto.TracabiliteDescendanteResponse;
import com.fromagerie_back.exception.ResourceNotFoundException;
import com.fromagerie_back.model.*;
import com.fromagerie_back.repository.*;

class TracabiliteDescendanteServiceTests {
    private FabricationRepository fabrications;
    private LotAffinageRepository affinages;
    private StockFromageFiniRepository stocks;
    private LigneLivraisonRepository livraisons;
    private PlacementAffinageRepository placements;
    private MouvementStockRepository mouvements;
    private PerteStockRepository pertes;
    private ReservationStockRepository reservations;
    private TracabiliteService service;
    private Fabrication fabrication;

    @BeforeEach
    void setUp() {
        fabrications = mock(FabricationRepository.class);
        affinages = mock(LotAffinageRepository.class);
        stocks = mock(StockFromageFiniRepository.class);
        livraisons = mock(LigneLivraisonRepository.class);
        placements = mock(PlacementAffinageRepository.class);
        mouvements = mock(MouvementStockRepository.class);
        pertes = mock(PerteStockRepository.class);
        reservations = mock(ReservationStockRepository.class);
        service = new TracabiliteService(fabrications, mock(UtilisationLotLaitRepository.class),
                mock(AnalyseLaitRepository.class), affinages, stocks, livraisons, placements, mouvements, pertes);
        fabrication = fabrication(50);
        when(fabrications.findByNumeroLotContainingWithDetails("FAB-1")).thenReturn(List.of(fabrication));
        when(affinages.findByFabricationId(1L)).thenReturn(Optional.empty());
        when(stocks.findByLotAffinageFabricationId(1L)).thenReturn(Optional.empty());
        when(livraisons.findTraceByFabricationId(1L)).thenReturn(List.of());
    }

    @Test void lotInexistant() {
        assertThatThrownBy(() -> service.byNumeroLotDescendant("INCONNU"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test void fragmentDeNumeroDeLotEstAccepte() {
        when(fabrications.findByNumeroLotContainingWithDetails("AB-1")).thenReturn(List.of(fabrication));
        assertThat(service.byNumeroLotDescendant("  AB-1 ").numeroLot()).isEqualTo("FAB-1");
    }

    @Test void lotProduitEncoreEnAffinage() {
        LotAffinage lot = affinage(50);
        when(affinages.findByFabricationId(1L)).thenReturn(Optional.of(lot));
        TracabiliteDescendanteResponse result = service.byNumeroLotDescendant("FAB-1");
        assertThat(result.quantiteProduite()).isEqualTo(50);
        assertThat(result.quantiteDisponible()).isEqualTo(50);
    }

    @Test void lotEnStockJamaisLivre() {
        stock(50, 50);
        TracabiliteDescendanteResponse result = service.byNumeroLotDescendant("FAB-1");
        assertThat(result.quantiteLivree()).isZero();
        assertThat(result.clientsLivres()).isEmpty();
        assertThat(result.quantiteDisponible()).isEqualTo(50);
    }

    @Test void lotPartiellementLivre() {
        stock(50, 32);
        LigneLivraison ligne = livraison(18, 1L, "Client A", "BL-1");
        when(livraisons.findTraceByFabricationId(1L)).thenReturn(List.of(ligne));
        TracabiliteDescendanteResponse result = service.byNumeroLotDescendant("FAB-1");
        assertThat(result.quantiteLivree()).isEqualTo(18);
        assertThat(result.quantiteNonVendue()).isEqualTo(32);
    }

    @Test void lotEntierementLivre() {
        stock(50, 0);
        LigneLivraison ligne = livraison(50, 1L, "Client A", "BL-1");
        when(livraisons.findTraceByFabricationId(1L)).thenReturn(List.of(ligne));
        TracabiliteDescendanteResponse result = service.byNumeroLotDescendant("FAB-1");
        assertThat(result.quantiteNonVendue()).isZero();
        assertThat(result.quantiteDisponible()).isZero();
    }

    @Test void plusieursClientsPourLeMemeLot() {
        LigneLivraison ligneA = livraison(5, 1L, "Client A", "BL-1");
        LigneLivraison ligneB = livraison(7, 2L, "Client B", "BL-2");
        when(livraisons.findTraceByFabricationId(1L)).thenReturn(List.of(ligneA, ligneB));
        assertThat(service.byNumeroLotDescendant("FAB-1").clientsLivres()).hasSize(2);
    }

    @Test void plusieursLivraisonsAuMemeClientSontAgregees() {
        LigneLivraison ligneA = livraison(5, 1L, "Client A", "BL-1");
        LigneLivraison ligneB = livraison(7, 1L, "Client A", "BL-2");
        when(livraisons.findTraceByFabricationId(1L)).thenReturn(List.of(ligneA, ligneB));
        assertThat(service.byNumeroLotDescendant("FAB-1").clientsLivres().getFirst().quantiteLivree()).isEqualTo(12);
    }

    @Test void perteSurLeLot() {
        StockFromageFini stock = stock(50, 48);
        PerteStock perte = perte(2, stock);
        when(pertes.findByStockFromageFiniIdOrderByDateHeureAscIdAsc(10L)).thenReturn(List.of(perte));
        TracabiliteDescendanteResponse result = service.byNumeroLotDescendant("FAB-1");
        assertThat(result.quantitePerdue()).isEqualTo(2);
        assertThat(result.pertes().getFirst().motif()).isEqualTo("Défaut confirmé");
    }

    @Test void livraisonEtPerteSurLeMemeLotRestentDistinctes() {
        StockFromageFini stock = stock(50, 18);
        LigneLivraison ligne = livraison(30, 1L, "Client A", "BL-1");
        PerteStock perte = perte(2, stock);
        when(livraisons.findTraceByFabricationId(1L)).thenReturn(List.of(ligne));
        when(pertes.findByStockFromageFiniIdOrderByDateHeureAscIdAsc(10L)).thenReturn(List.of(perte));
        TracabiliteDescendanteResponse result = service.byNumeroLotDescendant("FAB-1");
        assertThat(result.quantiteLivree()).isEqualTo(30);
        assertThat(result.quantitePerdue()).isEqualTo(2);
        assertThat(result.quantiteDisponible()).isEqualTo(18);
    }

    @Test void quantiteNonVendueEstProduiteMoinsLivree() {
        LigneLivraison ligne = livraison(30, 1L, "Client A", "BL-1");
        when(livraisons.findTraceByFabricationId(1L)).thenReturn(List.of(ligne));
        assertThat(service.byNumeroLotDescendant("FAB-1").quantiteNonVendue()).isEqualTo(20);
    }

    @Test void quantiteDisponibleEstDistincteDeNonVendue() {
        stock(50, 18);
        LigneLivraison ligne = livraison(30, 1L, "Client A", "BL-1");
        when(livraisons.findTraceByFabricationId(1L)).thenReturn(List.of(ligne));
        TracabiliteDescendanteResponse result = service.byNumeroLotDescendant("FAB-1");
        assertThat(result.quantiteNonVendue()).isEqualTo(20);
        assertThat(result.quantiteDisponible()).isEqualTo(18);
    }

    @Test void reservationNestJamaisCompteeCommeLivraison() {
        service.byNumeroLotDescendant("FAB-1");
        verifyNoInteractions(reservations);
    }

    @Test void aucuneUniteNestDoubleCompteeDansLeDisponible() {
        stock(50, 18);
        LigneLivraison ligne = livraison(30, 1L, "Client A", "BL-1");
        when(livraisons.findTraceByFabricationId(1L)).thenReturn(List.of(ligne));
        TracabiliteDescendanteResponse result = service.byNumeroLotDescendant("FAB-1");
        assertThat(result.quantiteDisponible() + result.quantiteLivree()).isEqualTo(48);
    }

    @Test void localisationInterneDAffinageEstRetournee() {
        LotAffinage lot = affinage(50);
        when(affinages.findByFabricationId(1L)).thenReturn(Optional.of(lot));
        PlacementAffinage placement = placement();
        when(placements.findActiveByLotIdWithLocation(2L)).thenReturn(List.of(placement));
        TracabiliteDescendanteResponse result = service.byNumeroLotDescendant("FAB-1");
        assertThat(result.localisationsActuelles().getFirst().libelle()).contains("Cave Nord", "étagère 2", "rangée 3", "positions 4-13");
    }

    @Test void derniereDestinationConnueEstLeClientLivre() {
        LigneLivraison ligne = livraison(8, 1L, "Client A", "BL-9");
        when(livraisons.findTraceByFabricationId(1L)).thenReturn(List.of(ligne));
        TracabiliteDescendanteResponse result = service.byNumeroLotDescendant("FAB-1");
        assertThat(result.localisationsActuelles().getFirst().nature()).isEqualTo("DERNIERE_DESTINATION_CONNUE");
        assertThat(result.localisationsActuelles().getFirst().libelle()).isEqualTo("Client Client A");
        assertThat(result.localisationsActuelles().getFirst().numeroLivraison()).isEqualTo("BL-9");
    }

    private Fabrication fabrication(int quantite) {
        Fabrication f = mock(Fabrication.class); Recette recette = mock(Recette.class); Fromage fromage = mock(Fromage.class);
        when(f.getId()).thenReturn(1L); when(f.getNumeroLot()).thenReturn("FAB-1"); when(f.getNombreFromages()).thenReturn(quantite);
        when(f.getDateHeureDebut()).thenReturn(LocalDateTime.of(2026, 9, 1, 8, 0)); when(f.getRecette()).thenReturn(recette);
        when(recette.getFromage()).thenReturn(fromage); when(fromage.getNom()).thenReturn("Tomme"); return f;
    }

    private LotAffinage affinage(int quantite) {
        LotAffinage lot = mock(LotAffinage.class); when(lot.getId()).thenReturn(2L); when(lot.getQuantiteInitiale()).thenReturn(quantite); return lot;
    }

    private StockFromageFini stock(int initiale, int disponible) {
        StockFromageFini stock = mock(StockFromageFini.class); EmplacementStock emplacement = mock(EmplacementStock.class);
        when(stock.getId()).thenReturn(10L); when(stock.getQuantiteInitiale()).thenReturn(initiale); when(stock.getEmplacementStock()).thenReturn(emplacement);
        when(emplacement.getNom()).thenReturn("Chambre froide"); when(stocks.findByLotAffinageFabricationId(1L)).thenReturn(Optional.of(stock));
        when(mouvements.existsByStockFromageFiniIdAndType(10L, TypeMouvementStock.ENTREE)).thenReturn(true);
        when(mouvements.quantityAvailable(10L, java.util.EnumSet.of(TypeMouvementStock.ENTREE, TypeMouvementStock.AJUSTEMENT))).thenReturn(disponible);
        when(pertes.findByStockFromageFiniIdOrderByDateHeureAscIdAsc(10L)).thenReturn(List.of()); return stock;
    }

    private LigneLivraison livraison(int quantite, long clientId, String nom, String numero) {
        LigneLivraison ligne = mock(LigneLivraison.class); Livraison livraison = mock(Livraison.class); Commande commande = mock(Commande.class); Client client = mock(Client.class);
        when(ligne.getQuantiteLivree()).thenReturn(quantite); when(ligne.getLivraison()).thenReturn(livraison); when(livraison.getCommande()).thenReturn(commande);
        when(livraison.getNumeroLivraison()).thenReturn(numero); when(livraison.getDateLivraison()).thenReturn(LocalDate.of(2026, 9, 10));
        when(commande.getClient()).thenReturn(client); when(client.getId()).thenReturn(clientId); when(client.getNom()).thenReturn(nom); return ligne;
    }

    private PerteStock perte(int quantite, StockFromageFini stock) {
        PerteStock perte = mock(PerteStock.class); when(perte.getId()).thenReturn(20L); when(perte.getStockFromageFini()).thenReturn(stock);
        when(perte.getQuantite()).thenReturn(quantite); when(perte.getTypePerte()).thenReturn(TypePerteStock.DEFAUT_AFFINAGE);
        when(perte.getMotif()).thenReturn("Défaut confirmé"); when(perte.getDateHeure()).thenReturn(LocalDateTime.of(2026, 9, 11, 9, 0)); return perte;
    }

    private PlacementAffinage placement() {
        PlacementAffinage placement = mock(PlacementAffinage.class); Rangee rangee = mock(Rangee.class); Etagere etagere = mock(Etagere.class); Cave cave = mock(Cave.class);
        when(placement.getRangee()).thenReturn(rangee); when(placement.getPositionDebut()).thenReturn(4); when(placement.getQuantite()).thenReturn(10);
        when(rangee.getNumero()).thenReturn(3); when(rangee.getEtagere()).thenReturn(etagere); when(etagere.getNumero()).thenReturn(2);
        when(etagere.getCave()).thenReturn(cave); when(cave.getNom()).thenReturn("Nord"); return placement;
    }
}
