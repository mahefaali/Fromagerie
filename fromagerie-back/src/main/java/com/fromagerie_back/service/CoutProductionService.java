package com.fromagerie_back.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fromagerie_back.dto.EmballageRequest;
import com.fromagerie_back.dto.EmballageResponse;
import com.fromagerie_back.dto.ConfigurationEmballageRequest;
import com.fromagerie_back.dto.ConfigurationEmballageResponse;
import com.fromagerie_back.dto.EquipementRequest;
import com.fromagerie_back.dto.EquipementResponse;
import com.fromagerie_back.dto.RegleAmortissementRequest;
import com.fromagerie_back.dto.RegleAmortissementResponse;
import com.fromagerie_back.dto.RegleCoutEnergieRequest;
import com.fromagerie_back.dto.RegleCoutEnergieResponse;
import com.fromagerie_back.dto.RegleMainOeuvreRequest;
import com.fromagerie_back.dto.RegleMainOeuvreResponse;
import com.fromagerie_back.exception.BusinessConflictException;
import com.fromagerie_back.exception.ResourceNotFoundException;
import com.fromagerie_back.model.Emballage;
import com.fromagerie_back.model.ConfigurationEmballage;
import com.fromagerie_back.model.Fromage;
import com.fromagerie_back.model.Equipement;
import com.fromagerie_back.model.RegleAmortissement;
import com.fromagerie_back.model.RegleCoutEnergie;
import com.fromagerie_back.model.RegleMainOeuvre;
import com.fromagerie_back.repository.EmballageRepository;
import com.fromagerie_back.repository.ConfigurationEmballageRepository;
import com.fromagerie_back.repository.FromageRepository;
import com.fromagerie_back.repository.EquipementRepository;
import com.fromagerie_back.repository.RegleAmortissementRepository;
import com.fromagerie_back.repository.RegleCoutEnergieRepository;
import com.fromagerie_back.repository.RegleMainOeuvreRepository;

@Service
public class CoutProductionService {
    private final EmballageRepository emballageRepository;
    private final RegleCoutEnergieRepository regleCoutEnergieRepository;
    private final RegleMainOeuvreRepository regleMainOeuvreRepository;
    private final EquipementRepository equipementRepository;
    private final RegleAmortissementRepository regleAmortissementRepository;
    private final ConfigurationEmballageRepository configurationEmballageRepository;
    private final FromageRepository fromageRepository;

    public CoutProductionService(EmballageRepository emballageRepository,
            RegleCoutEnergieRepository regleCoutEnergieRepository,
            RegleMainOeuvreRepository regleMainOeuvreRepository, EquipementRepository equipementRepository,
            RegleAmortissementRepository regleAmortissementRepository,
            ConfigurationEmballageRepository configurationEmballageRepository,
            FromageRepository fromageRepository) {
        this.emballageRepository = emballageRepository;
        this.regleCoutEnergieRepository = regleCoutEnergieRepository;
        this.regleMainOeuvreRepository = regleMainOeuvreRepository;
        this.equipementRepository = equipementRepository;
        this.regleAmortissementRepository = regleAmortissementRepository;
        this.configurationEmballageRepository = configurationEmballageRepository;
        this.fromageRepository = fromageRepository;
    }

    public List<EmballageResponse> findEmballages() { return emballageRepository.findAllByOrderByNomAsc().stream().map(this::toResponse).toList(); }
    @Transactional(readOnly = true)
    public List<ConfigurationEmballageResponse> findConfigurationsEmballages() {
        return configurationEmballageRepository.findAllByOrderByFromageNomAscEmballageNomAsc().stream()
                .map(this::toResponse).toList();
    }
    public List<RegleCoutEnergieResponse> findReglesEnergie() { return regleCoutEnergieRepository.findAllByOrderByTypeOperationAscDateDebutValiditeDesc().stream().map(this::toResponse).toList(); }
    public List<RegleMainOeuvreResponse> findReglesMainOeuvre() { return regleMainOeuvreRepository.findAllByOrderByTypeOperationAscDateDebutValiditeDesc().stream().map(this::toResponse).toList(); }
    public List<EquipementResponse> findEquipements() { return equipementRepository.findAllByOrderByNomAsc().stream().map(this::toResponse).toList(); }
    @Transactional(readOnly = true)
    public List<RegleAmortissementResponse> findReglesAmortissement() { return regleAmortissementRepository.findAllByOrderByEquipementNomAscDateDebutValiditeDesc().stream().map(this::toResponse).toList(); }

    @Transactional
    public EmballageResponse createEmballage(EmballageRequest request) { return toResponse(saveEmballage(new Emballage(), request)); }
    @Transactional
    public EmballageResponse updateEmballage(Long id, EmballageRequest request) { return toResponse(saveEmballage(findEmballage(id), request)); }
    @Transactional
    public ConfigurationEmballageResponse createConfigurationEmballage(ConfigurationEmballageRequest request) {
        return toResponse(saveConfigurationEmballage(new ConfigurationEmballage(), request));
    }
    @Transactional
    public ConfigurationEmballageResponse updateConfigurationEmballage(Long id,
            ConfigurationEmballageRequest request) {
        ConfigurationEmballage configuration = configurationEmballageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Configuration d'emballage introuvable : " + id));
        return toResponse(saveConfigurationEmballage(configuration, request));
    }
    @Transactional
    public RegleCoutEnergieResponse createRegleEnergie(RegleCoutEnergieRequest request) { return toResponse(saveRegle(new RegleCoutEnergie(), request)); }
    @Transactional
    public RegleCoutEnergieResponse updateRegleEnergie(Long id, RegleCoutEnergieRequest request) { return toResponse(saveRegle(findRegle(id), request)); }
    @Transactional
    public RegleMainOeuvreResponse createRegleMainOeuvre(RegleMainOeuvreRequest request) { return toResponse(saveRegleMainOeuvre(new RegleMainOeuvre(), request)); }
    @Transactional
    public RegleMainOeuvreResponse updateRegleMainOeuvre(Long id, RegleMainOeuvreRequest request) { return toResponse(saveRegleMainOeuvre(findRegleMainOeuvre(id), request)); }
    @Transactional
    public EquipementResponse createEquipement(EquipementRequest request) { return toResponse(saveEquipement(new Equipement(), request)); }
    @Transactional
    public EquipementResponse updateEquipement(Long id, EquipementRequest request) { return toResponse(saveEquipement(findEquipement(id), request)); }
    @Transactional
    public RegleAmortissementResponse createRegleAmortissement(RegleAmortissementRequest request) { return toResponse(saveRegleAmortissement(new RegleAmortissement(), request)); }
    @Transactional
    public RegleAmortissementResponse updateRegleAmortissement(Long id, RegleAmortissementRequest request) { return toResponse(saveRegleAmortissement(findRegleAmortissement(id), request)); }

    private Emballage saveEmballage(Emballage emballage, EmballageRequest request) {
        String nom = request.nom().trim();
        if (emballage.getId() == null ? emballageRepository.existsByNomIgnoreCase(nom)
                : emballageRepository.existsByNomIgnoreCaseAndIdNot(nom, emballage.getId())) {
            throw new BusinessConflictException("Un emballage portant ce nom existe déjà");
        }
        emballage.setNom(nom);
        emballage.setCoutUnitaire(request.coutUnitaire());
        emballage.setUnite(request.unite().trim());
        emballage.setActif(request.actif() == null || request.actif());
        return emballageRepository.saveAndFlush(emballage);
    }

    private ConfigurationEmballage saveConfigurationEmballage(ConfigurationEmballage configuration,
            ConfigurationEmballageRequest request) {
        boolean duplicate = configuration.getId() == null
                ? configurationEmballageRepository.existsByFromageIdAndEmballageId(request.fromageId(), request.emballageId())
                : configurationEmballageRepository.existsByFromageIdAndEmballageIdAndIdNot(
                        request.fromageId(), request.emballageId(), configuration.getId());
        if (duplicate) {
            throw new BusinessConflictException("Cet emballage est déjà configuré pour ce fromage");
        }
        Fromage fromage = fromageRepository.findById(request.fromageId())
                .orElseThrow(() -> new ResourceNotFoundException("Fromage introuvable : " + request.fromageId()));
        configuration.setFromage(fromage);
        configuration.setEmballage(findEmballage(request.emballageId()));
        configuration.setQuantiteParUnite(request.quantiteParUnite());
        configuration.setActif(request.actif() == null || request.actif());
        return configurationEmballageRepository.saveAndFlush(configuration);
    }

    private RegleCoutEnergie saveRegle(RegleCoutEnergie regle, RegleCoutEnergieRequest request) {
        validatePeriod(request.dateDebutValidite(), request.dateFinValidite());
        validateEnergieOverlap(regle.getId(), request);
        regle.setTypeOperation(request.typeOperation());
        regle.setCoutStandard(request.coutStandard());
        regle.setUniteCalcul(request.uniteCalcul());
        regle.setDateDebutValidite(request.dateDebutValidite());
        regle.setDateFinValidite(request.dateFinValidite());
        regle.setActif(request.actif() == null || request.actif());
        return regleCoutEnergieRepository.saveAndFlush(regle);
    }

    private RegleMainOeuvre saveRegleMainOeuvre(RegleMainOeuvre regle, RegleMainOeuvreRequest request) {
        validatePeriod(request.dateDebutValidite(), request.dateFinValidite());
        boolean overlaps = regleMainOeuvreRepository.findByTypeOperation(request.typeOperation()).stream()
                .filter(existing -> regle.getId() == null || !regle.getId().equals(existing.getId()))
                .anyMatch(existing -> overlaps(request.dateDebutValidite(), request.dateFinValidite(),
                        existing.getDateDebutValidite(), existing.getDateFinValidite()));
        if (overlaps) {
            throw new BusinessConflictException("La règle de main-d'œuvre chevauche une période existante pour cette opération");
        }
        regle.setTypeOperation(request.typeOperation());
        regle.setDureeStandardMinutes(request.dureeStandardMinutes());
        regle.setCoutHoraire(request.coutHoraire());
        regle.setDateDebutValidite(request.dateDebutValidite());
        regle.setDateFinValidite(request.dateFinValidite());
        regle.setActif(request.actif() == null || request.actif());
        return regleMainOeuvreRepository.saveAndFlush(regle);
    }

    private Equipement saveEquipement(Equipement equipement, EquipementRequest request) {
        String nom = request.nom().trim();
        if (equipement.getId() == null ? equipementRepository.existsByNomIgnoreCase(nom)
                : equipementRepository.existsByNomIgnoreCaseAndIdNot(nom, equipement.getId())) {
            throw new BusinessConflictException("Un équipement portant ce nom existe déjà");
        }
        equipement.setNom(nom);
        equipement.setDescription(normalizeNullable(request.description()));
        equipement.setActif(request.actif() == null || request.actif());
        return equipementRepository.saveAndFlush(equipement);
    }

    private RegleAmortissement saveRegleAmortissement(RegleAmortissement regle,
            RegleAmortissementRequest request) {
        validatePeriod(request.dateDebutValidite(), request.dateFinValidite());
        Equipement equipement = findEquipement(request.equipementId());
        boolean overlaps = regleAmortissementRepository.findByEquipementId(equipement.getId()).stream()
                .filter(existing -> regle.getId() == null || !regle.getId().equals(existing.getId()))
                .anyMatch(existing -> overlaps(request.dateDebutValidite(), request.dateFinValidite(),
                        existing.getDateDebutValidite(), existing.getDateFinValidite()));
        if (overlaps) {
            throw new BusinessConflictException("La règle d'amortissement chevauche une période existante pour cet équipement");
        }
        regle.setEquipement(equipement);
        regle.setCoutParFabrication(request.coutParFabrication());
        regle.setDateDebutValidite(request.dateDebutValidite());
        regle.setDateFinValidite(request.dateFinValidite());
        regle.setActif(request.actif() == null || request.actif());
        return regleAmortissementRepository.saveAndFlush(regle);
    }

    private void validatePeriod(LocalDate debut, LocalDate fin) {
        if (fin != null && fin.isBefore(debut)) {
            throw new BusinessConflictException("La période de validité est invalide");
        }
    }

    private void validateEnergieOverlap(Long currentId, RegleCoutEnergieRequest request) {
        if (Boolean.FALSE.equals(request.actif())) {
            return;
        }
        boolean overlaps = regleCoutEnergieRepository
                .findByTypeOperation(request.typeOperation()).stream()
                .filter(existing -> currentId == null || !currentId.equals(existing.getId()))
                .filter(RegleCoutEnergie::isActif)
                .anyMatch(existing -> overlaps(request.dateDebutValidite(), request.dateFinValidite(),
                        existing.getDateDebutValidite(), existing.getDateFinValidite()));
        if (overlaps) {
            throw new BusinessConflictException("La règle énergie chevauche une période existante pour ce type d'opération");
        }
    }

    private String normalizeNullable(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private boolean overlaps(LocalDate startA, LocalDate endA, LocalDate startB, LocalDate endB) {
        LocalDate effectiveEndA = endA == null ? LocalDate.MAX : endA;
        LocalDate effectiveEndB = endB == null ? LocalDate.MAX : endB;
        return !startA.isAfter(effectiveEndB) && !startB.isAfter(effectiveEndA);
    }

    private Emballage findEmballage(Long id) { return emballageRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Emballage introuvable avec l'id : " + id)); }
    private RegleCoutEnergie findRegle(Long id) { return regleCoutEnergieRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Règle énergie introuvable avec l'id : " + id)); }
    private RegleMainOeuvre findRegleMainOeuvre(Long id) { return regleMainOeuvreRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Règle de main-d'œuvre introuvable avec l'id : " + id)); }
    private Equipement findEquipement(Long id) { return equipementRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Équipement introuvable avec l'id : " + id)); }
    private RegleAmortissement findRegleAmortissement(Long id) { return regleAmortissementRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Règle d'amortissement introuvable avec l'id : " + id)); }

    private EmballageResponse toResponse(Emballage e) { return new EmballageResponse(e.getId(), e.getNom(), e.getCoutUnitaire(), e.getUnite(), e.isActif()); }
    private ConfigurationEmballageResponse toResponse(ConfigurationEmballage c) {
        return new ConfigurationEmballageResponse(c.getId(), c.getFromage().getId(), c.getFromage().getNom(),
                c.getEmballage().getId(), c.getEmballage().getNom(), c.getQuantiteParUnite(), c.isActif());
    }
    private RegleCoutEnergieResponse toResponse(RegleCoutEnergie r) { return new RegleCoutEnergieResponse(r.getId(), r.getTypeOperation(), r.getCoutStandard(), r.getUniteCalcul(), r.getDateDebutValidite(), r.getDateFinValidite(), r.isActif()); }
    private RegleMainOeuvreResponse toResponse(RegleMainOeuvre r) { return new RegleMainOeuvreResponse(r.getId(), r.getTypeOperation(), r.getDureeStandardMinutes(), r.getCoutHoraire(), r.getDateDebutValidite(), r.getDateFinValidite(), r.isActif()); }
    private EquipementResponse toResponse(Equipement e) { return new EquipementResponse(e.getId(), e.getNom(), e.getDescription(), e.isActif()); }
    private RegleAmortissementResponse toResponse(RegleAmortissement r) { return new RegleAmortissementResponse(r.getId(), r.getEquipement().getId(), r.getEquipement().getNom(), r.getCoutParFabrication(), r.getDateDebutValidite(), r.getDateFinValidite(), r.isActif()); }
}
