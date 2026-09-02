package com.fromagerie_back.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fromagerie_back.dto.CoutProductionLotResponse;
import com.fromagerie_back.exception.BusinessConflictException;
import com.fromagerie_back.exception.ResourceNotFoundException;
import com.fromagerie_back.model.ConfigurationEmballage;
import com.fromagerie_back.model.CoutProductionLot;
import com.fromagerie_back.model.Fabrication;
import com.fromagerie_back.model.LotAffinage;
import com.fromagerie_back.model.RecetteIngredient;
import com.fromagerie_back.model.RegleAmortissement;
import com.fromagerie_back.model.RegleCoutEnergie;
import com.fromagerie_back.model.RegleMainOeuvre;
import com.fromagerie_back.model.TarifLait;
import com.fromagerie_back.model.TypeOperationEnergie;
import com.fromagerie_back.model.TypeOperationMainOeuvre;
import com.fromagerie_back.model.TypeSaison;
import com.fromagerie_back.model.TypeSoinAffinage;
import com.fromagerie_back.repository.ConfigurationEmballageRepository;
import com.fromagerie_back.repository.CoutProductionLotRepository;
import com.fromagerie_back.repository.RegleAmortissementRepository;
import com.fromagerie_back.repository.RegleCoutEnergieRepository;
import com.fromagerie_back.repository.RegleMainOeuvreRepository;
import com.fromagerie_back.repository.SoinAffinageRepository;
import com.fromagerie_back.repository.TarifLaitRepository;

@Service
public class CoutProductionCalculService {
    private static final BigDecimal MINUTES_PAR_HEURE = BigDecimal.valueOf(60);

    private final CoutProductionLotRepository coutRepository;
    private final TarifLaitRepository tarifLaitRepository;
    private final ConfigurationEmballageRepository configurationEmballageRepository;
    private final RegleCoutEnergieRepository energieRepository;
    private final RegleMainOeuvreRepository mainOeuvreRepository;
    private final RegleAmortissementRepository amortissementRepository;
    private final SoinAffinageRepository soinRepository;
    private final SaisonService saisonService;

    public CoutProductionCalculService(CoutProductionLotRepository coutRepository,
            TarifLaitRepository tarifLaitRepository,
            ConfigurationEmballageRepository configurationEmballageRepository,
            RegleCoutEnergieRepository energieRepository,
            RegleMainOeuvreRepository mainOeuvreRepository,
            RegleAmortissementRepository amortissementRepository,
            SoinAffinageRepository soinRepository,
            SaisonService saisonService) {
        this.coutRepository = coutRepository;
        this.tarifLaitRepository = tarifLaitRepository;
        this.configurationEmballageRepository = configurationEmballageRepository;
        this.energieRepository = energieRepository;
        this.mainOeuvreRepository = mainOeuvreRepository;
        this.amortissementRepository = amortissementRepository;
        this.soinRepository = soinRepository;
        this.saisonService = saisonService;
    }

    @Transactional
    public CoutProductionLot calculerPourSortie(LotAffinage lot, int nombreUnitesFinales, LocalDate dateSortie) {
        Fabrication fabrication = lot.getFabrication();
        CoutProductionLot existing = coutRepository.findByFabricationId(fabrication.getId()).orElse(null);
        if (existing != null) {
            return existing;
        }
        if (nombreUnitesFinales <= 0 || fabrication.getPoidsTotalFromages().signum() <= 0) {
            throw new BusinessConflictException("Les quantités finales du lot doivent être positives");
        }

        LocalDate dateFabrication = fabrication.getDateHeureDebut().toLocalDate();
        BigDecimal coutLait = calculerLait(fabrication, dateFabrication);
        List<RecetteIngredient> matieresHorsLait = fabrication.getRecette().getIngredients().stream()
                .filter(i -> !estDuLait(i))
                .toList();
        if (matieresHorsLait.stream().noneMatch(i -> i.getCoutUnitaireReference() != null
                && i.getCoutUnitaireReference().signum() > 0)) {
            throw new BusinessConflictException("La recette " + fabrication.getRecette().getNom()
                    + " ne contient aucune matière valorisée hors lait");
        }
        BigDecimal quantiteLaitReference = fabrication.getRecette().getQuantiteLaitReference();
        if (quantiteLaitReference.signum() <= 0) {
            throw new BusinessConflictException("La recette " + fabrication.getRecette().getNom()
                    + " ne possède pas de quantité de lait de référence valide");
        }
        BigDecimal facteurRecette = fabrication.getQuantiteLait()
                .divide(quantiteLaitReference, 8, RoundingMode.HALF_UP);
        BigDecimal coutMatieres = matieresHorsLait.stream()
                .map(i -> i.getQuantite().multiply(i.getCoutUnitaireReference()))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .multiply(facteurRecette);
        BigDecimal coutEmballage = calculerEmballage(fabrication, nombreUnitesFinales);
        BigDecimal coutEnergie = calculerEnergie(lot, nombreUnitesFinales, dateFabrication, dateSortie);
        BigDecimal coutMainOeuvre = calculerMainOeuvre(lot, dateFabrication, dateSortie);
        BigDecimal coutAmortissement = calculerAmortissement(dateFabrication);
        BigDecimal total = coutLait.add(coutMatieres).add(coutEmballage).add(coutEnergie)
                .add(coutMainOeuvre).add(coutAmortissement);

        CoutProductionLot cout = new CoutProductionLot();
        cout.setFabrication(fabrication);
        cout.setCoutLait(scale(coutLait));
        cout.setCoutMatieres(scale(coutMatieres));
        cout.setCoutEmballage(scale(coutEmballage));
        cout.setCoutEnergie(scale(coutEnergie));
        cout.setCoutMainOeuvre(scale(coutMainOeuvre));
        cout.setCoutAmortissement(scale(coutAmortissement));
        cout.setCoutTotal(scale(total));
        cout.setCoutParKg(divide(total, fabrication.getPoidsTotalFromages()));
        cout.setCoutParUnite(divide(total, BigDecimal.valueOf(nombreUnitesFinales)));
        cout.setNombreUnitesFinales(nombreUnitesFinales);
        cout.setDateCalcul(LocalDateTime.now());
        return coutRepository.save(cout);
    }

    @Transactional(readOnly = true)
    public List<CoutProductionLotResponse> findAll() {
        return coutRepository.findAllByOrderByDateCalculDesc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CoutProductionLotResponse findByFabricationId(Long fabricationId) {
        return toResponse(coutRepository.findByFabricationId(fabricationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Coût de production introuvable pour la fabrication : " + fabricationId)));
    }

    private BigDecimal calculerLait(Fabrication fabrication, LocalDate date) {
        TypeSaison saison = saisonService.determinerSaison(date);
        TarifLait tarif = uniqueApplicable(tarifLaitRepository.findBySaison(saison), date,
                "tarif lait " + saison, TarifLait::isActif, TarifLait::getDateDebutValidite,
                TarifLait::getDateFinValidite);
        return fabrication.getQuantiteLait().multiply(tarif.getPrixParLitre());
    }

    private boolean estDuLait(RecetteIngredient ingredient) {
        return ingredient.getMatierePremiere() != null
                && ingredient.getMatierePremiere().getNom() != null
                && ingredient.getMatierePremiere().getNom().trim().toLowerCase(Locale.ROOT).contains("lait");
    }

    private BigDecimal calculerEmballage(Fabrication fabrication, int unites) {
        List<ConfigurationEmballage> configurations = configurationEmballageRepository
                .findByFromageIdAndActifTrue(fabrication.getRecette().getFromage().getId()).stream()
                .filter(c -> c.getEmballage().isActif())
                .toList();
        if (configurations.isEmpty()) {
            throw new BusinessConflictException("Aucun emballage actif n'est configuré pour "
                    + fabrication.getRecette().getFromage().getNom());
        }
        BigDecimal nombre = BigDecimal.valueOf(unites);
        return configurations.stream()
                .map(c -> nombre.multiply(c.getQuantiteParUnite()).multiply(c.getEmballage().getCoutUnitaire()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculerEnergie(LotAffinage lot, int unites, LocalDate dateFabrication, LocalDate dateSortie) {
        RegleCoutEnergie chauffe = uniqueApplicable(energieRepository.findAll(), dateFabrication, "énergie de chauffe",
                r -> r.isActif() && r.getTypeOperation() == TypeOperationEnergie.CHAUFFE,
                RegleCoutEnergie::getDateDebutValidite, RegleCoutEnergie::getDateFinValidite);
        RegleCoutEnergie affinage = uniqueApplicable(energieRepository.findAll(), dateSortie, "énergie d'affinage",
                r -> r.isActif() && r.getTypeOperation() == TypeOperationEnergie.AFFINAGE_CAVE,
                RegleCoutEnergie::getDateDebutValidite, RegleCoutEnergie::getDateFinValidite);
        long jours = Math.max(0, ChronoUnit.DAYS.between(lot.getDateMiseEnCave(), dateSortie));
        return appliquerEnergie(chauffe, BigDecimal.valueOf(lot.getFabrication().getDureeChauffageMinutes()), unites, 0)
                .add(appliquerEnergie(affinage, BigDecimal.valueOf(jours * 24L * 60L), unites, jours));
    }

    private BigDecimal appliquerEnergie(RegleCoutEnergie regle, BigDecimal minutes, int unites, long jours) {
        return switch (regle.getUniteCalcul()) {
            case PAR_HEURE -> minutes.divide(MINUTES_PAR_HEURE, 8, RoundingMode.HALF_UP)
                    .multiply(regle.getCoutStandard());
            case PAR_FROMAGE_PAR_JOUR -> BigDecimal.valueOf(unites).multiply(BigDecimal.valueOf(jours))
                    .multiply(regle.getCoutStandard());
            case PAR_FABRICATION -> regle.getCoutStandard();
        };
    }

    private BigDecimal calculerMainOeuvre(LotAffinage lot, LocalDate dateFabrication, LocalDate dateSortie) {
        BigDecimal total = coutMainOeuvre(TypeOperationMainOeuvre.FABRICATION, 1, dateFabrication)
                .add(coutMainOeuvre(TypeOperationMainOeuvre.PREPARATION_VENTE, 1, dateSortie));
        long retournements = soinRepository.findByLotAffinageIdOrderByDateHeureDesc(lot.getId()).stream()
                .filter(s -> s.getType() == TypeSoinAffinage.RETOURNEMENT).count();
        long lavages = soinRepository.findByLotAffinageIdOrderByDateHeureDesc(lot.getId()).stream()
                .filter(s -> s.getType() == TypeSoinAffinage.LAVAGE).count();
        if (retournements > 0) {
            total = total.add(coutMainOeuvre(TypeOperationMainOeuvre.RETOURNEMENT, retournements, dateSortie));
        }
        if (lavages > 0) {
            total = total.add(coutMainOeuvre(TypeOperationMainOeuvre.LAVAGE, lavages, dateSortie));
        }
        return total;
    }

    private BigDecimal coutMainOeuvre(TypeOperationMainOeuvre type, long occurrences, LocalDate date) {
        RegleMainOeuvre regle = uniqueApplicable(mainOeuvreRepository.findByTypeOperation(type), date,
                "main-d'œuvre " + type, RegleMainOeuvre::isActif, RegleMainOeuvre::getDateDebutValidite,
                RegleMainOeuvre::getDateFinValidite);
        return BigDecimal.valueOf(occurrences).multiply(BigDecimal.valueOf(regle.getDureeStandardMinutes()))
                .divide(MINUTES_PAR_HEURE, 8, RoundingMode.HALF_UP).multiply(regle.getCoutHoraire());
    }

    private BigDecimal calculerAmortissement(LocalDate date) {
        List<RegleAmortissement> regles = amortissementRepository.findAll().stream()
                .filter(r -> r.isActif() && r.getEquipement().isActif() && applicable(date,
                        r.getDateDebutValidite(), r.getDateFinValidite()))
                .toList();
        if (regles.isEmpty()) {
            throw new BusinessConflictException("Aucune règle d'amortissement applicable à la fabrication");
        }
        return regles.stream().map(RegleAmortissement::getCoutParFabrication)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private <T> T uniqueApplicable(List<T> candidates, LocalDate date, String label,
            java.util.function.Predicate<T> active,
            java.util.function.Function<T, LocalDate> start,
            java.util.function.Function<T, LocalDate> end) {
        List<T> matches = candidates.stream()
                .filter(active)
                .filter(value -> applicable(date, start.apply(value), end.apply(value)))
                .toList();
        if (matches.isEmpty()) {
            throw new BusinessConflictException("Configuration manquante : " + label + " au " + date);
        }
        if (matches.size() > 1) {
            throw new BusinessConflictException("Plusieurs configurations sont applicables : " + label + " au " + date);
        }
        return matches.get(0);
    }

    private boolean applicable(LocalDate date, LocalDate debut, LocalDate fin) {
        return !date.isBefore(debut) && (fin == null || !date.isAfter(fin));
    }

    private BigDecimal divide(BigDecimal value, BigDecimal divisor) {
        return value.divide(divisor, 4, RoundingMode.HALF_UP);
    }

    private BigDecimal scale(BigDecimal value) {
        return value.setScale(4, RoundingMode.HALF_UP);
    }

    private CoutProductionLotResponse toResponse(CoutProductionLot c) {
        Fabrication f = c.getFabrication();
        return new CoutProductionLotResponse(c.getId(), f.getId(), f.getNumeroLot(), f.getRecette().getFromage().getId(),
                f.getRecette().getFromage().getNom(), f.getRecette().getNom(), f.getDateHeureDebut(),
                f.getPoidsTotalFromages(), c.getNombreUnitesFinales(), c.getCoutLait(), c.getCoutMatieres(), c.getCoutEmballage(),
                c.getCoutEnergie(), c.getCoutMainOeuvre(), c.getCoutAmortissement(), c.getCoutTotal(),
                c.getCoutParKg(), c.getCoutParUnite(), c.getDateCalcul());
    }
}
