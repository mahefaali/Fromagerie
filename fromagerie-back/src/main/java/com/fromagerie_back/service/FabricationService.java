package com.fromagerie_back.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fromagerie_back.dto.FabricationCreateRequest;
import com.fromagerie_back.dto.FabricationDetailResponse;
import com.fromagerie_back.dto.FabricationListResponse;
import com.fromagerie_back.dto.FabricationRequest;
import com.fromagerie_back.dto.FabricationUpdateRequest;
import com.fromagerie_back.dto.RecetteVarianteResponse;
import com.fromagerie_back.exception.BusinessConflictException;
import com.fromagerie_back.exception.BusinessValidationException;
import com.fromagerie_back.exception.NumeroLotConflictException;
import com.fromagerie_back.exception.ResourceNotFoundException;
import com.fromagerie_back.model.Fabrication;
import com.fromagerie_back.model.Fromage;
import com.fromagerie_back.model.Recette;
import com.fromagerie_back.model.Utilisateur;
import com.fromagerie_back.repository.FabricationRepository;
import com.fromagerie_back.repository.FromageRepository;
import com.fromagerie_back.repository.RecetteRepository;
import com.fromagerie_back.repository.UtilisateurRepository;
import com.fromagerie_back.security.CustomUserDetails;

@Service
public class FabricationService {

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);
    private static final int RENDEMENT_SCALE = 2;

    private final FabricationRepository fabricationRepository;
    private final RecetteRepository recetteRepository;
    private final FromageRepository fromageRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final NumeroLotService numeroLotService;

    public FabricationService(
            FabricationRepository fabricationRepository,
            RecetteRepository recetteRepository,
            FromageRepository fromageRepository,
            UtilisateurRepository utilisateurRepository,
            NumeroLotService numeroLotService) {
        this.fabricationRepository = fabricationRepository;
        this.recetteRepository = recetteRepository;
        this.fromageRepository = fromageRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.numeroLotService = numeroLotService;
    }

    @Transactional(readOnly = true)
    public List<FabricationListResponse> findAll() {
        return fabricationRepository.findAllWithDetailsOrderByDateHeureDebutDesc()
                .stream()
                .map(this::toListResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public FabricationDetailResponse findById(Long id) {
        return toDetailResponse(findWithDetails(id));
    }

    @Transactional
    public FabricationDetailResponse create(FabricationCreateRequest request) {
        Recette recette = resolveActiveRecipe(request);
        Utilisateur operateur = findCurrentUser();
        LocalDate date = request.getDateHeureDebut().toLocalDate();
        String numeroLot = numeroLotService.genererNumeroLot(date);

        Fabrication fabrication = new Fabrication();
        fabrication.setNumeroLot(numeroLot);
        fabrication.setOperateur(operateur);
        applyRequest(fabrication, recette, request);

        try {
            return toDetailResponse(fabricationRepository.saveAndFlush(fabrication));
        } catch (DataIntegrityViolationException exception) {
            throw new NumeroLotConflictException(numeroLot);
        }
    }

    @Transactional(readOnly = true)
    public List<RecetteVarianteResponse> findAvailableVariants(Long fromageId) {
        List<Recette> versions = findVersionsForExistingCheese(fromageId);
        Map<String, List<Recette>> variants = groupByVariant(versions);

        return variants.entrySet().stream()
                .map(entry -> activeRecipe(entry.getKey(), entry.getValue(), false))
                .filter(java.util.Optional::isPresent)
                .map(java.util.Optional::orElseThrow)
                .map(recipe -> new RecetteVarianteResponse(recipe.getVarianteKey(), recipe.getNom()))
                .sorted((first, second) -> first.libelle().compareToIgnoreCase(second.libelle()))
                .toList();
    }

    @Transactional
    public FabricationDetailResponse update(Long id, FabricationUpdateRequest request) {
        Fabrication fabrication = findWithDetails(id);
        Recette recette = findRecette(request.getRecetteId());

        applyRequest(fabrication, recette, request);
        return toDetailResponse(fabricationRepository.saveAndFlush(fabrication));
    }

    private Fabrication findWithDetails(Long id) {
        return fabricationRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Fabrication introuvable avec l'id : " + id));
    }

    private Recette findRecette(Long recetteId) {
        Recette recette = recetteRepository.findByIdWithFromage(recetteId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Recette introuvable avec l'id : " + recetteId));

        if (recette.getFromage() == null) {
            throw new ResourceNotFoundException(
                    "Aucun fromage n'est associé à la recette " + recetteId);
        }
        return recette;
    }

    private Recette resolveActiveRecipe(FabricationCreateRequest request) {
        Long fromageId = request.getFromageId();
        String variante = normalizeVariant(request.getVariante());

        // Compatibility for clients still sending recetteId: it identifies the logical
        // variant only and can never force an historical version.
        if (fromageId == null && request.getRecetteId() != null) {
            Recette requestedRecipe = findRecette(request.getRecetteId());
            fromageId = requestedRecipe.getFromage().getId();
            variante = requestedRecipe.getVarianteKey();
        }

        if (fromageId == null) {
            throw new BusinessValidationException("Le fromage est obligatoire");
        }

        List<Recette> versions = findVersionsForExistingCheese(fromageId);
        Map<String, List<Recette>> variants = groupByVariant(versions);
        if (variants.isEmpty()) {
            throw new BusinessValidationException(
                    "Aucune recette n'est définie pour le fromage " + fromageId);
        }

        String selectedVariant = variante;
        if (selectedVariant == null) {
            if (variants.size() != 1) {
                throw new BusinessValidationException(
                        "La variante est obligatoire lorsque plusieurs variantes existent pour le fromage "
                                + fromageId);
            }
            selectedVariant = variants.keySet().iterator().next();
        }

        List<Recette> variantVersions = variants.get(selectedVariant);
        if (variantVersions == null) {
            throw new ResourceNotFoundException(
                    "Variante introuvable pour le fromage " + fromageId + " : " + selectedVariant);
        }

        return activeRecipe(selectedVariant, variantVersions, true).orElseThrow();
    }

    private List<Recette> findVersionsForExistingCheese(Long fromageId) {
        if (!fromageRepository.existsById(fromageId)) {
            throw new ResourceNotFoundException("Fromage introuvable avec l'id : " + fromageId);
        }
        return recetteRepository.findVersionsByFromageId(fromageId);
    }

    private Map<String, List<Recette>> groupByVariant(List<Recette> versions) {
        Map<String, List<Recette>> variants = new LinkedHashMap<>();
        for (Recette recipe : versions) {
            String key = normalizeVariant(recipe.getVarianteKey());
            if (key == null) {
                throw new BusinessConflictException(
                        "La recette " + recipe.getId() + " ne possède aucune clé de variante");
            }
            variants.computeIfAbsent(key, ignored -> new java.util.ArrayList<>()).add(recipe);
        }
        return variants;
    }

    private java.util.Optional<Recette> activeRecipe(
            String variante,
            List<Recette> versions,
            boolean required) {
        List<Recette> activeVersions = versions.stream()
                .filter(Recette::isActive)
                .toList();
        if (activeVersions.size() > 1) {
            throw new BusinessConflictException(
                    "Plusieurs versions actives existent pour la variante " + variante);
        }
        if (activeVersions.isEmpty() && required) {
            throw new BusinessValidationException(
                    "Aucune version active n'existe pour la variante " + variante);
        }
        return activeVersions.stream().findFirst();
    }

    private String normalizeVariant(String variante) {
        return variante == null || variante.isBlank() ? null : variante.trim();
    }

    private Utilisateur findCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new AuthenticationCredentialsNotFoundException("Authentification requise");
        }

        return utilisateurRepository.findById(userDetails.getId())
                .filter(Utilisateur::isActif)
                .orElseThrow(() -> new AuthenticationCredentialsNotFoundException(
                        "Utilisateur authentifié introuvable ou inactif"));
    }

    private void applyRequest(
            Fabrication fabrication,
            Recette recette,
            FabricationRequest request) {
        validatePhysicalCoherence(request);
        fabrication.setDateHeureDebut(request.getDateHeureDebut());
        fabrication.setRecette(recette);
        fabrication.setQuantiteLait(request.getQuantiteLait());
        fabrication.setTemperatureLait(request.getTemperatureLait());
        fabrication.setOrigineLait(request.getOrigineLait());
        fabrication.setTemperatureChauffage(request.getTemperatureChauffage());
        fabrication.setDureeChauffageMinutes(request.getDureeChauffageMinutes());
        fabrication.setTypePresure(request.getTypePresure().trim());
        fabrication.setQuantitePresure(request.getQuantitePresure());
        fabrication.setTypeFerments(request.getTypeFerments().trim());
        fabrication.setQuantiteFerments(request.getQuantiteFerments());
        fabrication.setTemperatureMiseEnMoule(request.getTemperatureMiseEnMoule());
        fabrication.setDureeEgouttageMinutes(request.getDureeEgouttageMinutes());
        fabrication.setPoidsTotalFromages(request.getPoidsTotalFromages());
        fabrication.setNombreFromages(request.getNombreFromages());
        fabrication.setObservations(normalizeObservations(request.getObservations()));
        fabrication.setRendement(calculateRendement(
                request.getPoidsTotalFromages(),
                request.getQuantiteLait()));
    }

    private void validatePhysicalCoherence(FabricationRequest request) {
        if (request.getPoidsTotalFromages() != null
                && request.getQuantiteLait() != null
                && request.getPoidsTotalFromages().compareTo(request.getQuantiteLait()) > 0) {
            throw new BusinessValidationException(
                    "Le poids total des fromages ne peut pas dépasser la quantité de lait.");
        }
    }

    private BigDecimal calculateRendement(BigDecimal poidsTotalFromages, BigDecimal quantiteLait) {
        return poidsTotalFromages
                .multiply(ONE_HUNDRED)
                .divide(quantiteLait, RENDEMENT_SCALE, RoundingMode.HALF_UP);
    }

    private String normalizeObservations(String observations) {
        return observations == null || observations.isBlank() ? null : observations.trim();
    }

    private FabricationListResponse toListResponse(Fabrication fabrication) {
        Recette recette = fabrication.getRecette();
        Fromage fromage = recette.getFromage();
        Utilisateur operateur = fabrication.getOperateur();

        return new FabricationListResponse(
                fabrication.getId(),
                fabrication.getNumeroLot(),
                fabrication.getDateHeureDebut(),
                fromage.getId(),
                fromage.getNom(),
                recette.getId(),
                recette.getNom(),
                fabrication.getQuantiteLait(),
                fabrication.getPoidsTotalFromages(),
                fabrication.getNombreFromages(),
                fabrication.getRendement(),
                operateur == null ? null : operateur.getId(),
                operateur == null ? "Opérateur historique non renseigné" : operateur.getNom());
    }

    private FabricationDetailResponse toDetailResponse(Fabrication fabrication) {
        Recette recette = fabrication.getRecette();
        Fromage fromage = recette.getFromage();
        Utilisateur operateur = fabrication.getOperateur();

        return new FabricationDetailResponse(
                fabrication.getId(),
                fabrication.getNumeroLot(),
                fabrication.getDateHeureDebut(),
                recette.getId(),
                recette.getNom(),
                fromage.getId(),
                fromage.getNom(),
                fabrication.getQuantiteLait(),
                fabrication.getTemperatureLait(),
                fabrication.getOrigineLait(),
                fabrication.getTemperatureChauffage(),
                fabrication.getDureeChauffageMinutes(),
                fabrication.getTypePresure(),
                fabrication.getQuantitePresure(),
                fabrication.getTypeFerments(),
                fabrication.getQuantiteFerments(),
                fabrication.getTemperatureMiseEnMoule(),
                fabrication.getDureeEgouttageMinutes(),
                fabrication.getPoidsTotalFromages(),
                fabrication.getNombreFromages(),
                fabrication.getRendement(),
                fabrication.getObservations(),
                operateur == null ? null : operateur.getId(),
                operateur == null ? "Opérateur historique non renseigné" : operateur.getNom());
    }
}
