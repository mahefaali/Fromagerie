package com.fromagerie_back.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fromagerie_back.dto.AffinageCreateRequest;
import com.fromagerie_back.dto.AffinageDetailResponse;
import com.fromagerie_back.dto.AffinageListResponse;
import com.fromagerie_back.dto.CaveResponse;
import com.fromagerie_back.dto.affinage.AffinageAlertItemResponse;
import com.fromagerie_back.dto.affinage.AffinageCapacityPlanningResponse;
import com.fromagerie_back.dto.affinage.AffinageDashboardResponse;
import com.fromagerie_back.dto.affinage.CaveCapacityPlanningResponse;
import com.fromagerie_back.dto.AffinagePlacementRequest;
import com.fromagerie_back.dto.DeplacementAffinageRequest;
import com.fromagerie_back.dto.PlacementAffinageResponse;
import com.fromagerie_back.dto.PlacementResultResponse;
import com.fromagerie_back.dto.SoinAffinageRequest;
import com.fromagerie_back.dto.SoinAffinageResponse;
import com.fromagerie_back.exception.BusinessConflictException;
import com.fromagerie_back.exception.BusinessValidationException;
import com.fromagerie_back.exception.ResourceNotFoundException;
import com.fromagerie_back.model.Fabrication;
import com.fromagerie_back.model.LotAffinage;
import com.fromagerie_back.model.PlacementAffinage;
import com.fromagerie_back.model.Recette;
import com.fromagerie_back.model.SoinAffinage;
import com.fromagerie_back.model.StatutLotAffinage;
import com.fromagerie_back.model.Utilisateur;
import com.fromagerie_back.repository.FabricationRepository;
import com.fromagerie_back.repository.LotAffinageRepository;
import com.fromagerie_back.repository.PlacementAffinageRepository;
import com.fromagerie_back.repository.SoinAffinageRepository;
import com.fromagerie_back.repository.UtilisateurRepository;

@Service
public class AffinageService {

    private final LotAffinageRepository lotRepository;
    private final FabricationRepository fabricationRepository;
    private final PlacementAffinageRepository placementRepository;
    private final SoinAffinageRepository soinRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final PlacementAffinageService placementService;
    private final CaveService caveService;

    public AffinageService(
            LotAffinageRepository lotRepository,
            FabricationRepository fabricationRepository,
            PlacementAffinageRepository placementRepository,
            SoinAffinageRepository soinRepository,
            UtilisateurRepository utilisateurRepository,
            PlacementAffinageService placementService,
            CaveService caveService) {
        this.lotRepository = lotRepository;
        this.fabricationRepository = fabricationRepository;
        this.placementRepository = placementRepository;
        this.soinRepository = soinRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.placementService = placementService;
        this.caveService = caveService;
    }

    @Transactional(readOnly = true)
    public List<AffinageListResponse> findAll() {
        List<LotAffinage> lots = lotRepository.findAllWithFabricationDetails();
        if (lots.isEmpty()) {
            return List.of();
        }
        Map<Long, List<PlacementAffinage>> actifsParLot = placementRepository
                .findActiveByLotIds(lots.stream().map(LotAffinage::getId).toList())
                .stream()
                .collect(Collectors.groupingBy(p -> p.getLotAffinage().getId()));
        return lots.stream()
                .map(lot -> toListResponse(lot, actifsParLot.getOrDefault(lot.getId(), List.of())))
                .toList();
    }

    @Transactional(readOnly = true)
    public AffinageDashboardResponse dashboard() {
        List<LotAffinage> lots = lotRepository.findAllWithFabricationDetails();
        List<PlacementAffinage> actifs = lots.isEmpty()
                ? List.of()
                : placementRepository.findActiveByLotIds(lots.stream().map(LotAffinage::getId).toList());
        Map<Long, List<PlacementAffinage>> actifsParLot = actifs.stream()
                .collect(Collectors.groupingBy(p -> p.getLotAffinage().getId()));
        List<AffinageAlertItemResponse> items = lots.stream()
                .map(lot -> toDashboardItem(lot, actifsParLot.getOrDefault(lot.getId(), List.of())))
                .toList();
        Map<Long, AffinageAlertItemResponse> itemsParLot = items.stream()
                .collect(Collectors.toMap(AffinageAlertItemResponse::lotId, item -> item));
        return new AffinageDashboardResponse(
                items.stream().filter(this::needsTurningToday)
                        .map(item -> withMessage(item, "Retournement à effectuer aujourd'hui"))
                        .toList(),
                items.stream().filter(this::isTurningLate)
                        .map(item -> withMessage(item, "Retournement en retard"))
                        .toList(),
                items.stream().filter(this::isReleaseSoon)
                        .map(item -> withMessage(item, releaseSoonMessage(item.joursRestants())))
                        .toList(),
                items.stream().filter(this::isReadyToRelease)
                        .map(item -> withMessage(item, "Sortie d'affinage à traiter"))
                        .toList(),
                lots.stream()
                        .filter(lot -> needsCaveMove(lot, actifsParLot.getOrDefault(lot.getId(), List.of())))
                        .map(lot -> withMessage(itemsParLot.get(lot.getId()), "La durée maximale recommandée dans la cave actuelle est atteinte"))
                        .toList(),
                (int) lots.stream().filter(lot -> lot.getStatut() != StatutLotAffinage.TERMINE).count(),
                (int) items.stream().filter(this::isReadyToRelease).count(),
                totalFreePlaces());
    }

    private AffinageAlertItemResponse withMessage(AffinageAlertItemResponse item, String message) {
        return new AffinageAlertItemResponse(
                item.lotId(), item.fabricationId(), item.numeroLot(), item.fromageNom(), item.recetteNom(),
                item.dateSortiePrevue(), item.joursRestants(), item.statut(), item.frequenceRetournementJours(),
                item.caveNom(), message, item.route());
    }

    private String releaseSoonMessage(long daysRemaining) {
        return "Sortie prévue dans " + daysRemaining + (daysRemaining > 1 ? " jours" : " jour");
    }

    @Transactional(readOnly = true)
    public AffinageCapacityPlanningResponse planification() {
        LocalDate today = LocalDate.now();
        List<CaveCapacityPlanningResponse> planning = caveService.findAll().stream()
                .map(cave -> toCapacityPlanning(cave, today))
                .toList();
        return new AffinageCapacityPlanningResponse(planning);
    }

    private CaveCapacityPlanningResponse toCapacityPlanning(CaveResponse cave, LocalDate today) {
        List<PlacementAffinage> placements = placementRepository.findActiveByCaveId(cave.id());
        int placesLibresMaintenant = Math.max(0, cave.capaciteDisponible());
        return new CaveCapacityPlanningResponse(
                cave.id(),
                cave.nom(),
                cave.capaciteTotale(),
                placesLibresMaintenant,
                forecastFreePlaces(placesLibresMaintenant, placements, today.plusDays(7)),
                forecastFreePlaces(placesLibresMaintenant, placements, today.plusDays(30)));
    }

    private int forecastFreePlaces(
            int currentFreePlaces,
            List<PlacementAffinage> placements,
            LocalDate horizon) {
        int releasedPlaces = placements.stream()
                .filter(placement -> !placement.getLotAffinage().getDateSortiePrevue().isAfter(horizon))
                .mapToInt(PlacementAffinage::getQuantite)
                .sum();
        return currentFreePlaces + releasedPlaces;
    }

    @Transactional(readOnly = true)
    public AffinageDetailResponse findById(Long id) {
        LotAffinage lot = findDetail(id);
        return toDetailResponse(lot);
    }

    @Transactional
    public AffinageDetailResponse create(AffinageCreateRequest request) {
        validateDates(request.dateMiseEnCave(), request.dateSortiePrevue());
        if (lotRepository.existsByFabricationId(request.fabricationId())) {
            throw new BusinessConflictException("Cette fabrication possède déjà un lot d'affinage");
        }
        Fabrication fabrication = fabricationRepository.findByIdWithDetails(request.fabricationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Fabrication introuvable : " + request.fabricationId()));

        LotAffinage lot = new LotAffinage();
        lot.setFabrication(fabrication);
        // Snapshot nécessaire pour préserver la quantité réellement entrée si la fabrication est corrigée ensuite.
        lot.setQuantiteInitiale(fabrication.getNombreFromages());
        lot.setDateMiseEnCave(request.dateMiseEnCave());
        lot.setDateSortiePrevue(request.dateSortiePrevue());
        lot.setStatut(StatutLotAffinage.EN_ATTENTE_PLACEMENT);
        try {
            lot = lotRepository.saveAndFlush(lot);
        } catch (DataIntegrityViolationException exception) {
            throw new BusinessConflictException("Cette fabrication possède déjà un lot d'affinage");
        }

        List<AffinagePlacementRequest> initiaux = request.emplacementsInitiaux();
        if (initiaux != null && !initiaux.isEmpty()) {
            placementService.placerLotComplet(lot.getId(), initiaux);
        } else if (request.emplacementInitial() != null) {
            AffinagePlacementRequest initial = request.emplacementInitial();
            placementService.placerLotComplet(
                    lot.getId(), initial.caveId(), initial.rangeeDepartId());
        }
        return toDetailResponse(findDetail(lot.getId()));
    }

    @Transactional
    public PlacementResultResponse placer(Long lotId, AffinagePlacementRequest request) {
        return placementService.placerReste(
                lotId, request.caveId(), request.rangeeDepartId());
    }

    @Transactional
    public PlacementResultResponse deplacer(Long lotId, DeplacementAffinageRequest request) {
        return placementService.deplacer(lotId, request);
    }

    @Transactional(readOnly = true)
    public List<SoinAffinageResponse> findSoins(Long lotId) {
        ensureLotExists(lotId);
        return soinRepository.findByLotAffinageIdOrderByDateHeureDesc(lotId).stream()
                .map(this::toSoinResponse)
                .toList();
    }

    @Transactional
    public SoinAffinageResponse addSoin(
            Long lotId,
            SoinAffinageRequest request,
            Authentication authentication) {
        LotAffinage lot = lotRepository.findById(lotId)
                .orElseThrow(() -> new ResourceNotFoundException("Lot d'affinage introuvable : " + lotId));
        Utilisateur utilisateur = utilisateurRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur authentifié introuvable"));
        LocalDateTime dateHeure = request.dateHeure() == null ? LocalDateTime.now() : request.dateHeure();
        LocalDate dateSoin = dateHeure.toLocalDate();
        if (!dateSoin.equals(LocalDate.now())) {
            throw new BusinessValidationException(
                    "La date du soin doit correspondre à la date du jour");
        }
        if (dateSoin.isBefore(lot.getDateMiseEnCave())) {
            throw new BusinessValidationException(
                    "La date du soin ne peut pas être antérieure à la mise en affinage");
        }

        SoinAffinage soin = new SoinAffinage();
        soin.setLotAffinage(lot);
        soin.setType(request.type());
        soin.setDateHeure(dateHeure);
        soin.setObservation(trimToNull(request.observation()));
        soin.setEtatCroute(trimToNull(request.etatCroute()));
        soin.setUtilisateur(utilisateur);
        return toSoinResponse(soinRepository.save(soin));
    }

    private AffinageDetailResponse toDetailResponse(LotAffinage lot) {
        List<PlacementAffinage> placements = placementRepository.findAllByLotIdWithLocation(lot.getId());
        List<PlacementAffinageResponse> actifs = placements.stream()
                .filter(PlacementAffinage::isActif)
                .map(placementService::toResponse)
                .toList();
        List<PlacementAffinageResponse> historique = placements.stream()
                .filter(placement -> !placement.isActif())
                .map(placementService::toResponse)
                .toList();
        List<SoinAffinageResponse> soins = soinRepository
                .findByLotAffinageIdOrderByDateHeureDesc(lot.getId())
                .stream().map(this::toSoinResponse).toList();
        int quantitePlacee = actifs.stream().mapToInt(PlacementAffinageResponse::quantite).sum();
        String etatCroute = soins.stream()
                .map(SoinAffinageResponse::etatCroute)
                .filter(value -> value != null && !value.isBlank())
                .findFirst().orElse(null);
        Fabrication fabrication = lot.getFabrication();

        return new AffinageDetailResponse(
                lot.getId(), fabrication.getId(), fabrication.getNumeroLot(),
                fabrication.getRecette().getFromage().getNom(), fabrication.getRecette().getNom(),
                fabrication.getOperateur() == null ? "Non renseigné" : fabrication.getOperateur().getNom(),
                lot.getDateMiseEnCave(), lot.getDateSortiePrevue(), joursRestants(lot), lot.getStatut(),
                lot.getQuantiteInitiale(), quantitePlacee, lot.getQuantiteInitiale() - quantitePlacee,
                cavesActuelles(placements), etatCroute, actifs, historique, soins);
    }

    private AffinageListResponse toListResponse(LotAffinage lot, List<PlacementAffinage> actifs) {
        int quantitePlacee = actifs.stream().mapToInt(PlacementAffinage::getQuantite).sum();
        Fabrication fabrication = lot.getFabrication();
        return new AffinageListResponse(
                lot.getId(), fabrication.getId(), fabrication.getNumeroLot(),
                fabrication.getRecette().getFromage().getNom(), fabrication.getRecette().getNom(),
                lot.getDateMiseEnCave(), lot.getDateSortiePrevue(), joursRestants(lot), lot.getStatut(),
                lot.getQuantiteInitiale(), quantitePlacee, lot.getQuantiteInitiale() - quantitePlacee,
                cavesActuelles(actifs));
    }

    private Set<String> cavesActuelles(List<PlacementAffinage> placements) {
        return placements.stream()
                .filter(PlacementAffinage::isActif)
                .map(placement -> placement.getRangee().getEtagere().getCave().getNom())
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private SoinAffinageResponse toSoinResponse(SoinAffinage soin) {
        return new SoinAffinageResponse(
                soin.getId(), soin.getType(), soin.getDateHeure(), soin.getObservation(),
                soin.getEtatCroute(), soin.getUtilisateur().getId(), soin.getUtilisateur().getNom());
    }

    private long joursRestants(LotAffinage lot) {
        return ChronoUnit.DAYS.between(LocalDate.now(), lot.getDateSortiePrevue());
    }

    private AffinageAlertItemResponse toDashboardItem(LotAffinage lot, List<PlacementAffinage> actifs) {
        Fabrication fabrication = lot.getFabrication();
        Recette recette = fabrication.getRecette();
        long joursRestants = joursRestants(lot);
        long joursDepuisDernierRetournement = joursDepuisDernierRetournement(lot.getId());
        String caveNom = actifs.stream()
                .map(p -> p.getRangee().getEtagere().getCave().getNom())
                .findFirst()
                .orElse("Aucune cave");
        return new AffinageAlertItemResponse(
                lot.getId(), fabrication.getId(), fabrication.getNumeroLot(),
                recette.getFromage().getNom(), recette.getNom(), lot.getDateSortiePrevue(),
                joursRestants, lot.getStatut(), recette.getFrequenceRetournementJours(),
                caveNom, buildMessage(joursRestants, joursDepuisDernierRetournement, recette.getFrequenceRetournementJours(), lot.getStatut()),
                "/affinage?lot=" + lot.getId());
    }

    private String buildMessage(long joursRestants, long joursDepuisDernierRetournement, Integer frequency, StatutLotAffinage statut) {
        if (statut == StatutLotAffinage.TERMINE) {
            return "Lot terminé";
        }
        if (joursRestants <= 0) {
            return "Sortie d'affinage à traiter";
        }
        if (frequency != null && frequency > 0) {
            return joursDepuisDernierRetournement >= frequency
                    ? "Retournement à effectuer aujourd'hui"
                    : "Retournement programmé tous les " + frequency + " jours";
        }
        return "Surveillance d'affinage";
    }

    private boolean needsTurningToday(AffinageAlertItemResponse item) {
        return item.frequenceRetournementJours() != null && item.frequenceRetournementJours() > 0
                && item.statut() != StatutLotAffinage.TERMINE
                && joursDepuisDernierRetournement(item.lotId()) >= item.frequenceRetournementJours()
                && item.joursRestants() >= 0;
    }

    private boolean isTurningLate(AffinageAlertItemResponse item) {
        return item.frequenceRetournementJours() != null && item.frequenceRetournementJours() > 0
                && item.statut() != StatutLotAffinage.TERMINE
                && joursDepuisDernierRetournement(item.lotId()) > item.frequenceRetournementJours()
                && item.joursRestants() >= 0;
    }

    private boolean isReleaseSoon(AffinageAlertItemResponse item) {
        return item.statut() != StatutLotAffinage.TERMINE
                && item.joursRestants() >= 1
                && item.joursRestants() <= 7;
    }

    private boolean isReadyToRelease(AffinageAlertItemResponse item) {
        return item.statut() != StatutLotAffinage.TERMINE && item.joursRestants() <= 0;
    }

    private boolean needsCaveMove(LotAffinage lot, List<PlacementAffinage> activePlacements) {
        if (lot.getStatut() == StatutLotAffinage.TERMINE || joursRestants(lot) <= 0) {
            return false;
        }
        long maturationDays = ChronoUnit.DAYS.between(lot.getDateMiseEnCave(), LocalDate.now());
        return activePlacements.stream()
                .filter(PlacementAffinage::isActif)
                .map(placement -> placement.getRangee().getEtagere().getCave())
                .anyMatch(cave -> cave.getAgeMaxJours() != null && maturationDays >= cave.getAgeMaxJours());
    }

    private int totalFreePlaces() {
        return caveService.findAll().stream()
                .mapToInt(cave -> Math.max(0, cave.capaciteTotale() - cave.capaciteOccupee()))
                .sum();
    }

    private long joursDepuisDernierRetournement(Long lotId) {
        return soinRepository.findByLotAffinageIdOrderByDateHeureDesc(lotId).stream()
                .filter(soin -> soin.getType() == com.fromagerie_back.model.TypeSoinAffinage.RETOURNEMENT)
                .map(SoinAffinage::getDateHeure)
                .findFirst()
                .map(dateHeure -> ChronoUnit.DAYS.between(dateHeure.toLocalDate(), LocalDate.now()))
                .orElse(-1L);
    }

    private LotAffinage findDetail(Long id) {
        return lotRepository.findByIdWithFabricationDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lot d'affinage introuvable : " + id));
    }

    private void ensureLotExists(Long id) {
        if (!lotRepository.existsById(id)) {
            throw new ResourceNotFoundException("Lot d'affinage introuvable : " + id);
        }
    }

    private void validateDates(LocalDate miseEnCave, LocalDate sortiePrevue) {
        if (sortiePrevue.isBefore(miseEnCave)) {
            throw new BusinessValidationException(
                    "La date de sortie prévue doit être postérieure à la mise en cave");
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
