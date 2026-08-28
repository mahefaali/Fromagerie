package com.fromagerie_back.service;

import java.util.HashSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Comparator;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fromagerie_back.dto.CaveRequest;
import com.fromagerie_back.dto.CaveOccupationResponse;
import com.fromagerie_back.dto.CaveResponse;
import com.fromagerie_back.dto.EtagereRequest;
import com.fromagerie_back.dto.EtagereResponse;
import com.fromagerie_back.dto.RangeeRequest;
import com.fromagerie_back.dto.RangeeResponse;
import com.fromagerie_back.exception.BusinessConflictException;
import com.fromagerie_back.exception.BusinessValidationException;
import com.fromagerie_back.exception.ResourceNotFoundException;
import com.fromagerie_back.model.Cave;
import com.fromagerie_back.model.Etagere;
import com.fromagerie_back.model.PlacementAffinage;
import com.fromagerie_back.model.Rangee;
import com.fromagerie_back.repository.CaveRepository;
import com.fromagerie_back.repository.PlacementAffinageRepository;

@Service
public class CaveService {

    private final CaveRepository caveRepository;
    private final PlacementAffinageRepository placementRepository;

    public CaveService(
            CaveRepository caveRepository,
            PlacementAffinageRepository placementRepository) {
        this.caveRepository = caveRepository;
        this.placementRepository = placementRepository;
    }

    @Transactional(readOnly = true)
    public List<CaveResponse> findAll() {
        List<Cave> caves = caveRepository.findAllByOrderByNomAsc();
        Map<Long, Integer> occupations = findRangeeOccupations(caves);
        return caves.stream().map(cave -> toResponse(cave, occupations)).toList();
    }

    @Transactional(readOnly = true)
    public CaveResponse findById(Long id) {
        Cave cave = findCave(id);
        return toResponse(cave, findRangeeOccupations(List.of(cave)));
    }

    @Transactional(readOnly = true)
    public List<CaveOccupationResponse> findOccupations(Long id) {
        findCave(id);
        return placementRepository.findActiveByCaveId(id).stream()
                .sorted(Comparator
                        .comparing((PlacementAffinage placement) ->
                                placement.getRangee().getEtagere().getOrdre())
                        .thenComparing(placement -> placement.getRangee().getOrdre())
                        .thenComparing(PlacementAffinage::getPositionDebut))
                .map(placement -> new CaveOccupationResponse(
                        placement.getId(),
                        placement.getRangee().getEtagere().getNumero(),
                        placement.getRangee().getNumero(),
                        placement.getPositionDebut(),
                        placement.getPositionDebut() + placement.getQuantite() - 1,
                        placement.getLotAffinage().getFabrication().getNumeroLot()))
                .toList();
    }

    @Transactional
    public CaveResponse create(CaveRequest request) {
        validate(request);
        Cave cave = new Cave();
        apply(cave, request);
        Cave saved = caveRepository.save(cave);
        return toResponse(saved, findRangeeOccupations(List.of(saved)));
    }

    @Transactional
    public CaveResponse update(Long id, CaveRequest request) {
        validate(request);
        Cave cave = findCave(id);
        boolean structureModifiee = !hasSameStructure(cave, request);
        if (structureModifiee && placementRepository.existsByRangeeEtagereCaveId(id)) {
            throw new BusinessConflictException(
                    "Une cave ayant un historique d'affinage ne peut plus changer de structure");
        }
        applyMetadata(cave, request);
        if (structureModifiee) {
            cave.replaceEtageres(List.of());
            caveRepository.flush();
            cave.replaceEtageres(request.etageres().stream().map(this::toEntity).toList());
        }
        Cave saved = caveRepository.save(cave);
        return toResponse(saved, findRangeeOccupations(List.of(saved)));
    }

    @Transactional
    public void delete(Long id) {
        Cave cave = findCave(id);
        if (placementRepository.existsByRangeeEtagereCaveId(id)) {
            throw new BusinessConflictException(
                    "Cette cave possède un historique d'affinage et doit être désactivée");
        }
        caveRepository.delete(cave);
    }

    private Cave findCave(Long id) {
        return caveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cave introuvable : " + id));
    }

    private void validate(CaveRequest request) {
        if (request.ageMaxJours() <= request.ageMinJours()) {
            throw new BusinessValidationException("L'âge maximum doit être supérieur à l'âge minimum");
        }

        Set<Integer> numerosEtageres = new HashSet<>();
        for (EtagereRequest etagere : request.etageres()) {
            if (!numerosEtageres.add(etagere.numero())) {
                throw new BusinessConflictException(
                        "Le numéro d'étagère " + etagere.numero() + " est utilisé plusieurs fois");
            }
            Set<Integer> numerosRangees = new HashSet<>();
            for (RangeeRequest rangee : etagere.rangees()) {
                if (!numerosRangees.add(rangee.numero())) {
                    throw new BusinessConflictException(
                            "Le numéro de rangée " + rangee.numero()
                                    + " est utilisé plusieurs fois dans l'étagère " + etagere.numero());
                }
            }
        }
    }

    private void apply(Cave cave, CaveRequest request) {
        applyMetadata(cave, request);
        cave.replaceEtageres(request.etageres().stream().map(this::toEntity).toList());
    }

    private void applyMetadata(Cave cave, CaveRequest request) {
        cave.setNom(request.nom().trim());
        cave.setDescription(request.description() == null ? null : request.description().trim());
        cave.setTemperature(request.temperature());
        cave.setHumidite(request.humidite());
        cave.setAgeMinJours(request.ageMinJours());
        cave.setAgeMaxJours(request.ageMaxJours());
        cave.setActive(request.active() == null || request.active());
    }

    private boolean hasSameStructure(Cave cave, CaveRequest request) {
        if (cave.getEtageres().size() != request.etageres().size()) {
            return false;
        }
        return request.etageres().stream().allMatch(etagereRequest -> cave.getEtageres().stream()
                .filter(etagere -> etagere.getNumero() == etagereRequest.numero()
                        && etagere.getOrdre() == etagereRequest.ordre())
                .anyMatch(etagere -> etagere.getRangees().size() == etagereRequest.rangees().size()
                        && etagereRequest.rangees().stream().allMatch(rangeeRequest -> etagere.getRangees().stream()
                                .anyMatch(rangee -> rangee.getNumero() == rangeeRequest.numero()
                                        && rangee.getOrdre() == rangeeRequest.ordre()
                                        && rangee.getCapacite() == rangeeRequest.capacite()))));
    }

    private Etagere toEntity(EtagereRequest request) {
        Etagere etagere = new Etagere();
        etagere.setNumero(request.numero());
        etagere.setOrdre(request.ordre());
        request.rangees().forEach(rangeeRequest -> etagere.addRangee(toEntity(rangeeRequest)));
        return etagere;
    }

    private Rangee toEntity(RangeeRequest request) {
        Rangee rangee = new Rangee();
        rangee.setNumero(request.numero());
        rangee.setOrdre(request.ordre());
        rangee.setCapacite(request.capacite());
        return rangee;
    }

    private CaveResponse toResponse(Cave cave, Map<Long, Integer> occupations) {
        List<EtagereResponse> etageres = cave.getEtageres().stream()
                .sorted(Comparator.comparing(Etagere::getOrdre).thenComparing(Etagere::getNumero))
                .map(etagere -> new EtagereResponse(
                        etagere.getId(),
                        etagere.getNumero(),
                        etagere.getOrdre(),
                        etagere.getRangees().stream()
                                .sorted(Comparator.comparing(Rangee::getOrdre).thenComparing(Rangee::getNumero))
                                .map(rangee -> {
                                    int capaciteOccupee = occupations.getOrDefault(rangee.getId(), 0);
                                    return new RangeeResponse(
                                            rangee.getId(), rangee.getNumero(), rangee.getOrdre(),
                                            rangee.getCapacite(), capaciteOccupee,
                                            rangee.getCapacite() - capaciteOccupee);
                                })
                                .toList()))
                .toList();
        int capaciteTotale = etageres.stream()
                .flatMap(etagere -> etagere.rangees().stream())
                .mapToInt(RangeeResponse::capacite)
                .sum();
        int capaciteOccupee = etageres.stream()
                .flatMap(etagere -> etagere.rangees().stream())
                .mapToInt(RangeeResponse::capaciteOccupee)
                .sum();

        return new CaveResponse(
                cave.getId(), cave.getNom(), cave.getDescription(), cave.getTemperature(),
                cave.getHumidite(), cave.getAgeMinJours(), cave.getAgeMaxJours(),
                cave.isActive(), capaciteTotale, capaciteOccupee,
                capaciteTotale - capaciteOccupee, etageres);
    }

    private Map<Long, Integer> findRangeeOccupations(List<Cave> caves) {
        List<Long> rangeeIds = caves.stream()
                .flatMap(cave -> cave.getEtageres().stream())
                .flatMap(etagere -> etagere.getRangees().stream())
                .map(Rangee::getId)
                .filter(java.util.Objects::nonNull)
                .toList();
        if (rangeeIds.isEmpty()) {
            return Map.of();
        }
        Map<Long, Integer> occupations = new HashMap<>();
        placementRepository.sumActiveQuantityByRangeeIds(rangeeIds).forEach(row ->
                occupations.put((Long) row[0], Math.toIntExact((Long) row[1])));
        return occupations;
    }
}
