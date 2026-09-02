package com.fromagerie_back.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fromagerie_back.dto.RecetteCreateRequest;
import com.fromagerie_back.dto.RecetteDetailResponse;
import com.fromagerie_back.dto.RecetteHistoryResponse;
import com.fromagerie_back.dto.RecetteIngredientRequest;
import com.fromagerie_back.dto.RecetteIngredientResponse;
import com.fromagerie_back.dto.RecetteListResponse;
import com.fromagerie_back.dto.RecetteVersionRequest;
import com.fromagerie_back.exception.BusinessConflictException;
import com.fromagerie_back.exception.BusinessValidationException;
import com.fromagerie_back.exception.FromageNotFoundException;
import com.fromagerie_back.exception.ResourceNotFoundException;
import com.fromagerie_back.model.Fromage;
import com.fromagerie_back.model.MatierePremiere;
import com.fromagerie_back.model.Recette;
import com.fromagerie_back.model.RecetteIngredient;
import com.fromagerie_back.repository.FromageRepository;
import com.fromagerie_back.repository.MatierePremiereRepository;
import com.fromagerie_back.repository.RecetteRepository;

@Service
public class RecetteService {

    private static final int MONEY_SCALE = 2;
    private static final String BASE_RECIPE_PREFIX = "legacy-";
    private static final BigDecimal DEFAULT_MILK_REFERENCE_QUANTITY = new BigDecimal("100.0000");

    private final RecetteRepository recetteRepository;
    private final FromageRepository fromageRepository;
    private final MatierePremiereRepository matierePremiereRepository;

    public RecetteService(
            RecetteRepository recetteRepository,
            FromageRepository fromageRepository,
            MatierePremiereRepository matierePremiereRepository) {
        this.recetteRepository = recetteRepository;
        this.fromageRepository = fromageRepository;
        this.matierePremiereRepository = matierePremiereRepository;
    }

    @Transactional(readOnly = true)
    public List<RecetteListResponse> findAll(Long fromageId, Boolean active, String nom) {
        if (fromageId != null && !fromageRepository.existsById(fromageId)) {
            throw new FromageNotFoundException(fromageId);
        }
        return recetteRepository.findForList(fromageId, active, nom)
                .stream()
                .map(this::toListResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RecetteDetailResponse findById(Long id) {
        return toDetailResponse(findDetail(id));
    }

    @Transactional
    public RecetteDetailResponse create(RecetteCreateRequest request) {
        Fromage fromage = fromageRepository.findById(request.getFromageId())
                .orElseThrow(() -> new FromageNotFoundException(request.getFromageId()));

        Recette recette = new Recette(request.getNom().trim());
        recette.setFromage(fromage);
        recette.setVarianteKey(request.isRecetteDeBase()
                ? baseRecipeKey(fromage)
                : UUID.randomUUID().toString());
        recette.setNumeroVersion(1);
        recette.setActive(true);
        recette.setDateCreation(LocalDateTime.now());
        recette.setFrequenceRetournementJours(normalizeFrequency(request.getFrequenceRetournementJours()));
        recette.setQuantiteLaitReference(normalizeMilkReference(request.getQuantiteLaitReference(),
                DEFAULT_MILK_REFERENCE_QUANTITY));
        recette.setCoutMatiereEstime(addIngredients(recette, request.getIngredients()));
        return save(recette, "Une recette portant cette version existe déjà");
    }

    @Transactional
    public RecetteDetailResponse createVersion(Long sourceId, RecetteVersionRequest request) {
        Recette source = recetteRepository.findByIdForVersioning(sourceId)
                .orElseThrow(() -> recipeNotFound(sourceId));
        if (!source.isActive()) {
            throw new BusinessConflictException(
                    "Seule la version courante d'une recette peut être versionnée");
        }

        source.setActive(false);
        Recette next = new Recette(request.getNom().trim());
        next.setFromage(source.getFromage());
        next.setVarianteKey(source.getVarianteKey());
        next.setNumeroVersion(version(source) + 1);
        next.setActive(true);
        next.setDateCreation(LocalDateTime.now());
        next.setFrequenceRetournementJours(normalizeFrequency(request.getFrequenceRetournementJours()));
        next.setQuantiteLaitReference(normalizeMilkReference(request.getQuantiteLaitReference(),
                source.getQuantiteLaitReference()));
        next.setCoutMatiereEstime(addIngredients(next, request.getIngredients()));

        recetteRepository.save(source);
        return save(next, "Conflit de version: cette version existe déjà");
    }

    @Transactional(readOnly = true)
    public List<RecetteHistoryResponse> history(Long id) {
        Recette source = recetteRepository.findByIdWithFromage(id)
                .orElseThrow(() -> recipeNotFound(id));
        return recetteRepository.findHistory(source.getVarianteKey())
                .stream()
                .map(recipe -> new RecetteHistoryResponse(
                        recipe.getId(), version(recipe), recipe.getNom(), recipe.getDateCreation(),
                        recipe.isActive(), recipe.getCoutMatiereEstime()))
                .toList();
    }

    private BigDecimal addIngredients(Recette recette, List<RecetteIngredientRequest> requests) {
        Set<Long> ids = new HashSet<>();
        for (RecetteIngredientRequest request : requests) {
            if (!ids.add(request.getMatierePremiereId())) {
                throw new BusinessValidationException(
                        "Une matière première ne peut apparaître qu'une fois dans une recette");
            }
        }

        Map<Long, MatierePremiere> materials = new HashMap<>();
        matierePremiereRepository.findAllById(ids)
                .forEach(material -> materials.put(material.getId(), material));

        BigDecimal total = BigDecimal.ZERO;
        for (RecetteIngredientRequest request : requests) {
            MatierePremiere material = materials.get(request.getMatierePremiereId());
            if (material == null) {
                throw new ResourceNotFoundException(
                        "Matière première introuvable avec l'id : " + request.getMatierePremiereId());
            }
            if (!material.isActif()) {
                throw new BusinessValidationException(
                        "La matière première " + material.getNom() + " est inactive");
            }
            if (request.getUnite() != material.getUniteReference()) {
                throw new BusinessValidationException(
                        "L'unité de " + material.getNom() + " doit être " + material.getUniteReference());
            }

            RecetteIngredient ingredient = new RecetteIngredient();
            ingredient.setMatierePremiere(material);
            ingredient.setQuantite(request.getQuantite());
            ingredient.setUnite(request.getUnite());
            ingredient.setCoutUnitaireReference(material.getCoutUnitaire());
            recette.addIngredient(ingredient);
            total = total.add(ingredientCost(ingredient));
        }
        return total.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }

    private RecetteDetailResponse save(Recette recette, String conflictMessage) {
        try {
            return toDetailResponse(recetteRepository.saveAndFlush(recette));
        } catch (DataIntegrityViolationException exception) {
            throw new BusinessConflictException(conflictMessage);
        }
    }

    private Recette findDetail(Long id) {
        return recetteRepository.findDetailById(id).orElseThrow(() -> recipeNotFound(id));
    }

    private ResourceNotFoundException recipeNotFound(Long id) {
        return new ResourceNotFoundException("Recette introuvable avec l'id : " + id);
    }

    private RecetteListResponse toListResponse(Recette recette) {
        return new RecetteListResponse(
                recette.getId(), recette.getNom(), recette.getVarianteKey(),
                recette.getFromage().getId(), recette.getFromage().getNom(),
                version(recette), recette.isActive(), recette.getCoutMatiereEstime());
    }

    private String baseRecipeKey(Fromage fromage) {
        boolean baseAlreadyExists = recetteRepository.findVersionsByFromageId(fromage.getId()).stream()
                .map(Recette::getVarianteKey)
                .anyMatch(key -> key != null && key.startsWith(BASE_RECIPE_PREFIX));
        if (baseAlreadyExists) {
            throw new BusinessConflictException(
                    "Une recette de base existe déjà pour le fromage " + fromage.getNom());
        }
        return BASE_RECIPE_PREFIX + fromage.getId();
    }

    private RecetteDetailResponse toDetailResponse(Recette recette) {
        List<RecetteIngredientResponse> ingredients = recette.getIngredients().stream()
                .map(ingredient -> new RecetteIngredientResponse(
                        ingredient.getId(), ingredient.getMatierePremiere().getId(),
                        ingredient.getMatierePremiere().getNom(), ingredient.getQuantite(),
                        ingredient.getUnite(), ingredient.getCoutUnitaireReference(), ingredientCost(ingredient)))
                .toList();
        return new RecetteDetailResponse(
                recette.getId(), recette.getNom(), recette.getVarianteKey(), version(recette), recette.isActive(),
                recette.getDateCreation(), recette.getFromage().getId(), recette.getFromage().getNom(),
                recette.getFrequenceRetournementJours(), recette.getQuantiteLaitReference(),
                recette.getCoutMatiereEstime(), ingredients);
    }

    private BigDecimal ingredientCost(RecetteIngredient ingredient) {
        return ingredient.getQuantite()
                .multiply(ingredient.getCoutUnitaireReference())
                .setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }

    private int version(Recette recette) {
        return recette.getNumeroVersion() == null ? 1 : recette.getNumeroVersion();
    }

    private Integer normalizeFrequency(Integer value) {
        if (value == null || value <= 0) {
            return null;
        }
        return value;
    }

    private BigDecimal normalizeMilkReference(BigDecimal value, BigDecimal fallback) {
        BigDecimal normalized = value == null ? fallback : value;
        if (normalized == null || normalized.signum() <= 0) {
            throw new BusinessValidationException("La quantité de lait de référence doit être strictement positive");
        }
        return normalized.setScale(4, RoundingMode.HALF_UP);
    }
}
