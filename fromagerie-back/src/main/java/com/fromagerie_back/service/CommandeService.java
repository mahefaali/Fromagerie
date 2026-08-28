package com.fromagerie_back.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fromagerie_back.dto.CommandeRequests.*;
import com.fromagerie_back.dto.CommandeResponses.*;
import com.fromagerie_back.exception.*;
import com.fromagerie_back.model.*;
import com.fromagerie_back.repository.*;

@Service
public class CommandeService {
    private static final EnumSet<StatutCommande> RESERVING = EnumSet.of(StatutCommande.CONFIRMEE, StatutCommande.EN_PREPARATION, StatutCommande.PRETE);
    private final ClientRepository clients; private final CommandeRepository commandes; private final FromageRepository fromages;
    private final StockFromageFiniRepository stocks; private final MouvementStockRepository mouvements; private final ReservationStockRepository reservations;
    private final LivraisonRepository livraisons; private final FactureRepository factures; private final UtilisateurRepository utilisateurs;
    public CommandeService(ClientRepository clients, CommandeRepository commandes, FromageRepository fromages, StockFromageFiniRepository stocks, MouvementStockRepository mouvements, ReservationStockRepository reservations, LivraisonRepository livraisons, FactureRepository factures, UtilisateurRepository utilisateurs) { this.clients=clients;this.commandes=commandes;this.fromages=fromages;this.stocks=stocks;this.mouvements=mouvements;this.reservations=reservations;this.livraisons=livraisons;this.factures=factures;this.utilisateurs=utilisateurs; }

    @Transactional(readOnly=true) public List<ClientResponse> clients(){ return clients.findAll().stream().map(this::client).toList(); }
    @Transactional(readOnly=true) public ClientResponse client(Long id){ return client(findClient(id)); }
    @Transactional public ClientResponse createClient(ClientRequest r){ Client c=new Client(); apply(c,r); return client(clients.save(c)); }
    @Transactional public ClientResponse updateClient(Long id, ClientRequest r){ Client c=findClient(id); apply(c,r); return client(clients.save(c)); }
    private void apply(Client c,ClientRequest r){c.setNom(r.nom().trim());c.setTypeClient(r.typeClient());c.setTelephone(r.telephone());c.setAdresse(r.adresse());if(r.actif()!=null)c.setActif(r.actif());}

    @Transactional(readOnly=true) public List<CommandeResponse> list(){return commandes.findAllByOrderByDateCommandeDescIdDesc().stream().map(this::response).toList();}
    @Transactional(readOnly=true) public CommandeResponse get(Long id){return response(commandes.findWithDetailsById(id).orElseThrow(()->new ResourceNotFoundException("Commande introuvable : "+id)));}
    @Transactional public CommandeResponse create(CommandeRequest r,Authentication auth){ Client c=findClient(r.clientId()); if(!c.isActif()) throw new BusinessValidationException("Le client est désactivé"); Commande order=new Commande(); order.setClient(c);order.setDateCommande(LocalDate.now());order.setDateLivraisonSouhaitee(r.dateLivraisonSouhaitee());order.setObservations(r.observations());order.setStatut(StatutCommande.CONFIRMEE);order.setNumeroCommande("CMD-"+LocalDate.now().toString().replace("-","")+"-"+UUID.randomUUID().toString().substring(0,6).toUpperCase()); if(auth!=null)order.setUtilisateurCreateur(utilisateurs.findByUsername(auth.getName()).orElse(null)); for(LigneRequest x:r.lignes()){LigneCommande l=new LigneCommande();l.setFromage(fromages.findById(x.fromageId()).orElseThrow(()->new ResourceNotFoundException("Fromage introuvable : "+x.fromageId())));l.setQuantiteCommandee(x.quantiteCommandee());l.setPrixUnitaire(x.prixUnitaire());order.addLigne(l);} commandes.saveAndFlush(order); reserve(order); return response(order); }

    @Transactional public CommandeResponse confirm(Long id){
        Commande o=locked(id);
        if(o.getStatut()!=StatutCommande.BROUILLON)throw new BusinessConflictException("Seule une commande brouillon peut être confirmée");
        reserve(o);
        return response(o);
    }

    private void reserve(Commande o){
        // Preflight global: no reservation is persisted until every line is fully available.
        for(LigneCommande l:o.getLignes()){
            int available=stocks.findAvailableByFromage(l.getFromage().getId(),StatutStockFromageFini.DISPONIBLE).stream()
                    .mapToInt(s->Math.max(0,physical(s)-reservations.sumActiveForStock(s.getId(),RESERVING))).sum();
            if(available<l.getQuantiteCommandee())throw new BusinessConflictException(l.getFromage().getNom()+" : "+l.getQuantiteCommandee()+" demandés, "+available+" disponibles");
        }
        for(LigneCommande l:o.getLignes()){
            int needed=l.getQuantiteCommandee();
            for(StockFromageFini s:stocks.findAvailableByFromage(l.getFromage().getId(),StatutStockFromageFini.DISPONIBLE)){
                int take=Math.min(needed,Math.max(0,physical(s)-reservations.sumActiveForStock(s.getId(),RESERVING)));
                if(take>0){ReservationStock r=new ReservationStock();r.setLigneCommande(l);r.setStockFromageFini(s);r.setQuantiteReservee(take);reservations.save(r);needed-=take;}
                if(needed==0)break;
            }
            if(needed>0)throw new BusinessConflictException(l.getFromage().getNom()+" : stock devenu insuffisant pendant la confirmation");
        }
        o.setStatut(StatutCommande.CONFIRMEE);
    }
    @Transactional public CommandeResponse update(Long id, CommandeRequest r){Commande o=locked(id);if(o.getStatut()!=StatutCommande.BROUILLON)throw new BusinessConflictException("Seul un brouillon peut être modifié");Client c=findClient(r.clientId());if(!c.isActif())throw new BusinessValidationException("Le client est désactivé");o.setClient(c);o.setDateLivraisonSouhaitee(r.dateLivraisonSouhaitee());o.setObservations(r.observations());o.getLignes().clear();for(LigneRequest x:r.lignes()){LigneCommande l=new LigneCommande();l.setFromage(fromages.findById(x.fromageId()).orElseThrow(()->new ResourceNotFoundException("Fromage introuvable : "+x.fromageId())));l.setQuantiteCommandee(x.quantiteCommandee());l.setPrixUnitaire(x.prixUnitaire());o.addLigne(l);}return response(o);}
    @Transactional public CommandeResponse cancel(Long id){Commande o=locked(id);if(o.getStatut()==StatutCommande.LIVREE)throw new BusinessConflictException("Une commande livrée ne peut pas être annulée");if(o.getStatut()==StatutCommande.ANNULEE)throw new BusinessConflictException("Commande déjà annulée");o.setStatut(StatutCommande.ANNULEE);return response(o);}
    @Transactional public CommandeResponse prepare(Long id){Commande o=locked(id);if(!RESERVING.contains(o.getStatut()))throw new BusinessConflictException("La commande doit être confirmée avant préparation");o.setStatut(StatutCommande.PRETE);return response(o);}
    @Transactional public CommandeResponse deliver(Long id,LivraisonRequest r,Authentication auth){
        Commande o=locked(id);
        if(!(o.getStatut()==StatutCommande.CONFIRMEE||o.getStatut()==StatutCommande.PRETE||o.getStatut()==StatutCommande.EN_PREPARATION))throw new BusinessConflictException("Commande non livrable");
        if(livraisons.findByCommandeId(id).isPresent())throw new BusinessConflictException("Cette commande possède déjà une livraison");

        Map<Long,ReservationStock> reserved=reservations.findByLigneCommandeCommandeId(id).stream().collect(Collectors.toMap(ReservationStock::getId,x->x));
        Map<Long,Integer> deliveredByReservation=new HashMap<>();
        for(LivraisonLigneRequest line:r.lignes()){
            ReservationStock reservation=reserved.get(line.reservationId());
            if(reservation==null)throw new BusinessValidationException("Réservation incohérente");
            if(deliveredByReservation.putIfAbsent(line.reservationId(),line.quantiteLivree())!=null)throw new BusinessValidationException("Réservation de livraison dupliquée");
            if(line.quantiteLivree()>reservation.getQuantiteReservee())throw new BusinessConflictException("La quantité livrée dépasse la quantité réservée");
        }

        Livraison delivery=new Livraison();
        delivery.setCommande(o);delivery.setDateLivraison(r.dateLivraison());delivery.setObservations(r.observations());
        Utilisateur deliveryUser=user(auth);delivery.setUtilisateur(deliveryUser);
        Map<StockFromageFini,Integer> physicalBefore=reserved.values().stream().map(ReservationStock::getStockFromageFini).distinct().collect(Collectors.toMap(stock->stock,this::physical));
        Map<StockFromageFini,Integer> soldByStock=new HashMap<>();
        for(ReservationStock reservation:reserved.values()){
            int delivered=deliveredByReservation.getOrDefault(reservation.getId(),0);
            LigneLivraison line=new LigneLivraison();
            line.setLigneCommande(reservation.getLigneCommande());line.setStockFromageFini(reservation.getStockFromageFini());
            line.setQuantitePrevue(reservation.getQuantiteReservee());line.setQuantiteLivree(delivered);delivery.addLigne(line);
            if(delivered>0){
                MouvementStock movement=new MouvementStock();movement.setStockFromageFini(reservation.getStockFromageFini());movement.setType(TypeMouvementStock.VENTE);
                movement.setQuantite(delivered);movement.setUtilisateur(deliveryUser);movement.setDateMouvement(LocalDateTime.now());movement.setCommentaire("Vente "+o.getNumeroCommande());
                mouvements.save(movement);soldByStock.merge(reservation.getStockFromageFini(),delivered,Integer::sum);
            }
        }
        soldByStock.forEach((stock,sold)->{
            if(physicalBefore.get(stock)-sold<=0)stock.setStatut(StatutStockFromageFini.EPUISE);
        });
        livraisons.save(delivery);o.setStatut(StatutCommande.LIVREE);return response(o);
    }
    @Transactional public FactureResponse facture(Long id,FactureRequest r){Commande o=locked(id);if(o.getStatut()!=StatutCommande.LIVREE)throw new BusinessConflictException("La facture est disponible après livraison");if(factures.findByCommandeId(id).isPresent())throw new BusinessConflictException("Cette commande est déjà facturée");Livraison d=livraisons.findByCommandeId(id).orElseThrow();BigDecimal total=d.getLignes().stream().map(x->x.getLigneCommande().getPrixUnitaire().multiply(BigDecimal.valueOf(x.getQuantiteLivree()))).reduce(BigDecimal.ZERO,BigDecimal::add);Facture f=new Facture();f.setCommande(o);f.setDateFacture(LocalDate.now());f.setTotal(total);f.setModePaiement(r.modePaiement());f.setNumeroFacture("FAC-"+LocalDate.now().toString().replace("-","")+"-"+UUID.randomUUID().toString().substring(0,6).toUpperCase());return facture(factures.save(f));}
    @Transactional(readOnly=true) public FactureResponse getFacture(Long id){return facture(factures.findById(id).orElseThrow(()->new ResourceNotFoundException("Facture introuvable : "+id)));}
    private int physical(StockFromageFini stock){
        int movementBalance=mouvements.quantityAvailable(stock.getId(),EnumSet.of(TypeMouvementStock.ENTREE,TypeMouvementStock.AJUSTEMENT));
        int legacyBaseline=mouvements.existsByStockFromageFiniIdAndType(stock.getId(),TypeMouvementStock.ENTREE)?0:stock.getQuantiteInitiale();
        return Math.max(0,legacyBaseline+movementBalance);
    }
    private Commande locked(Long id){return commandes.findByIdForUpdate(id).orElseThrow(()->new ResourceNotFoundException("Commande introuvable : "+id));} private Client findClient(Long id){return clients.findById(id).orElseThrow(()->new ResourceNotFoundException("Client introuvable : "+id));} private Utilisateur user(Authentication a){return utilisateurs.findByUsername(a.getName()).orElseThrow(()->new ResourceNotFoundException("Utilisateur introuvable : "+a.getName()));}
    private ClientResponse client(Client c){return new ClientResponse(c.getId(),c.getNom(),c.getTypeClient(),c.getTelephone(),c.getAdresse(),c.isActif());} private FactureResponse facture(Facture f){return new FactureResponse(f.getId(),f.getNumeroFacture(),f.getCommande().getId(),f.getDateFacture(),f.getTotal(),f.getModePaiement());}
    private CommandeResponse response(Commande o){
        List<ReservationStock> all=reservations.findByLigneCommandeCommandeId(o.getId());
        List<LigneResponse> lines=o.getLignes().stream().map(l->new LigneResponse(l.getId(),l.getFromage().getId(),l.getFromage().getNom(),l.getQuantiteCommandee(),l.getPrixUnitaire(),all.stream().filter(r->r.getLigneCommande().getId().equals(l.getId())).map(r->new ReservationResponse(r.getId(),l.getId(),r.getStockFromageFini().getId(),r.getStockFromageFini().getLotAffinage().getFabrication().getNumeroLot(),l.getFromage().getNom(),r.getStockFromageFini().getEmplacementStock().getNom(),r.getQuantiteReservee(),physical(r.getStockFromageFini()))).toList())).toList();
        LivraisonResponse delivery=livraisons.findByCommandeId(o.getId()).map(d->new LivraisonResponse(d.getDateLivraison(),d.getObservations(),d.getLignes().stream().map(line->{
            ReservationStock reservation=all.stream().filter(item->item.getLigneCommande().getId().equals(line.getLigneCommande().getId())&&item.getStockFromageFini().getId().equals(line.getStockFromageFini().getId())).findFirst().orElseThrow();
            return new LivraisonLigneResponse(reservation.getId(),line.getQuantitePrevue(),line.getQuantiteLivree(),line.getQuantiteLivree()-line.getQuantitePrevue());
        }).toList())).orElse(null);
        return new CommandeResponse(o.getId(),o.getNumeroCommande(),client(o.getClient()),o.getDateCommande(),o.getDateLivraisonSouhaitee(),o.getStatut(),o.getObservations(),lines,delivery);
    }
}
