package com.fromagerie_back.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.text.Normalizer;
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
import com.fromagerie_back.model.OrigineLait;
import com.fromagerie_back.model.Recette;
import com.fromagerie_back.model.RecetteIngredient;
import com.fromagerie_back.model.Utilisateur;
import com.fromagerie_back.repository.FabricationRepository;
import com.fromagerie_back.repository.CoutProductionLotRepository;
import com.fromagerie_back.repository.LotAffinageRepository;
import com.fromagerie_back.repository.MatierePremiereRepository;
import com.fromagerie_back.repository.FromageRepository;
import com.fromagerie_back.repository.RecetteRepository;
import com.fromagerie_back.repository.UtilisateurRepository;
import com.fromagerie_back.security.CustomUserDetails;

@Service
public class FabricationService {

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);
    private static final int RENDEMENT_SCALE = 2;
    private static final BigDecimal PRESURE_MIN_RATIO = new BigDecimal("0.60");
    private static final BigDecimal PRESURE_MAX_RATIO = new BigDecimal("1.40");
    private static final BigDecimal PRESURE_INDICATIVE_MIN_RATIO = new BigDecimal("0.20");
    private static final BigDecimal PRESURE_INDICATIVE_MAX_RATIO = new BigDecimal("2.00");
    private static final BigDecimal FERMENT_MIN_RATIO = new BigDecimal("0.60");
    private static final BigDecimal FERMENT_MAX_RATIO = new BigDecimal("1.40");
    private static final BigDecimal FERMENT_INDICATIVE_MIN_RATIO = new BigDecimal("0.20");
    private static final BigDecimal FERMENT_INDICATIVE_MAX_RATIO = new BigDecimal("2.00");
    private static final BigDecimal FERMENT_ABSOLUTE_MIN_RATIO = new BigDecimal("0.10");
    private static final BigDecimal FERMENT_ABSOLUTE_MAX_RATIO = new BigDecimal("3.00");

    private final FabricationRepository fabricationRepository;
    private final RecetteRepository recetteRepository;
    private final FromageRepository fromageRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final NumeroLotService numeroLotService;
    private final UtilisationLotLaitService utilisationLotLaitService;
    private final LotAffinageRepository lotAffinageRepository;
    private final CoutProductionLotRepository coutProductionLotRepository;
    private final MatierePremiereRepository matierePremiereRepository;

    public FabricationService(
            FabricationRepository fabricationRepository,
            RecetteRepository recetteRepository,
            FromageRepository fromageRepository,
            UtilisateurRepository utilisateurRepository,
            NumeroLotService numeroLotService,
            UtilisationLotLaitService utilisationLotLaitService,
            LotAffinageRepository lotAffinageRepository,
            CoutProductionLotRepository coutProductionLotRepository,
            MatierePremiereRepository matierePremiereRepository) {
        this.fabricationRepository = fabricationRepository;
        this.recetteRepository = recetteRepository;
        this.fromageRepository = fromageRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.numeroLotService = numeroLotService;
        this.utilisationLotLaitService = utilisationLotLaitService;
        this.lotAffinageRepository = lotAffinageRepository;
        this.coutProductionLotRepository = coutProductionLotRepository;
        this.matierePremiereRepository = matierePremiereRepository;
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
        BigDecimal quantiteLaitCalculee = utilisationLotLaitService
                .validateAndCalculateTotal(request.getLotsLait(), null);
        OrigineLait origineLaitCalculee = utilisationLotLaitService.determineOrigine(request.getLotsLait());
        LocalDate date = request.getDateHeureDebut().toLocalDate();
        String numeroLot = numeroLotService.genererNumeroLot(date);

        Fabrication fabrication = new Fabrication();
        fabrication.setNumeroLot(numeroLot);
        fabrication.setOperateur(operateur);
        applyRequest(fabrication, recette, request, quantiteLaitCalculee, origineLaitCalculee);

        try {
            Fabrication saved = fabricationRepository.saveAndFlush(fabrication);
            utilisationLotLaitService.attachForCreation(saved, request.getLotsLait());
            return toDetailResponse(saved);
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
        ensureNotInAffinage(id);
        Fabrication fabrication = findWithDetails(id);
        Recette recette = findRecette(request.getRecetteId());

        applyRequest(fabrication, recette, request, request.getQuantiteLait(), request.getOrigineLait());
        return toDetailResponse(fabricationRepository.saveAndFlush(fabrication));
    }

    @Transactional
    public void delete(Long id) {
        if (!fabricationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Fabrication introuvable avec l'id : " + id);
        }
        ensureNotInAffinage(id);
        utilisationLotLaitService.deleteByFabricationId(id);
        coutProductionLotRepository.deleteByFabricationId(id);
        fabricationRepository.deleteById(id);
    }

    private void ensureNotInAffinage(Long id) {
        if (lotAffinageRepository.existsByFabricationId(id)) {
            throw new BusinessConflictException(
                    "Cette fabrication ne peut plus être modifiée ou supprimée car elle est passée en affinage.");
        }
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
            FabricationRequest request,
            BigDecimal quantiteLait,
            OrigineLait origineLait) {
        validateCheeseYield(request.getPoidsTotalFromages(), quantiteLait, request.isRendementAnormalConfirme());
        validateCheeseCount(quantiteLait, request.getNombreFromages(), request.isNombreFromagesFaibleConfirme());
        validatePresure(recette, quantiteLait, request.getTypePresure(), request.getQuantitePresure(),
                request.isPresureHorsPlageConfirmee());
        validateFerment(recette, quantiteLait, request.getTypeFerments(), request.getQuantiteFerments(),
                request.isFermentHorsPlageConfirmee());
        fabrication.setDateHeureDebut(request.getDateHeureDebut());
        fabrication.setRecette(recette);
        fabrication.setQuantiteLait(quantiteLait);
        fabrication.setTemperatureLait(request.getTemperatureLait());
        fabrication.setOrigineLait(origineLait);
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
                quantiteLait));
    }

    private void validateCheeseYield(
            BigDecimal poidsTotalFromages,
            BigDecimal quantiteLait,
            boolean rendementAnormalConfirme) {
        if (poidsTotalFromages == null || quantiteLait == null || quantiteLait.signum() <= 0) return;
        BigDecimal rendement = poidsTotalFromages
                .multiply(ONE_HUNDRED)
                .divide(quantiteLait, 8, RoundingMode.HALF_UP);
        if (rendement.compareTo(BigDecimal.ONE) < 0 || rendement.compareTo(new BigDecimal("70")) > 0) {
            throw new BusinessValidationException(
                    "Le poids total des fromages saisi est manifestement incohérent avec la quantité de lait utilisée.");
        }
        boolean rendementFaible = rendement.compareTo(new BigDecimal("5")) < 0;
        boolean rendementEleve = rendement.compareTo(new BigDecimal("30")) > 0;
        if ((rendementFaible || rendementEleve) && !rendementAnormalConfirme) {
            throw new BusinessValidationException(rendementFaible
                    ? "Le rendement paraît anormalement faible. Vérifiez le poids total saisi. Si cette valeur "
                            + "correspond réellement à la fabrication, vous pouvez la confirmer."
                    : "Le rendement paraît anormalement élevé. Vérifiez le poids total saisi. Si cette valeur "
                            + "correspond réellement à la fabrication, vous pouvez la confirmer.");
        }
    }

    private void validateCheeseCount(
            BigDecimal quantiteLait,
            Integer nombreFromages,
            boolean faibleConfirme) {
        if (nombreFromages == null || nombreFromages < 1) return;
        int maximum = quantiteLait.multiply(BigDecimal.TEN).setScale(0, RoundingMode.FLOOR).intValueExact();
        if (nombreFromages > maximum) {
            throw new BusinessValidationException(
                    "Le nombre de fromages produits ne peut pas dépasser " + maximum
                            + " pour cette quantité de lait.");
        }
        int seuilAvertissement = quantiteLait
                .divide(new BigDecimal("20"), 0, RoundingMode.FLOOR)
                .intValue();
        seuilAvertissement = Math.max(1, seuilAvertissement);
        if (nombreFromages < seuilAvertissement && !faibleConfirme) {
            throw new BusinessValidationException(
                    "Le nombre de fromages produits paraît très faible pour " + decimal(quantiteLait)
                            + " L de lait utilisés. Vérifiez la saisie. Si cette quantité correspond réellement "
                            + "à la fabrication, vous pouvez la confirmer.");
        }
    }

    private void validatePresure(
            Recette recette,
            BigDecimal quantiteLait,
            String typePresure,
            BigDecimal quantitePresure,
            boolean horsPlageConfirmee) {
        List<RecetteIngredient> ingredients = recette.getIngredients().stream()
                .filter(ingredient -> isPresure(ingredient.getMatierePremiere().getNom()))
                .toList();
        if (ingredients.isEmpty()) return;
        if (ingredients.size() > 1) {
            throw new BusinessValidationException(
                    "La recette contient plusieurs ingrédients de présure et ne peut pas être utilisée.");
        }

        RecetteIngredient reference = ingredients.getFirst();
        String expectedType = reference.getMatierePremiere().getNom();
        if (quantitePresure == null || quantitePresure.signum() <= 0) {
            throw new BusinessValidationException("La quantité de présure utilisée doit être supérieure à 0.");
        }

        BigDecimal milkReference = recette.getQuantiteLaitReference();
        if (milkReference == null || milkReference.signum() <= 0) {
            throw new BusinessValidationException(
                    "La quantité de lait de référence de la recette est invalide.");
        }
        BigDecimal recommendationNumerator = reference.getQuantite().multiply(quantiteLait);
        BigDecimal declaredOnReferenceScale = quantitePresure.multiply(milkReference);
        boolean samePresure = typePresure != null
                && normalizeIngredientName(typePresure).equals(normalizeIngredientName(expectedType));
        if (!samePresure) {
            boolean existingPresure = matierePremiereRepository.findAll().stream()
                    .anyMatch(material -> material.isActif()
                            && isPresure(material.getNom())
                            && normalizeIngredientName(material.getNom()).equals(normalizeIngredientName(typePresure)));
            if (!existingPresure) {
                throw new BusinessValidationException("La présure sélectionnée n'existe pas ou est inactive.");
            }
            if (quantitePresure.compareTo(quantiteLait) > 0) {
                throw new BusinessValidationException(
                        "La quantité de présure saisie est manifestement incohérente avec la quantité de lait utilisée. "
                                + "Maximum autorisé pour cette fabrication : " + decimal(quantiteLait) + " mL.");
            }
            BigDecimal indicativeMinimum = recommendationNumerator.multiply(PRESURE_INDICATIVE_MIN_RATIO);
            BigDecimal indicativeMaximum = recommendationNumerator.multiply(PRESURE_INDICATIVE_MAX_RATIO);
            boolean farOutsideReference = declaredOnReferenceScale.compareTo(indicativeMinimum) < 0
                    || declaredOnReferenceScale.compareTo(indicativeMaximum) > 0;
            if (farOutsideReference && !horsPlageConfirmee) {
                throw new BusinessValidationException(
                        "La quantité de présure différente, très éloignée de la référence, doit être confirmée.");
            }
            return;
        }
        BigDecimal minimum = recommendationNumerator.multiply(PRESURE_MIN_RATIO);
        BigDecimal maximum = recommendationNumerator.multiply(PRESURE_MAX_RATIO);
        if (declaredOnReferenceScale.compareTo(minimum) < 0
                || declaredOnReferenceScale.compareTo(maximum) > 0) {
            BigDecimal recommendation = recommendationNumerator.divide(milkReference, 8, RoundingMode.HALF_UP);
            BigDecimal displayedMinimum = minimum.divide(milkReference, 8, RoundingMode.HALF_UP);
            BigDecimal displayedMaximum = maximum.divide(milkReference, 8, RoundingMode.HALF_UP);
            throw new BusinessValidationException(
                    "La recette recommande " + decimal(recommendation) + " " + reference.getUnite()
                            + " de présure. Pour cette fabrication, la quantité autorisée est comprise entre "
                            + decimal(displayedMinimum) + " et " + decimal(displayedMaximum) + " "
                            + reference.getUnite() + " (±40 %).");
        }
    }

    private boolean isPresure(String name) {
        return normalizeIngredientName(name).contains("presure");
    }

    private void validateFerment(
            Recette recette,
            BigDecimal quantiteLait,
            String typeFerment,
            BigDecimal quantiteFerment,
            boolean horsPlageConfirmee) {
        List<RecetteIngredient> ingredients = recette.getIngredients().stream()
                .filter(ingredient -> isFerment(ingredient.getMatierePremiere().getNom()))
                .toList();
        if (ingredients.isEmpty()) return;
        if (ingredients.size() > 1) {
            throw new BusinessValidationException(
                    "La recette contient plusieurs ingrédients de ferment et ne peut pas être utilisée.");
        }
        if (quantiteFerment == null || quantiteFerment.signum() <= 0) {
            throw new BusinessValidationException("La quantité de ferment utilisée doit être supérieure à 0.");
        }

        RecetteIngredient reference = ingredients.getFirst();
        BigDecimal milkReference = recette.getQuantiteLaitReference();
        if (milkReference == null || milkReference.signum() <= 0) {
            throw new BusinessValidationException(
                    "La quantité de lait de référence de la recette est invalide.");
        }
        BigDecimal recommendationNumerator = reference.getQuantite().multiply(quantiteLait);
        BigDecimal declaredOnReferenceScale = quantiteFerment.multiply(milkReference);
        boolean sameFerment = typeFerment != null
                && normalizeIngredientName(typeFerment).equals(
                        normalizeIngredientName(reference.getMatierePremiere().getNom()));
        if (sameFerment) {
            BigDecimal minimum = recommendationNumerator.multiply(FERMENT_MIN_RATIO);
            BigDecimal maximum = recommendationNumerator.multiply(FERMENT_MAX_RATIO);
            if (declaredOnReferenceScale.compareTo(minimum) < 0
                    || declaredOnReferenceScale.compareTo(maximum) > 0) {
                BigDecimal recommendation = recommendationNumerator.divide(milkReference, 8, RoundingMode.HALF_UP);
                BigDecimal displayedMinimum = minimum.divide(milkReference, 8, RoundingMode.HALF_UP);
                BigDecimal displayedMaximum = maximum.divide(milkReference, 8, RoundingMode.HALF_UP);
                throw new BusinessValidationException(
                        "La recette recommande " + decimal(recommendation) + " " + reference.getUnite()
                                + " de ferment. Pour cette fabrication, la quantité autorisée est comprise entre "
                                + decimal(displayedMinimum) + " et " + decimal(displayedMaximum) + " "
                                + reference.getUnite() + " (±40 %).");
            }
            return;
        }

        var selectedMaterial = matierePremiereRepository.findAll().stream()
                .filter(material -> material.isActif()
                        && isFerment(material.getNom())
                        && normalizeIngredientName(material.getNom()).equals(normalizeIngredientName(typeFerment)))
                .findFirst()
                .orElseThrow(() -> new BusinessValidationException(
                        "Le ferment sélectionné n'existe pas ou est inactif."));
        if (selectedMaterial.getUniteReference() != reference.getUnite()) return;

        BigDecimal absoluteMinimum = recommendationNumerator.multiply(FERMENT_ABSOLUTE_MIN_RATIO);
        BigDecimal absoluteMaximum = recommendationNumerator.multiply(FERMENT_ABSOLUTE_MAX_RATIO);
        if (declaredOnReferenceScale.compareTo(absoluteMinimum) < 0
                || declaredOnReferenceScale.compareTo(absoluteMaximum) > 0) {
            BigDecimal displayedMinimum = absoluteMinimum.divide(milkReference, 8, RoundingMode.HALF_UP);
            BigDecimal displayedMaximum = absoluteMaximum.divide(milkReference, 8, RoundingMode.HALF_UP);
            throw new BusinessValidationException(
                    "La quantité de ferment doit être comprise entre " + decimal(displayedMinimum) + " et "
                            + decimal(displayedMaximum) + " " + reference.getUnite()
                            + " pour un ferment différent comparable.");
        }
        BigDecimal indicativeMinimum = recommendationNumerator.multiply(FERMENT_INDICATIVE_MIN_RATIO);
        BigDecimal indicativeMaximum = recommendationNumerator.multiply(FERMENT_INDICATIVE_MAX_RATIO);
        boolean exceptional = declaredOnReferenceScale.compareTo(indicativeMinimum) < 0
                || declaredOnReferenceScale.compareTo(indicativeMaximum) > 0;
        if (exceptional && !horsPlageConfirmee) {
            throw new BusinessValidationException(
                    "La quantité de ferment différente, très éloignée de la référence, doit être confirmée.");
        }
    }

    private boolean isFerment(String name) {
        return normalizeIngredientName(name).contains("ferment");
    }

    private String normalizeIngredientName(String value) {
        if (value == null) return "";
        return Normalizer.normalize(value.trim().toLowerCase(java.util.Locale.ROOT), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "");
    }

    private String decimal(BigDecimal value) {
        return value.stripTrailingZeros().toPlainString();
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
