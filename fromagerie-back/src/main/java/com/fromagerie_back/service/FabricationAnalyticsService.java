package com.fromagerie_back.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fromagerie_back.config.AnalyticsProperties;
import com.fromagerie_back.dto.analytics.AnomalyAnalyticsResponse;
import com.fromagerie_back.dto.analytics.AnomalyDetailResponse;
import com.fromagerie_back.dto.analytics.FabricationAnomalyResponse;
import com.fromagerie_back.dto.analytics.ParametreAnomalie;
import com.fromagerie_back.dto.analytics.SeasonYieldStatisticsResponse;
import com.fromagerie_back.dto.analytics.SeasonalYieldComparisonResponse;
import com.fromagerie_back.dto.analytics.StatutAnalyseAnomalie;
import com.fromagerie_back.dto.analytics.TemperatureHistoryPointResponse;
import com.fromagerie_back.dto.analytics.YieldAnalyticsResponse;
import com.fromagerie_back.dto.analytics.YieldHistoryPointResponse;
import com.fromagerie_back.exception.FromageNotFoundException;
import com.fromagerie_back.exception.InvalidAnalyticsFilterException;
import com.fromagerie_back.exception.ResourceNotFoundException;
import com.fromagerie_back.model.Fromage;
import com.fromagerie_back.model.TypeSaison;
import com.fromagerie_back.repository.FabricationAnalyticsProjection;
import com.fromagerie_back.repository.FabricationRepository;
import com.fromagerie_back.repository.FromageRepository;
import com.fromagerie_back.repository.RecetteRepository;

@Service
@Transactional(readOnly = true)
public class FabricationAnalyticsService {

    private static final LocalDateTime EARLIEST_ANALYTICS_DATE = LocalDateTime.of(1900, 1, 1, 0, 0);
    private static final LocalDateTime LATEST_ANALYTICS_DATE = LocalDateTime.of(3000, 1, 1, 0, 0);

    private final FabricationRepository fabricationRepository;
    private final FromageRepository fromageRepository;
    private final RecetteRepository recetteRepository;
    private final SaisonService saisonService;
    private final IqrAnomalyDetector anomalyDetector;
    private final int minimumSamples;

    public FabricationAnalyticsService(
            FabricationRepository fabricationRepository,
            FromageRepository fromageRepository,
            RecetteRepository recetteRepository,
            SaisonService saisonService,
            IqrAnomalyDetector anomalyDetector,
            AnalyticsProperties properties) {
        this.fabricationRepository = fabricationRepository;
        this.fromageRepository = fromageRepository;
        this.recetteRepository = recetteRepository;
        this.saisonService = saisonService;
        this.anomalyDetector = anomalyDetector;
        this.minimumSamples = properties.getAnomalies().getMinimumSamples();
    }

    public List<TemperatureHistoryPointResponse> temperatures(
            Long fromageId, Long recetteId, LocalDate dateDebut, LocalDate dateFin) {
        return rows(fromageId, recetteId, dateDebut, dateFin).stream()
                .filter(row -> row.getTemperatureChauffage() != null)
                .map(row -> new TemperatureHistoryPointResponse(
                        row.getFabricationId(), row.getNumeroLot(), row.getDateHeureDebut(),
                        row.getFromageId(), row.getFromageNom(), row.getRecetteId(), row.getRecetteNom(),
                        row.getTemperatureChauffage()))
                .toList();
    }

    public YieldAnalyticsResponse rendements(
            Long fromageId, Long recetteId, LocalDate dateDebut, LocalDate dateFin) {
        List<YieldHistoryPointResponse> history = rows(fromageId, recetteId, dateDebut, dateFin).stream()
                .filter(row -> row.getRendement() != null)
                .map(row -> new YieldHistoryPointResponse(
                        row.getFabricationId(), row.getNumeroLot(), row.getDateHeureDebut(),
                        row.getFromageId(), row.getFromageNom(), row.getRecetteId(), row.getRecetteNom(),
                        row.getRendement()))
                .toList();
        Statistics statistics = statistics(history.stream().map(YieldHistoryPointResponse::rendement).toList());
        return new YieldAnalyticsResponse(
                statistics.count(), statistics.average(), statistics.minimum(), statistics.maximum(), history);
    }

    public SeasonalYieldComparisonResponse rendementsParSaison(
            Long fromageId, Long recetteId, LocalDate dateDebut, LocalDate dateFin) {
        if (fromageId == null) {
            throw new InvalidAnalyticsFilterException("Le filtre fromageId est obligatoire pour la comparaison saisonnière");
        }
        validateFilters(fromageId, recetteId, dateDebut, dateFin);
        Fromage fromage = fromageRepository.findById(fromageId)
                .orElseThrow(() -> new FromageNotFoundException(fromageId));
        List<FabricationAnalyticsProjection> rows = query(fromageId, recetteId, dateDebut, dateFin);
        List<BigDecimal> dry = yieldsForSeason(rows, TypeSaison.SECHE);
        List<BigDecimal> wet = yieldsForSeason(rows, TypeSaison.HUMIDE);
        return new SeasonalYieldComparisonResponse(
                fromageId,
                fromage.getNom(),
                seasonStatistics(dry),
                seasonStatistics(wet));
    }

    public AnomalyAnalyticsResponse anomalies(
            Long fromageId,
            Long recetteId,
            LocalDate dateDebut,
            LocalDate dateFin,
            ParametreAnomalie parametre) {
        List<FabricationAnalyticsProjection> candidates = rows(fromageId, recetteId, dateDebut, dateFin);
        List<FabricationAnalyticsProjection> universe = query(null, null, null, null);
        List<FabricationAnomalyResponse> anomalies = new ArrayList<>();
        List<FabricationAnomalyResponse> insufficient = new ArrayList<>();
        for (FabricationAnalyticsProjection candidate : candidates) {
            FabricationAnomalyResponse result = analyze(candidate, universe, parametre);
            if (result.statut() == StatutAnalyseAnomalie.ANOMALIE) {
                anomalies.add(result);
            } else if (result.statut() == StatutAnalyseAnomalie.DONNEES_INSUFFISANTES) {
                insufficient.add(result);
            }
        }
        return new AnomalyAnalyticsResponse(minimumSamples, anomalies, insufficient);
    }

    public FabricationAnomalyResponse anomaliesForFabrication(Long fabricationId, ParametreAnomalie parametre) {
        if (!fabricationRepository.existsById(fabricationId)) {
            throw new ResourceNotFoundException("Fabrication introuvable avec l'id : " + fabricationId);
        }
        List<FabricationAnalyticsProjection> universe = query(null, null, null, null);
        FabricationAnalyticsProjection candidate = universe.stream()
                .filter(row -> row.getFabricationId().equals(fabricationId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Fabrication non analysable avec l'id : " + fabricationId));
        return analyze(candidate, universe, parametre);
    }

    private FabricationAnomalyResponse analyze(
            FabricationAnalyticsProjection candidate,
            List<FabricationAnalyticsProjection> universe,
            ParametreAnomalie requestedParameter) {
        Baseline baseline = selectBaseline(candidate, universe);
        if (baseline.rows().size() < minimumSamples) {
            return anomalyResponse(
                    candidate, StatutAnalyseAnomalie.DONNEES_INSUFFISANTES,
                    baseline.name(), baseline.rows().size(), List.of());
        }

        EnumSet<ParametreAnomalie> parameters = requestedParameter == null
                ? EnumSet.allOf(ParametreAnomalie.class)
                : EnumSet.of(requestedParameter);
        List<AnomalyDetailResponse> details = new ArrayList<>();
        boolean insufficientParameterData = false;
        for (ParametreAnomalie parameter : parameters) {
            BigDecimal value = value(candidate, parameter);
            List<BigDecimal> samples = baseline.rows().stream()
                    .map(row -> value(row, parameter))
                    .filter(sample -> sample != null)
                    .toList();
            if (value == null || samples.size() < minimumSamples) {
                insufficientParameterData = true;
                continue;
            }
            anomalyDetector.detect(value, samples).ifPresent(detection -> details.add(
                    new AnomalyDetailResponse(
                            parameter,
                            value,
                            detection.borneBasse().setScale(2, RoundingMode.HALF_UP),
                            detection.borneHaute().setScale(2, RoundingMode.HALF_UP),
                            detection.direction(),
                            anomalyMessage(parameter, detection.direction()))));
        }
        StatutAnalyseAnomalie status;
        if (!details.isEmpty()) {
            status = StatutAnalyseAnomalie.ANOMALIE;
        } else if (insufficientParameterData) {
            status = StatutAnalyseAnomalie.DONNEES_INSUFFISANTES;
        } else {
            status = StatutAnalyseAnomalie.NORMALE;
        }
        return anomalyResponse(candidate, status, baseline.name(), baseline.rows().size(), details);
    }

    private Baseline selectBaseline(
            FabricationAnalyticsProjection candidate,
            List<FabricationAnalyticsProjection> universe) {
        List<FabricationAnalyticsProjection> sameCheese = universe.stream()
                .filter(row -> !row.getFabricationId().equals(candidate.getFabricationId()))
                .filter(row -> row.getFromageId().equals(candidate.getFromageId()))
                .toList();
        TypeSaison season = saisonService.determinerSaison(candidate.getDateHeureDebut().toLocalDate());
        List<FabricationAnalyticsProjection> sameRecipeSeason = sameCheese.stream()
                .filter(row -> row.getRecetteId().equals(candidate.getRecetteId()))
                .filter(row -> saisonService.determinerSaison(row.getDateHeureDebut().toLocalDate()) == season)
                .toList();
        if (sameRecipeSeason.size() >= minimumSamples) {
            return new Baseline("MEME_RECETTE_ET_SAISON", sameRecipeSeason);
        }
        List<FabricationAnalyticsProjection> sameRecipe = sameCheese.stream()
                .filter(row -> row.getRecetteId().equals(candidate.getRecetteId()))
                .toList();
        if (sameRecipe.size() >= minimumSamples) {
            return new Baseline("MEME_RECETTE", sameRecipe);
        }
        List<FabricationAnalyticsProjection> sameCheeseSeason = sameCheese.stream()
                .filter(row -> saisonService.determinerSaison(row.getDateHeureDebut().toLocalDate()) == season)
                .toList();
        if (sameCheeseSeason.size() >= minimumSamples) {
            return new Baseline("MEME_FROMAGE_ET_SAISON", sameCheeseSeason);
        }
        return new Baseline("MEME_FROMAGE", sameCheese);
    }

    private FabricationAnomalyResponse anomalyResponse(
            FabricationAnalyticsProjection row,
            StatutAnalyseAnomalie status,
            String baseline,
            int sampleCount,
            List<AnomalyDetailResponse> details) {
        return new FabricationAnomalyResponse(
                row.getFabricationId(), row.getNumeroLot(), row.getDateHeureDebut(),
                row.getFromageId(), row.getFromageNom(), row.getRecetteId(), row.getRecetteNom(),
                status, baseline, sampleCount, details);
    }

    private String anomalyMessage(
            ParametreAnomalie parameter,
            com.fromagerie_back.dto.analytics.DirectionAnomalie direction) {
        String label = parameter == ParametreAnomalie.RENDEMENT
                ? "Rendement"
                : "Température de chauffage";
        return label + " inhabituellement " + (direction == com.fromagerie_back.dto.analytics.DirectionAnomalie.BASSE
                ? "bas par rapport aux fabrications comparables"
                : "élevé par rapport aux fabrications comparables");
    }

    private BigDecimal value(FabricationAnalyticsProjection row, ParametreAnomalie parameter) {
        return parameter == ParametreAnomalie.RENDEMENT
                ? row.getRendement()
                : row.getTemperatureChauffage();
    }

    private List<BigDecimal> yieldsForSeason(
            List<FabricationAnalyticsProjection> rows, TypeSaison season) {
        return rows.stream()
                .filter(row -> row.getRendement() != null)
                .filter(row -> saisonService.determinerSaison(row.getDateHeureDebut().toLocalDate()) == season)
                .map(FabricationAnalyticsProjection::getRendement)
                .toList();
    }

    private SeasonYieldStatisticsResponse seasonStatistics(List<BigDecimal> values) {
        Statistics statistics = statistics(values);
        return new SeasonYieldStatisticsResponse(
                statistics.count(), statistics.average(), statistics.minimum(), statistics.maximum(),
                statistics.count() > 0);
    }

    private Statistics statistics(List<BigDecimal> values) {
        if (values.isEmpty()) {
            return new Statistics(0, null, null, null);
        }
        BigDecimal sum = values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal minimum = values.stream().min(BigDecimal::compareTo).orElseThrow();
        BigDecimal maximum = values.stream().max(BigDecimal::compareTo).orElseThrow();
        BigDecimal average = sum.divide(BigDecimal.valueOf(values.size()), 2, RoundingMode.HALF_UP);
        return new Statistics(values.size(), average, minimum, maximum);
    }

    private List<FabricationAnalyticsProjection> rows(
            Long fromageId, Long recetteId, LocalDate dateDebut, LocalDate dateFin) {
        validateFilters(fromageId, recetteId, dateDebut, dateFin);
        return query(fromageId, recetteId, dateDebut, dateFin);
    }

    private List<FabricationAnalyticsProjection> query(
            Long fromageId, Long recetteId, LocalDate dateDebut, LocalDate dateFin) {
        LocalDateTime start = dateDebut == null ? EARLIEST_ANALYTICS_DATE : dateDebut.atStartOfDay();
        LocalDateTime endExclusive = dateFin == null
                ? LATEST_ANALYTICS_DATE
                : dateFin.plusDays(1).atStartOfDay();
        return fabricationRepository.findAnalyticsRows(fromageId, recetteId, start, endExclusive);
    }

    private void validateFilters(
            Long fromageId, Long recetteId, LocalDate dateDebut, LocalDate dateFin) {
        if (dateDebut != null && dateFin != null && dateDebut.isAfter(dateFin)) {
            throw new InvalidAnalyticsFilterException("dateDebut doit être antérieure ou égale à dateFin");
        }
        if (fromageId != null && !fromageRepository.existsById(fromageId)) {
            throw new FromageNotFoundException(fromageId);
        }
        if (recetteId != null && !recetteRepository.existsById(recetteId)) {
            throw new ResourceNotFoundException("Recette introuvable avec l'id : " + recetteId);
        }
    }

    private record Statistics(long count, BigDecimal average, BigDecimal minimum, BigDecimal maximum) {
    }

    private record Baseline(String name, List<FabricationAnalyticsProjection> rows) {
    }
}
