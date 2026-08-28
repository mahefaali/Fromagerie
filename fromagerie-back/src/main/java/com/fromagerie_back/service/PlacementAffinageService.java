package com.fromagerie_back.service;

import java.time.LocalDateTime;
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
        return placementRepository.saveAll(placements);
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
