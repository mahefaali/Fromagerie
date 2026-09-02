package com.fromagerie_back.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fromagerie_back.dto.EmplacementStockRequest;
import com.fromagerie_back.dto.EmplacementStockResponse;
import com.fromagerie_back.dto.MouvementStockRequest;
import com.fromagerie_back.dto.MouvementStockResponse;
import com.fromagerie_back.dto.StockFromageFiniRequest;
import com.fromagerie_back.dto.StockFromageFiniResponse;
import com.fromagerie_back.dto.StockAlerteResponse;
import com.fromagerie_back.dto.SortieAffinageRequest;
import com.fromagerie_back.exception.BusinessConflictException;
import com.fromagerie_back.exception.ResourceNotFoundException;
import com.fromagerie_back.model.EmplacementStock;
import com.fromagerie_back.model.LotAffinage;
import com.fromagerie_back.model.MouvementStock;
import com.fromagerie_back.model.StatutStockFromageFini;
import com.fromagerie_back.model.StockFromageFini;
import com.fromagerie_back.model.TypeMouvementStock;
import com.fromagerie_back.model.Utilisateur;
import com.fromagerie_back.repository.EmplacementStockRepository;
import com.fromagerie_back.repository.LotAffinageRepository;
import com.fromagerie_back.repository.MouvementStockRepository;
import com.fromagerie_back.repository.PlacementAffinageRepository;
import com.fromagerie_back.repository.StockFromageFiniRepository;
import com.fromagerie_back.repository.UtilisateurRepository;

@Service
public class StockFromageFiniService {

    private final EmplacementStockRepository emplacementStockRepository;
    private final StockFromageFiniRepository stockRepository;
    private final LotAffinageRepository lotAffinageRepository;
    private final MouvementStockRepository mouvementRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final PlacementAffinageRepository placementRepository;
    private final CoutProductionCalculService coutProductionCalculService;

    public StockFromageFiniService(
            EmplacementStockRepository emplacementStockRepository,
            StockFromageFiniRepository stockRepository,
            LotAffinageRepository lotAffinageRepository,
            MouvementStockRepository mouvementRepository,
            UtilisateurRepository utilisateurRepository,
            PlacementAffinageRepository placementRepository,
            CoutProductionCalculService coutProductionCalculService) {
        this.emplacementStockRepository = emplacementStockRepository;
        this.stockRepository = stockRepository;
        this.lotAffinageRepository = lotAffinageRepository;
        this.mouvementRepository = mouvementRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.placementRepository = placementRepository;
        this.coutProductionCalculService = coutProductionCalculService;
    }

    @Transactional(readOnly = true)
    public List<EmplacementStockResponse> findAllEmplacements() {
        return emplacementStockRepository.findAllByOrderByNomAsc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public EmplacementStockResponse findEmplacementById(Long id) {
        return toResponse(findEmplacement(id));
    }

    @Transactional
    public EmplacementStockResponse createEmplacement(EmplacementStockRequest request) {
        String nom = normalize(request.nom());
        if (emplacementStockRepository.existsByNomIgnoreCase(nom)) {
            throw new BusinessConflictException("Un emplacement avec ce nom existe déjà");
        }
        EmplacementStock emplacement = new EmplacementStock();
        apply(emplacement, request, nom);
        return toResponse(emplacementStockRepository.save(emplacement));
    }

    @Transactional
    public EmplacementStockResponse updateEmplacement(Long id, EmplacementStockRequest request) {
        EmplacementStock emplacement = findEmplacement(id);
        String nom = normalize(request.nom());
        if (!emplacement.getNom().equalsIgnoreCase(nom) && emplacementStockRepository.existsByNomIgnoreCase(nom)) {
            throw new BusinessConflictException("Un emplacement avec ce nom existe déjà");
        }
        apply(emplacement, request, nom);
        return toResponse(emplacementStockRepository.save(emplacement));
    }

    @Transactional(readOnly = true)
    public List<StockFromageFiniResponse> findAllStocks() {
        return stockRepository.findAllByOrderByDateEntreeStockDescIdDesc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<StockAlerteResponse> findAlertes() {
        return stockRepository.findAllByOrderByDateEntreeStockDescIdDesc().stream()
                .filter(stock -> stock.getStatut() == StatutStockFromageFini.DISPONIBLE)
                .map(stock -> new StockAlerteResponse(
                        stock.getId(),
                        stock.getLotAffinage().getFabrication().getRecette().getFromage().getNom(),
                        stock.getLotAffinage().getFabrication().getNumeroLot(),
                        stock.getDateDurabilite(),
                        ChronoUnit.DAYS.between(java.time.LocalDate.now(), stock.getDateDurabilite())))
                .filter(alerte -> alerte.joursRestants() <= 7)
                .toList();
    }

    @Transactional(readOnly = true)
    public StockFromageFiniResponse findStockById(Long id) {
        return toResponse(findStock(id));
    }

    @Transactional
    public StockFromageFiniResponse createStock(StockFromageFiniRequest request, Authentication authentication) {
        LotAffinage lot = findLot(request.lotAffinageId());
        if (stockRepository.existsByLotAffinageId(lot.getId())) {
            throw new BusinessConflictException("Ce lot d'affinage possède déjà un stock fini");
        }
        if (lot.getStatut() == com.fromagerie_back.model.StatutLotAffinage.TERMINE
                || request.dateEntreeStock().isBefore(lot.getDateSortiePrevue())) {
            throw new BusinessConflictException("Ce lot n'est pas prêt à entrer en stock fini");
        }
        coutProductionCalculService.calculerPourSortie(lot, request.quantiteInitiale(), request.dateEntreeStock());
        StockFromageFini stock = new StockFromageFini();
        stock.setLotAffinage(lot);
        stock.setEmplacementStock(findEmplacement(request.emplacementStockId()));
        stock.setDateEntreeStock(request.dateEntreeStock());
        stock.setQuantiteInitiale(request.quantiteInitiale());
        stock.setTypeDateDurabilite(request.typeDateDurabilite());
        stock.setDateDurabilite(request.dateDurabilite());
        stock.setStatut(StatutStockFromageFini.DISPONIBLE);
        stock = stockRepository.save(stock);
        enregistrerEntree(stock, request.quantiteInitiale(), findUtilisateur(authentication),
                request.dateEntreeStock(), "Entrée initiale du stock fini");
        return toResponse(stock);
    }

    @Transactional
    public StockFromageFiniResponse sortirAffinage(Long lotId, SortieAffinageRequest request,
            Authentication authentication) {
        LotAffinage lot = lotAffinageRepository.findByIdForUpdate(lotId)
                .orElseThrow(() -> new ResourceNotFoundException("Lot d'affinage introuvable : " + lotId));
        if (lot.getStatut() == com.fromagerie_back.model.StatutLotAffinage.TERMINE) {
            throw new BusinessConflictException("Ce lot d'affinage est déjà sorti");
        }
        if (lot.getDateSortiePrevue().isAfter(LocalDate.now())) {
            throw new BusinessConflictException("La date de sortie prévue de ce lot n'est pas encore atteinte");
        }
        if (request.dateEntreeStock().isBefore(lot.getDateSortiePrevue())) {
            throw new BusinessConflictException("La date réelle de sortie ne peut pas précéder la date prévue");
        }
        if (request.dateDurabilite().isBefore(request.dateEntreeStock())) {
            throw new BusinessConflictException("La date de durabilité doit être postérieure à l'entrée en stock");
        }
        int quantite = Math.toIntExact(placementRepository.sumActiveQuantityByLotId(lotId));
        if (quantite != lot.getQuantiteInitiale()) {
            throw new BusinessConflictException("Le lot doit être entièrement placé avant sa sortie");
        }

        // Le coût définitif doit exister avant que le lot devienne commercialisable.
        coutProductionCalculService.calculerPourSortie(lot, quantite, request.dateEntreeStock());

        StockFromageFini stock = new StockFromageFini();
        stock.setLotAffinage(lot);
        stock.setEmplacementStock(findEmplacement(request.emplacementStockId()));
        stock.setDateEntreeStock(request.dateEntreeStock());
        stock.setQuantiteInitiale(quantite);
        stock.setTypeDateDurabilite(request.typeDateDurabilite());
        stock.setDateDurabilite(request.dateDurabilite());
        stock.setStatut(StatutStockFromageFini.DISPONIBLE);
        stock = stockRepository.save(stock);

        enregistrerEntree(stock, quantite, findUtilisateur(authentication), request.dateEntreeStock(),
                request.commentaire());

        LocalDateTime maintenant = LocalDateTime.now();
        placementRepository.findActiveByLotIdWithLocation(lotId).forEach(p -> p.setDateFin(maintenant));
        lot.setStatut(com.fromagerie_back.model.StatutLotAffinage.TERMINE);
        return toResponse(stock);
    }

    @Transactional
    public MouvementStockResponse addMouvement(Long stockId, MouvementStockRequest request, Authentication authentication) {
        StockFromageFini stock = findStock(stockId);
        Utilisateur utilisateur = findUtilisateur(authentication);
        MouvementStock mouvement = new MouvementStock();
        mouvement.setStockFromageFini(stock);
        mouvement.setType(request.type());
        mouvement.setQuantite(request.quantite());
        mouvement.setUtilisateur(utilisateur);
        mouvement.setDateMouvement(LocalDateTime.now());
        mouvement.setCommentaire(request.commentaire());
        MouvementStock saved = mouvementRepository.save(mouvement);
        updateStatus(stock, request.type());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MouvementStockResponse> findMouvements(Long stockId) {
        findStock(stockId);
        return mouvementRepository.findAllByStockFromageFiniIdOrderByDateMouvementDescIdDesc(stockId).stream()
                .map(this::toResponse)
                .toList();
    }

    private void updateStatus(StockFromageFini stock, TypeMouvementStock type) {
        if (type == TypeMouvementStock.SORTIE || type == TypeMouvementStock.VENTE || type == TypeMouvementStock.PERTE) {
            stock.setStatut(StatutStockFromageFini.EPUISE);
        } else if (stock.getStatut() == StatutStockFromageFini.EPUISE) {
            stock.setStatut(StatutStockFromageFini.DISPONIBLE);
        }
        stockRepository.save(stock);
    }

    private void enregistrerEntree(StockFromageFini stock, int quantite, Utilisateur utilisateur,
            LocalDate dateEntree, String commentaire) {
        MouvementStock mouvement = new MouvementStock();
        mouvement.setStockFromageFini(stock);
        mouvement.setType(TypeMouvementStock.ENTREE);
        mouvement.setQuantite(quantite);
        mouvement.setUtilisateur(utilisateur);
        mouvement.setDateMouvement(dateEntree.atStartOfDay());
        mouvement.setCommentaire(commentaire);
        mouvementRepository.save(mouvement);
    }

    private LotAffinage findLot(Long id) {
        return lotAffinageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lot d'affinage introuvable : " + id));
    }

    private EmplacementStock findEmplacement(Long id) {
        return emplacementStockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emplacement introuvable : " + id));
    }

    private StockFromageFini findStock(Long id) {
        return stockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock fini introuvable : " + id));
    }

    private Utilisateur findUtilisateur(Authentication authentication) {
        String username = authentication.getName();
        return utilisateurRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable : " + username));
    }

    private void apply(EmplacementStock emplacement, EmplacementStockRequest request, String nom) {
        emplacement.setNom(nom);
        emplacement.setDescription(request.description() == null ? null : request.description().trim());
        emplacement.setActive(request.active() == null || request.active());
    }

    private String normalize(String value) {
        return value.trim();
    }

    private EmplacementStockResponse toResponse(EmplacementStock emplacement) {
        return new EmplacementStockResponse(emplacement.getId(), emplacement.getNom(), emplacement.getDescription(),
                emplacement.isActive());
    }

    private StockFromageFiniResponse toResponse(StockFromageFini stock) {
        int quantitePhysique = physicalQuantity(stock);
        return new StockFromageFiniResponse(
                stock.getId(),
                stock.getLotAffinage().getId(),
                stock.getLotAffinage().getFabrication().getNumeroLot(),
                stock.getLotAffinage().getFabrication().getRecette().getFromage().getNom(),
                stock.getEmplacementStock().getId(),
                stock.getEmplacementStock().getNom(),
                stock.getDateEntreeStock(),
                stock.getQuantiteInitiale(),
                quantitePhysique,
                StockCommercialPolicy.isVendable(stock, quantitePhysique, LocalDate.now()),
                stock.getTypeDateDurabilite(),
                stock.getDateDurabilite(),
                stock.getStatut(),
                findMouvements(stock.getId()));
    }

    private int physicalQuantity(StockFromageFini stock) {
        int movementBalance = mouvementRepository.quantityAvailable(stock.getId(),
                java.util.EnumSet.of(TypeMouvementStock.ENTREE, TypeMouvementStock.AJUSTEMENT));
        int legacyBaseline = mouvementRepository.existsByStockFromageFiniIdAndType(
                stock.getId(), TypeMouvementStock.ENTREE) ? 0 : stock.getQuantiteInitiale();
        return Math.max(0, legacyBaseline + movementBalance);
    }

    private MouvementStockResponse toResponse(MouvementStock mouvement) {
        return new MouvementStockResponse(
                mouvement.getId(),
                mouvement.getType(),
                mouvement.getQuantite(),
                mouvement.getUtilisateur().getId(),
                mouvement.getUtilisateur().getNom(),
                mouvement.getDateMouvement(),
                mouvement.getCommentaire());
    }
}
