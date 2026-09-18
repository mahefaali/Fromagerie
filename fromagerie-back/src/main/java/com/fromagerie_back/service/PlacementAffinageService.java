package com.fromagerie_back.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fromagerie_back.dto.DeplacementAffinageRequest;
import com.fromagerie_back.dto.AffinagePlacementRequest;
import com.fromagerie_back.dto.PlacementAffinageResponse;
import com.fromagerie_back.dto.PlacementResultResponse;
import com.fromagerie_back.exception.BusinessValidationException;
import com.fromagerie_back.exception.ResourceNotFoundException;
import com.fromagerie_back.model.Cave;
import com.fromagerie_back.model.Etagere;
import com.fromagerie_back.model.LotAffinage;
import com.fromagerie_back.model.PlacementAffinage;
import com.fromagerie_back.model.Rangee;
import com.fromagerie_back.model.StatutLotAffinage;
import com.fromagerie_back.repository.CaveRepository;
import com.fromagerie_back.repository.LotAffinageRepository;
import com.fromagerie_back.repository.PlacementAffinageRepository;
import com.fromagerie_back.repository.RangeeRepository;

@Service
public class PlacementAffinageService {

    private final LotAffinageRepository lotRepository;
    private final CaveRepository caveRepository;
    private final PlacementAffinageRepository placementRepository;
    private final RangeeRepository rangeeRepository;

    public PlacementAffinageService(
            LotAffinageRepository lotRepository,
            CaveRepository caveRepository,
            PlacementAffinageRepository placementRepository,
            RangeeRepository rangeeRepository) {
        this.lotRepository = lotRepository;
        this.caveRepository = caveRepository;
        this.placementRepository = placementRepository;
        this.rangeeRepository = rangeeRepository;
    }

    @Transactional
    public PlacementResultResponse placerReste(
            Long lotId,
            Long caveId,
            Long rangeeDepartId) {
        LotAffinage lot = findLotForUpdate(lotId);
        Cave cave = lockCave(caveId);
        validerCaveAdaptee(lot, cave);
        validerCoherenceAvecPlacements(lotId, cave);
        int quantiteDejaPlacee = Math.toIntExact(placementRepository.sumActiveQuantityByLotId(lotId));
        int quantiteDemandee = lot.getQuantiteInitiale() - quantiteDejaPlacee;
        if (quantiteDemandee <= 0) {
            throw new BusinessValidationException("Le lot est déjà entièrement placé");
        }

        List<PlanSegment> plan = calculerPlan(
                cave, rangeeDepartId, quantiteDemandee, Set.of());
        List<PlacementAffinage> placements = sauvegarderPlan(lot, plan, LocalDateTime.now());
        int quantitePlacee = plan.stream().mapToInt(PlanSegment::quantite).sum();
        mettreAJourStatut(lot, quantiteDejaPlacee + quantitePlacee);

        return new PlacementResultResponse(
                quantiteDemandee,
                quantitePlacee,
                quantiteDemandee - quantitePlacee,
                quantitePlacee == quantiteDemandee,
                placements.stream().map(this::toResponse).toList());
    }

    @Transactional
    public PlacementResultResponse placerLotComplet(
            Long lotId,
            Long caveReferenceId,
            Long rangeeDepartId) {
        LotAffinage lot = findLotForUpdate(lotId);
        Cave reference = caveRepository.findById(caveReferenceId)
                .orElseThrow(() -> new ResourceNotFoundException("Cave introuvable : " + caveReferenceId));
        List<AffinagePlacementRequest> selections = new ArrayList<>();
        selections.add(new AffinagePlacementRequest(caveReferenceId, rangeeDepartId));
        caveRepository.findAll().stream()
                .filter(cave -> !cave.getId().equals(caveReferenceId))
                .filter(Cave::isActive)
                .filter(cave -> caveAccepteAgeDuLot(lot, cave))
                .filter(cave -> memesConditions(reference, cave))
                .sorted(Comparator.comparing(Cave::getNom).thenComparing(Cave::getId))
                .forEach(cave -> selections.add(new AffinagePlacementRequest(
                        cave.getId(), premiereRangee(cave).getId())));
        return placerLotComplet(lotId, selections);
    }

    @Transactional
    public PlacementResultResponse placerLotComplet(
            Long lotId,
            List<AffinagePlacementRequest> emplacements) {
        LotAffinage lot = findLotForUpdate(lotId);
        if (placementRepository.sumActiveQuantityByLotId(lotId) > 0) {
            throw new BusinessValidationException("Le placement initial du lot a déjà commencé");
        }

        if (emplacements == null || emplacements.isEmpty()) {
            throw new BusinessValidationException("Sélectionnez au moins une cave pour ce lot");
        }
        Set<Long> caveIds = emplacements.stream()
                .map(AffinagePlacementRequest::caveId)
                .collect(java.util.stream.Collectors.toSet());
        if (caveIds.size() != emplacements.size()) {
            throw new BusinessValidationException("Une cave ne peut être sélectionnée qu'une seule fois");
        }
        Map<Long, Cave> cavesVerrouillees = lockCaves(caveIds);
        Cave caveReference = cavesVerrouillees.get(emplacements.get(0).caveId());
        if (caveReference == null) {
            throw new ResourceNotFoundException("Cave introuvable : " + emplacements.get(0).caveId());
        }
        validerCaveAdaptee(lot, caveReference);

        List<Cave> cavesCompatibles = emplacements.stream().map(emplacement -> {
            Cave cave = cavesVerrouillees.get(emplacement.caveId());
            if (cave == null) throw new ResourceNotFoundException("Cave introuvable : " + emplacement.caveId());
            validerCaveAdaptee(lot, cave);
            if (!memesConditions(caveReference, cave)) {
                throw new BusinessValidationException("Les caves sélectionnées doivent avoir les mêmes conditions d'affinage");
            }
            return cave;
        }).toList();

        int capaciteDisponible = cavesCompatibles.stream()
                .mapToInt(this::capaciteDisponible)
                .sum();
        int quantiteDemandee = lot.getQuantiteInitiale();
        if (capaciteDisponible < quantiteDemandee) {
            throw new BusinessValidationException(
                    "Les places disponibles totales de toutes les caves compatibles ne peuvent pas accueillir ce lot de fabrication");
        }

        List<PlacementAffinage> placements = new ArrayList<>();
        int restant = quantiteDemandee;
        for (int index = 0; index < cavesCompatibles.size(); index++) {
            if (restant == 0) break;
            Cave cave = cavesCompatibles.get(index);
            Long rangeeDepartId = emplacements.get(index).rangeeDepartId();
            List<PlanSegment> plan = calculerPlan(cave, rangeeDepartId, restant, Set.of());
            placements.addAll(sauvegarderPlan(lot, plan, LocalDateTime.now()));
            restant -= plan.stream().mapToInt(PlanSegment::quantite).sum();
            Long premiereRangeeId = premiereRangee(cave).getId();
            if (restant > 0 && !premiereRangeeId.equals(rangeeDepartId)) {
                List<PlanSegment> complement = calculerPlan(
                        cave, premiereRangeeId, restant, Set.of());
                placements.addAll(sauvegarderPlan(lot, complement, LocalDateTime.now()));
                restant -= complement.stream().mapToInt(PlanSegment::quantite).sum();
            }
        }
        if (restant > 0) {
            throw new BusinessValidationException(
                    "Les places disponibles totales de toutes les caves compatibles ne peuvent pas accueillir ce lot de fabrication");
        }

        mettreAJourStatut(lot, quantiteDemandee);
        return new PlacementResultResponse(
                quantiteDemandee, quantiteDemandee, 0, true,
                placements.stream().map(this::toResponse).toList());
    }

    @Transactional
    public PlacementResultResponse deplacer(Long lotId, DeplacementAffinageRequest request) {
        LotAffinage lot = findLotForUpdate(lotId);
        List<PlacementAffinage> actifsAvantVerrou = placementRepository.findActiveByLotIdWithLocation(lotId);
        if (actifsAvantVerrou.isEmpty()) {
            throw new BusinessValidationException("Ce lot ne possède aucun placement actif à déplacer");
        }

        Set<Long> caveIds = new HashSet<>();
        caveIds.add(request.caveDestinationId());
        actifsAvantVerrou.forEach(p -> caveIds.add(p.getRangee().getEtagere().getCave().getId()));
        Map<Long, Cave> cavesVerrouillees = lockCaves(caveIds);

        List<PlacementAffinage> anciensPlacements = placementRepository.findActiveByLotIdWithLocation(lotId);
        int quantiteDemandee = anciensPlacements.stream().mapToInt(PlacementAffinage::getQuantite).sum();
        if (quantiteDemandee == 0) {
            throw new BusinessValidationException("Ce lot ne possède plus de placement actif à déplacer");
        }

        Cave destination = cavesVerrouillees.get(request.caveDestinationId());
        validerCaveAdaptee(lot, destination);
        Set<Long> placementsExclus = anciensPlacements.stream()
                .map(PlacementAffinage::getId)
                .collect(java.util.stream.Collectors.toSet());
        List<PlanSegment> plan = calculerPlan(
                destination,
                request.rangeeDepartId(),
                quantiteDemandee,
                placementsExclus);
        int capaciteTrouvee = plan.stream().mapToInt(PlanSegment::quantite).sum();
        if (capaciteTrouvee < quantiteDemandee) {
            throw new BusinessValidationException(
                    "La destination ne peut accueillir que " + capaciteTrouvee
                            + " fromage(s) sur " + quantiteDemandee);
        }

        LocalDateTime maintenant = LocalDateTime.now();
        anciensPlacements.forEach(placement -> placement.setDateFin(maintenant));
        List<PlacementAffinage> nouveauxPlacements = sauvegarderPlan(lot, plan, maintenant);
        mettreAJourStatut(lot, quantiteDemandee);

        return new PlacementResultResponse(
                quantiteDemandee,
                quantiteDemandee,
                0,
                true,
                nouveauxPlacements.stream().map(this::toResponse).toList());
    }

    private List<PlanSegment> calculerPlan(
            Cave cave,
            Long rangeeDepartId,
            int quantiteDemandee,
            Set<Long> placementsExclus) {
        if (!cave.isActive()) {
            throw new BusinessValidationException("La cave sélectionnée est inactive");
        }

        List<Rangee> rangees = cave.getEtageres().stream()
                .sorted(Comparator.comparing(Etagere::getOrdre).thenComparing(Etagere::getNumero))
                .flatMap(etagere -> etagere.getRangees().stream()
                        .sorted(Comparator.comparing(Rangee::getOrdre).thenComparing(Rangee::getNumero)))
                .toList();
        int indexDepart = -1;
        for (int index = 0; index < rangees.size(); index++) {
            if (rangees.get(index).getId().equals(rangeeDepartId)) {
                indexDepart = index;
                break;
            }
        }
        if (indexDepart < 0) {
            if (!rangeeRepository.existsById(rangeeDepartId)) {
                throw new ResourceNotFoundException("Rangée introuvable : " + rangeeDepartId);
            }
            throw new BusinessValidationException("La rangée de départ n'appartient pas à la cave sélectionnée");
        }
        Map<Long, boolean[]> occupations = new HashMap<>();
        for (PlacementAffinage placement : placementRepository.findActiveByCaveId(cave.getId())) {
            if (placementsExclus.contains(placement.getId())) {
                continue;
            }
            boolean[] rangeeOccupee = occupations.computeIfAbsent(
                    placement.getRangee().getId(),
                    ignored -> new boolean[placement.getRangee().getCapacite() + 1]);
            int fin = placement.getPositionDebut() + placement.getQuantite() - 1;
            for (int position = placement.getPositionDebut(); position <= fin; position++) {
                rangeeOccupee[position] = true;
            }
        }

        List<PlanSegment> plan = new ArrayList<>();
        int restant = quantiteDemandee;
        for (int index = indexDepart; index < rangees.size() && restant > 0; index++) {
            Rangee rangee = rangees.get(index);
            boolean[] occupe = occupations.computeIfAbsent(
                    rangee.getId(), ignored -> new boolean[rangee.getCapacite() + 1]);
            int position = 1;

            while (position <= rangee.getCapacite() && restant > 0) {
                while (position <= rangee.getCapacite() && occupe[position]) {
                    position++;
                }
                if (position > rangee.getCapacite()) {
                    break;
                }
                int debut = position;
                int quantite = 0;
                while (position <= rangee.getCapacite() && !occupe[position] && quantite < restant) {
                    occupe[position] = true;
                    quantite++;
                    position++;
                }
                plan.add(new PlanSegment(rangee, debut, quantite));
                restant -= quantite;
            }
        }
        return plan;
    }

    private List<PlacementAffinage> sauvegarderPlan(
            LotAffinage lot,
            List<PlanSegment> plan,
            LocalDateTime dateDebut) {
        List<PlacementAffinage> placements = plan.stream().map(segment -> {
            PlacementAffinage placement = new PlacementAffinage();
            placement.setLotAffinage(lot);
            placement.setRangee(segment.rangee());
            placement.setPositionDebut(segment.positionDebut());
            placement.setQuantite(segment.quantite());
            placement.setDateDebut(dateDebut);
            return placement;
        }).toList();
        return placementRepository.saveAllAndFlush(placements);
    }

    private void validerCaveAdaptee(LotAffinage lot, Cave cave) {
        if (!cave.isActive()) {
            throw new BusinessValidationException("La cave sélectionnée est inactive");
        }
        if (!caveAccepteAgeDuLot(lot, cave)) {
            throw new BusinessValidationException(
                    "La cave sélectionnée n'est pas adaptée à l'âge actuel de ce lot");
        }
    }

    private void validerCoherenceAvecPlacements(Long lotId, Cave destination) {
        placementRepository.findActiveByLotIdWithLocation(lotId).stream()
                .map(placement -> placement.getRangee().getEtagere().getCave())
                .filter(cave -> !memesConditions(cave, destination))
                .findAny()
                .ifPresent(cave -> {
                    throw new BusinessValidationException(
                            "Les caves utilisées pour un même lot doivent avoir les mêmes conditions de température, d'humidité et d'âge");
                });
    }

    private boolean caveAccepteAgeDuLot(LotAffinage lot, Cave cave) {
        long ageJours = Math.max(1, ChronoUnit.DAYS.between(lot.getDateMiseEnCave(), LocalDate.now()) + 1);
        return ageJours >= cave.getAgeMinJours() && ageJours <= cave.getAgeMaxJours();
    }

    private boolean memesConditions(Cave reference, Cave candidate) {
        return reference.getTemperature().compareTo(candidate.getTemperature()) == 0
                && reference.getHumidite().compareTo(candidate.getHumidite()) == 0
                && reference.getAgeMinJours().equals(candidate.getAgeMinJours())
                && reference.getAgeMaxJours().equals(candidate.getAgeMaxJours());
    }

    private int capaciteDisponible(Cave cave) {
        int capaciteTotale = cave.getEtageres().stream()
                .flatMap(etagere -> etagere.getRangees().stream())
                .mapToInt(Rangee::getCapacite)
                .sum();
        return Math.max(0, capaciteTotale
                - Math.toIntExact(placementRepository.sumActiveQuantityByCaveId(cave.getId())));
    }

    private Rangee premiereRangee(Cave cave) {
        return cave.getEtageres().stream()
                .sorted(Comparator.comparing(Etagere::getOrdre).thenComparing(Etagere::getNumero))
                .flatMap(etagere -> etagere.getRangees().stream()
                        .sorted(Comparator.comparing(Rangee::getOrdre).thenComparing(Rangee::getNumero)))
                .findFirst()
                .orElseThrow(() -> new BusinessValidationException("La cave sélectionnée ne contient aucune rangée"));
    }

    private LotAffinage findLotForUpdate(Long lotId) {
        return lotRepository.findByIdForUpdate(lotId)
                .orElseThrow(() -> new ResourceNotFoundException("Lot d'affinage introuvable : " + lotId));
    }

    private Cave lockCave(Long caveId) {
        return caveRepository.findByIdForUpdate(caveId)
                .orElseThrow(() -> new ResourceNotFoundException("Cave introuvable : " + caveId));
    }

    private Map<Long, Cave> lockCaves(Set<Long> caveIds) {
        Map<Long, Cave> caves = new HashMap<>();
        caveIds.stream().sorted().forEach(caveId -> caves.put(caveId, lockCave(caveId)));
        return caves;
    }

    private void mettreAJourStatut(LotAffinage lot, int quantitePlacee) {
        if (lot.getStatut() == StatutLotAffinage.TERMINE) {
            return;
        }
        if (quantitePlacee <= 0) {
            lot.setStatut(StatutLotAffinage.EN_ATTENTE_PLACEMENT);
        } else if (quantitePlacee < lot.getQuantiteInitiale()) {
            lot.setStatut(StatutLotAffinage.PARTIELLEMENT_PLACE);
        } else {
            lot.setStatut(StatutLotAffinage.EN_AFFINAGE);
        }
    }

    public PlacementAffinageResponse toResponse(PlacementAffinage placement) {
        Rangee rangee = placement.getRangee();
        Etagere etagere = rangee.getEtagere();
        Cave cave = etagere.getCave();
        return new PlacementAffinageResponse(
                placement.getId(), cave.getId(), cave.getNom(), etagere.getId(), etagere.getNumero(),
                rangee.getId(), rangee.getNumero(), placement.getPositionDebut(),
                placement.getPositionDebut() + placement.getQuantite() - 1,
                placement.getQuantite(), placement.getDateDebut(), placement.getDateFin(), placement.isActif());
    }

    private record PlanSegment(Rangee rangee, int positionDebut, int quantite) {
    }
}
