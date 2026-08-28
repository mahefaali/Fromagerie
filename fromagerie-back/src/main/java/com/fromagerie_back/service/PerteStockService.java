package com.fromagerie_back.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fromagerie_back.dto.CoutProductionManuelRequest;
import com.fromagerie_back.dto.CoutProductionManuelResponse;
import com.fromagerie_back.dto.PerteStockRequest;
import com.fromagerie_back.dto.PerteStockResponse;
import com.fromagerie_back.exception.BusinessConflictException;
import com.fromagerie_back.exception.BusinessValidationException;
import com.fromagerie_back.exception.ResourceNotFoundException;
import com.fromagerie_back.model.CoutProductionManuel;
import com.fromagerie_back.model.MouvementStock;
import com.fromagerie_back.model.PerteStock;
import com.fromagerie_back.model.StockFromageFini;
import com.fromagerie_back.model.TypeMouvementStock;
import com.fromagerie_back.model.TypePerteStock;
import com.fromagerie_back.model.Utilisateur;
import com.fromagerie_back.repository.CoutProductionManuelRepository;
import com.fromagerie_back.repository.MouvementStockRepository;
import com.fromagerie_back.repository.PerteStockRepository;
import com.fromagerie_back.repository.StockFromageFiniRepository;
import com.fromagerie_back.repository.UtilisateurRepository;
import com.fromagerie_back.repository.FromageRepository;
import com.fromagerie_back.repository.ReservationStockRepository;
import com.fromagerie_back.model.Role;

@Service
public class PerteStockService {
    private final PerteStockRepository pertes;
    private final CoutProductionManuelRepository couts;
    private final StockFromageFiniRepository stocks;
    private final MouvementStockRepository mouvements;
    private final UtilisateurRepository utilisateurs;
    private final FromageRepository fromages;
    private final ReservationStockRepository reservations;

    public PerteStockService(PerteStockRepository pertes, CoutProductionManuelRepository couts, StockFromageFiniRepository stocks, MouvementStockRepository mouvements, UtilisateurRepository utilisateurs, FromageRepository fromages, ReservationStockRepository reservations) {
        this.pertes = pertes; this.couts = couts; this.stocks = stocks; this.mouvements = mouvements; this.utilisateurs = utilisateurs; this.fromages = fromages; this.reservations = reservations;
    }

    @Transactional(readOnly = true)
    public List<CoutProductionManuelResponse> listCouts() {
        Map<Long, CoutProductionManuel> configured = couts.findAllByOrderByFromageNomAsc().stream()
                .collect(Collectors.toMap(cout -> cout.getFromage().getId(), cout -> cout));
        return fromages.findAllById(fromages.findDistinctIdsInLots()).stream()
                .sorted(java.util.Comparator.comparing(com.fromagerie_back.model.Fromage::getNom))
                .map(fromage -> configured.containsKey(fromage.getId())
                        ? coutResponse(configured.get(fromage.getId()))
                        : new CoutProductionManuelResponse(fromage.getId(), fromage.getNom(), null, null, null))
                .toList();
    }

    @Transactional(readOnly = true)
    public CoutProductionManuelResponse getCout(Long fromageId) {
        return coutResponse(couts.findByFromageId(fromageId)
                .orElseThrow(() -> new ResourceNotFoundException("Coût manuel introuvable pour le fromage : " + fromageId)));
    }

    @Transactional
    public CoutProductionManuelResponse updateCout(Long fromageId, CoutProductionManuelRequest request, Authentication auth) {
        ensureProprietaire(auth);
        if (request.coutUnitaire().signum() < 0) {
            throw new BusinessValidationException("Le coût unitaire doit être positif ou nul");
        }
        var fromage = fromages.findById(fromageId)
                .orElseThrow(() -> new ResourceNotFoundException("Fromage introuvable : " + fromageId));
        Utilisateur utilisateur = user(auth);
        CoutProductionManuel cout = couts.findByFromageId(fromageId).orElseGet(CoutProductionManuel::new);
        cout.setFromage(fromage);
        cout.setCoutUnitaire(request.coutUnitaire());
        cout.setDateMiseAJour(LocalDateTime.now());
        cout.setUtilisateurModification(utilisateur);
        return coutResponse(couts.save(cout));
    }

    @Transactional
    public PerteStockResponse declarePerte(Long stockId, PerteStockRequest request, Authentication auth) {
        StockFromageFini stock = stocks.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock fini introuvable : " + stockId));
        var reservation = request.reservationId() == null ? null : reservations.findById(request.reservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Réservation introuvable : " + request.reservationId()));
        if (reservation != null && !reservation.getStockFromageFini().getId().equals(stockId)) {
            throw new BusinessConflictException("La réservation ne correspond pas au stock sélectionné");
        }
        if (request.quantite() <= 0) {
            throw new BusinessValidationException("La quantité perdue doit être supérieure à 0");
        }
        if (request.typePerte() == TypePerteStock.RETOUR_CLIENT) {
            int livree = reservation == null ? mouvements.quantityByType(stockId, TypeMouvementStock.VENTE) : reservation.getQuantiteReservee();
            int dejaRetournee = reservation == null
                    ? pertes.quantityByStockAndType(stockId, TypePerteStock.RETOUR_CLIENT)
                    : pertes.quantityByReservationAndType(reservation.getId(), TypePerteStock.RETOUR_CLIENT);
            int retourDisponible = Math.max(0, livree - dejaRetournee);
            if (request.quantite() > retourDisponible) {
                throw new BusinessConflictException("La quantité retournée dépasse la quantité encore disponible");
            }
        } else if (request.quantite() > physical(stockId, stock.getQuantiteInitiale())) {
            throw new BusinessConflictException("La quantité perdue dépasse le stock physique disponible");
        }
        BigDecimal coutUnitaire = couts.findByFromageId(stock.getLotAffinage().getFabrication().getRecette().getFromage().getId())
                .map(CoutProductionManuel::getCoutUnitaire)
                .orElseThrow(() -> new BusinessConflictException("Le coût de production manuel doit d'abord être configuré"));
        Utilisateur utilisateur = user(auth);
        BigDecimal coutTotal = coutUnitaire.multiply(BigDecimal.valueOf(request.quantite()));
        String motif = request.motif() == null || request.motif().isBlank()
                ? (request.typePerte() == TypePerteStock.RETOUR_CLIENT ? "Retour d'invendus" : "Perte de stock")
                : request.motif().trim();

        PerteStock perte = new PerteStock();
        perte.setStockFromageFini(stock);
        perte.setReservationStock(reservation);
        perte.setQuantite(request.quantite());
        perte.setTypePerte(request.typePerte());
        perte.setMotif(motif);
        perte.setDateHeure(LocalDateTime.now());
        perte.setCoutUnitaireReference(coutUnitaire);
        perte.setCoutTotal(coutTotal);
        perte.setUtilisateur(utilisateur);
        perte = pertes.save(perte);

        MouvementStock mouvement = new MouvementStock();
        mouvement.setStockFromageFini(stock);
        mouvement.setType(TypeMouvementStock.PERTE);
        mouvement.setQuantite(request.quantite());
        mouvement.setUtilisateur(utilisateur);
        mouvement.setDateMouvement(LocalDateTime.now());
        mouvement.setCommentaire(motif);
        mouvements.save(mouvement);
        return perteResponse(perte);
    }

    @Transactional(readOnly = true)
    public List<PerteStockResponse> listPertes(Long stockId) {
        return (stockId == null ? pertes.findAllByOrderByDateHeureDescIdDesc() : pertes.findByStockFromageFiniIdOrderByDateHeureDescIdDesc(stockId))
                .stream().map(this::perteResponse).toList();
    }

    @Transactional(readOnly = true)
    public PerteStockResponse getPerte(Long id) {
        return perteResponse(pertes.findById(id).orElseThrow(() -> new ResourceNotFoundException("Perte introuvable : " + id)));
    }

    private int physical(Long stockId, int initial) {
        int balance = mouvements.quantityAvailable(stockId, java.util.EnumSet.of(TypeMouvementStock.ENTREE, TypeMouvementStock.AJUSTEMENT));
        int baseline = mouvements.existsByStockFromageFiniIdAndType(stockId, TypeMouvementStock.ENTREE) ? 0 : initial;
        return Math.max(0, baseline + balance);
    }

    private Utilisateur user(Authentication auth) {
        return utilisateurs.findByUsername(auth.getName()).orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable : " + auth.getName()));
    }

    private void ensureProprietaire(Authentication auth) {
        if (auth == null || auth.getAuthorities().stream().noneMatch(a -> ("ROLE_" + Role.PROPRIETAIRE.name()).equals(a.getAuthority()))) {
            throw new BusinessConflictException("Seul le propriétaire peut modifier les coûts manuels");
        }
    }

    private CoutProductionManuelResponse coutResponse(CoutProductionManuel cout) {
        return new CoutProductionManuelResponse(cout.getFromage().getId(), cout.getFromage().getNom(), cout.getCoutUnitaire(), cout.getDateMiseAJour(), cout.getUtilisateurModification() == null ? null : cout.getUtilisateurModification().getNom());
    }

    private PerteStockResponse perteResponse(PerteStock perte) {
        return new PerteStockResponse(perte.getId(), perte.getStockFromageFini().getId(), perte.getReservationStock() == null ? null : perte.getReservationStock().getId(), perte.getStockFromageFini().getLotAffinage().getFabrication().getNumeroLot(), perte.getStockFromageFini().getLotAffinage().getFabrication().getRecette().getFromage().getNom(), perte.getQuantite(), perte.getTypePerte(), perte.getMotif(), perte.getDateHeure(), perte.getCoutUnitaireReference(), perte.getCoutTotal(), perte.getUtilisateur().getNom());
    }
}
