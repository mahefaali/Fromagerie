package com.fromagerie_back.service;

import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fromagerie_back.dto.*;
import com.fromagerie_back.dto.CommandeTracabiliteResponse.ProduitLivre;
import com.fromagerie_back.dto.TracabiliteResponse.*;
import com.fromagerie_back.dto.TracabiliteDescendanteResponse;
import com.fromagerie_back.dto.TracabiliteDescendanteResponse.*;
import com.fromagerie_back.exception.ResourceNotFoundException;
import com.fromagerie_back.model.*;
import com.fromagerie_back.repository.*;

@Service
public class TracabiliteService {
    private final FabricationRepository fabrications;
    private final UtilisationLotLaitRepository usages;
    private final AnalyseLaitRepository analyses;
    private final LotAffinageRepository affinages;
    private final StockFromageFiniRepository stocks;
    private final LigneLivraisonRepository livraisons;
    private final PlacementAffinageRepository placements;
    private final MouvementStockRepository mouvements;
    private final PerteStockRepository pertes;

    public TracabiliteService(FabricationRepository f, UtilisationLotLaitRepository u, AnalyseLaitRepository a,
            LotAffinageRepository af, StockFromageFiniRepository s, LigneLivraisonRepository l,
            PlacementAffinageRepository p, MouvementStockRepository m, PerteStockRepository ps) {
        fabrications = f;
        usages = u;
        analyses = a;
        affinages = af;
        stocks = s;
        livraisons = l;
        placements = p;
        mouvements = m;
        pertes = ps;
    }

    @Transactional(readOnly = true)
    public TracabiliteDescendanteResponse byNumeroLotDescendant(String numero) {
        if (numero == null || numero.isBlank())
            throw new com.fromagerie_back.exception.BusinessValidationException("Le numéro de lot est obligatoire");
        String recherche = numero.trim();
        Fabrication fabrication = fabrications.findByNumeroLotContainingWithDetails(recherche).stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Lot de fabrication introuvable : " + recherche));
        return buildDescendant(fabrication);
    }

    private TracabiliteDescendanteResponse buildDescendant(Fabrication fabrication) {
        int produite = fabrication.getNombreFromages();
        LotAffinage affinage = affinages.findByFabricationId(fabrication.getId()).orElse(null);
        StockFromageFini stock = stocks.findByLotAffinageFabricationId(fabrication.getId()).orElse(null);
        List<LigneLivraison> lignesLivrees = livraisons.findTraceByFabricationId(fabrication.getId());
        int livree = lignesLivrees.stream().mapToInt(LigneLivraison::getQuantiteLivree).sum();

        Map<Long, ClientLivreAccumulator> clients = new LinkedHashMap<>();
        List<LocalisationTrace> localisations = new ArrayList<>();
        for (LigneLivraison ligne : lignesLivrees) {
            Client client = ligne.getLivraison().getCommande().getClient();
            clients.computeIfAbsent(client.getId(), id -> new ClientLivreAccumulator(client.getNom()))
                    .quantite += ligne.getQuantiteLivree();
            localisations.add(new LocalisationTrace(
                    "DERNIERE_DESTINATION_CONNUE",
                    "Client " + client.getNom(),
                    ligne.getQuantiteLivree(),
                    ligne.getLivraison().getNumeroLivraison(),
                    ligne.getLivraison().getDateLivraison()));
        }

        List<PerteTrace> pertesTrace = stock == null ? List.of()
                : pertes.findByStockFromageFiniIdOrderByDateHeureAscIdAsc(stock.getId()).stream()
                        .map(perte -> new PerteTrace(perte.getId(), perte.getQuantite(), perte.getTypePerte(),
                                perte.getMotif(), perte.getDateHeure()))
                        .toList();
        int perdue = pertesTrace.stream().mapToInt(PerteTrace::quantite).sum();

        int disponible;
        if (stock != null) {
            disponible = quantitePhysique(stock);
            if (disponible > 0) {
                localisations.addFirst(new LocalisationTrace(
                        "STOCK_FINI",
                        stock.getEmplacementStock().getNom(),
                        disponible,
                        null,
                        null));
            }
        } else if (affinage != null) {
            disponible = affinage.getQuantiteInitiale();
            for (PlacementAffinage placement : placements.findActiveByLotIdWithLocation(affinage.getId())) {
                Rangee rangee = placement.getRangee();
                int positionFin = placement.getPositionDebut() + placement.getQuantite() - 1;
                localisations.add(new LocalisationTrace(
                        "AFFINAGE",
                        "Cave " + rangee.getEtagere().getCave().getNom()
                                + ", étagère " + rangee.getEtagere().getNumero()
                                + ", rangée " + rangee.getNumero()
                                + ", positions " + placement.getPositionDebut() + "-" + positionFin,
                        placement.getQuantite(),
                        null,
                        null));
            }
        } else {
            disponible = produite;
        }

        List<ClientLivre> clientsLivres = clients.entrySet().stream()
                .map(entry -> new ClientLivre(entry.getKey(), entry.getValue().nom, entry.getValue().quantite))
                .toList();
        return new TracabiliteDescendanteResponse(
                fabrication.getId(),
                fabrication.getNumeroLot(),
                fabrication.getRecette().getFromage().getNom(),
                fabrication.getDateHeureDebut(),
                produite,
                livree,
                Math.max(0, produite - livree),
                disponible,
                perdue,
                clientsLivres,
                pertesTrace,
                localisations);
    }

    private int quantitePhysique(StockFromageFini stock) {
        int balance = mouvements.quantityAvailable(stock.getId(),
                EnumSet.of(TypeMouvementStock.ENTREE, TypeMouvementStock.AJUSTEMENT));
        int historique = mouvements.existsByStockFromageFiniIdAndType(stock.getId(), TypeMouvementStock.ENTREE)
                ? 0 : stock.getQuantiteInitiale();
        return Math.max(0, historique + balance);
    }

    private static final class ClientLivreAccumulator {
        private final String nom;
        private int quantite;

        private ClientLivreAccumulator(String nom) {
            this.nom = nom;
        }
    }

    @Transactional(readOnly = true)
    public TracabiliteResponse byNumeroLot(String numero) {
        if (numero == null || numero.isBlank())
            throw new com.fromagerie_back.exception.BusinessValidationException("Le numéro de lot est obligatoire");
        return build(fabrications.findByNumeroLotIgnoreCase(numero.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Aucune traçabilité trouvée pour le lot " + numero)));
    }

    @Transactional(readOnly = true)
    public CommandeTracabiliteResponse findCommande(String numero) {
        if (numero == null || numero.isBlank())
            throw new com.fromagerie_back.exception.BusinessValidationException(
                    "Le numéro de commande est obligatoire");
        String recherche = numero.trim();
        List<LigneLivraison> correspondances = livraisons.findDeliveredByNumeroCommandeContaining(recherche);
        if (correspondances.isEmpty())
            throw new ResourceNotFoundException("Aucun produit livré trouvé pour la recherche " + recherche);
        Commande c = correspondances.getFirst().getLivraison().getCommande();
        List<LigneLivraison> lignes = correspondances.stream()
                .filter(l -> l.getLivraison().getCommande().getId().equals(c.getId())).toList();
        return new CommandeTracabiliteResponse(c.getId(), c.getNumeroCommande(), c.getClient().getNom(),
                c.getDateCommande(),
                lignes.stream()
                        .map(l -> new ProduitLivre(l.getId(), l.getLivraison().getNumeroLivraison(),
                                l.getLivraison().getDateLivraison(), l.getLigneCommande().getFromage().getNom(),
                                l.getQuantiteLivree(),
                                l.getStockFromageFini().getLotAffinage().getFabrication().getNumeroLot()))
                        .toList());
    }

    @Transactional(readOnly = true)
    public TracabiliteResponse byLigneLivraison(Long id) {
        LigneLivraison l = livraisons.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ligne de livraison introuvable"));
        return build(l.getStockFromageFini().getLotAffinage().getFabrication(), l);
    }

    private TracabiliteResponse build(Fabrication f) {
        return build(f, null);
    }

    private TracabiliteResponse build(Fabrication f, LigneLivraison selected) {
        Recette r = f.getRecette();
        Utilisateur o = f.getOperateur();
        FabricationTrace ft = new FabricationTrace(f.getId(), f.getNumeroLot(), f.getDateHeureDebut(),
                r.getFromage().getNom(), r.getNom(), f.getQuantiteLait(), f.getTemperatureLait(), f.getOrigineLait(),
                o == null ? null : o.getId(), o == null ? "Opérateur historique non renseigné" : o.getNom());
        LotAffinage a = affinages.findByFabricationId(f.getId()).orElse(null);
        AffinageTrace at = a == null ? null
                : new AffinageTrace(a.getId(), a.getDateMiseEnCave(), a.getDateSortiePrevue(), a.getStatut().name());
        StockFromageFini s = stocks.findByLotAffinageFabricationId(f.getId()).orElse(null);
        StockTrace st = s == null ? null
                : new StockTrace(s.getId(), s.getDateEntreeStock(), s.getQuantiteInitiale(), s.getStatut().name());
        List<LigneLivraison> delivered = selected == null ? livraisons.findTraceByFabricationId(f.getId())
                : List.of(selected);
        List<VenteTrace> vs = delivered.stream()
                .map(l -> new VenteTrace(l.getId(), l.getLivraison().getNumeroLivraison(),
                        l.getLivraison().getDateLivraison(), l.getLivraison().getCommande().getClient().getNom(),
                        l.getQuantiteLivree()))
                .toList();
        List<LotLaitTrace> ls = usages.findByFabricationIdOrderByLotLaitDateTraiteAsc(f.getId()).stream().map(u -> {
            LotLait l = u.getLotLait();
            return new LotLaitTrace(l.getId(), l.getNumeroLot(), l.getDateTraite(), l.getTypeTraite(),
                    u.getQuantiteUtilisee(),
                    analyses.findByLotLaitIdOrderByDateAnalyseDesc(l.getId()).stream()
                            .map(x -> new LotLaitDtos.AnalyseResponse(x.getId(), x.getDateAnalyse(), x.getTypeAnalyse(),
                                    x.getResultat(), x.getUnite(), x.getObservation()))
                            .toList());
        }).toList();
        return new TracabiliteResponse(ft, at, st, vs, ls, !ls.isEmpty());
    }
}
