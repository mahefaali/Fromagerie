package com.fromagerie_back.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fromagerie_back.dto.LotLaitDtos.*;
import com.fromagerie_back.exception.*;
import com.fromagerie_back.model.*;
import com.fromagerie_back.repository.*;

@Service
public class UtilisationLotLaitService {
    private final FabricationRepository fabrications;
    private final LotLaitRepository lots;
    private final UtilisationLotLaitRepository usages;
    private final AnalyseLaitRepository analyses;

    public UtilisationLotLaitService(FabricationRepository fabrications, LotLaitRepository lots,
            UtilisationLotLaitRepository usages, AnalyseLaitRepository analyses) {
        this.fabrications = fabrications;
        this.lots = lots;
        this.usages = usages;
        this.analyses = analyses;
    }

    @Transactional(readOnly = true)
    public List<UtilisationResponse> find(Long fabricationId) {
        requireFabrication(fabricationId);
        return usages.findByFabricationIdOrderByLotLaitDateTraiteAsc(fabricationId).stream().map(this::response).toList();
    }

    @Transactional
    public List<UtilisationResponse> replace(Long fabricationId, List<UtilisationRequest> requests) {
        Fabrication fabrication = requireFabrication(fabricationId);
        BigDecimal total = validateAndCalculateTotal(requests, fabricationId);
        usages.deleteByFabricationId(fabricationId);
        usages.flush();
        saveUsages(fabrication, requests);
        fabrication.setQuantiteLait(total);
        fabrication.setRendement(fabrication.getPoidsTotalFromages()
                .multiply(BigDecimal.valueOf(100))
                .divide(total, 2, RoundingMode.HALF_UP));
        return find(fabricationId);
    }

    @Transactional
    public BigDecimal validateAndCalculateTotal(List<UtilisationRequest> requests, Long excludedFabricationId) {
        if (requests == null || requests.isEmpty()) {
            throw new BusinessValidationException("Aucun lot de lait n'a été sélectionné.");
        }
        Map<Long, UtilisationRequest> requestsByLot = new TreeMap<>();
        for (UtilisationRequest request : requests) {
            validateRequiredValues(request);
            if (requestsByLot.putIfAbsent(request.lotLaitId(), request) != null) {
                throw new BusinessValidationException(
                        "Le lot de lait " + request.lotLaitId() + " est déjà sélectionné pour cette fabrication.");
            }
        }

        BigDecimal total = BigDecimal.ZERO;
        for (UtilisationRequest request : requestsByLot.values()) {
            LotLait lot = lots.findByIdForUpdate(request.lotLaitId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Le lot de lait " + request.lotLaitId() + " n'existe pas."));
            BigDecimal available = lot.getQuantite().subtract(usages.usedOutside(lot.getId(), excludedFabricationId));
            if (request.quantiteUtilisee().compareTo(available) > 0) {
                throw new BusinessValidationException("Quantité insuffisante dans le lot " + lot.getNumeroLot()
                        + " : " + decimal(available) + " L disponibles, "
                        + decimal(request.quantiteUtilisee()) + " L demandés.");
            }
            total = total.add(request.quantiteUtilisee());
        }
        return total;
    }

    @Transactional(readOnly = true)
    public OrigineLait determineOrigine(List<UtilisationRequest> requests) {
        boolean matin = false;
        boolean soir = false;
        for (UtilisationRequest request : requests) {
            LotLait lot = lots.findById(request.lotLaitId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Le lot de lait " + request.lotLaitId() + " n'existe pas."));
            matin |= lot.getTypeTraite() == TypeTraite.MATIN;
            soir |= lot.getTypeTraite() == TypeTraite.SOIR;
        }
        if (matin && soir) return OrigineLait.MELANGE;
        return matin ? OrigineLait.TRAITE_MATIN : OrigineLait.TRAITE_SOIR;
    }

    private void validateRequiredValues(UtilisationRequest request) {
        if (request == null || request.lotLaitId() == null) {
            throw new BusinessValidationException("Le lot de lait doit être renseigné.");
        }
        if (request.quantiteUtilisee() == null) {
            throw new BusinessValidationException("La quantité utilisée doit être renseignée.");
        }
        if (request.quantiteUtilisee().signum() <= 0) {
            throw new BusinessValidationException("La quantité utilisée doit être supérieure à 0.");
        }
        if (request.quantiteUtilisee().stripTrailingZeros().scale() > 4) {
            throw new BusinessValidationException(
                    "La quantité utilisée dépasse la précision de 4 décimales supportée.");
        }
    }

    private String decimal(BigDecimal value) { return value.stripTrailingZeros().toPlainString(); }

    @Transactional
    public void attachForCreation(Fabrication fabrication, List<UtilisationRequest> requests) {
        validateAndCalculateTotal(requests, null);
        saveUsages(fabrication, requests);
    }

    @Transactional
    public void deleteByFabricationId(Long fabricationId) { usages.deleteByFabricationId(fabricationId); }

    private void saveUsages(Fabrication fabrication, List<UtilisationRequest> requests) {
        for (UtilisationRequest request : requests) {
            UtilisationLotLait usage = new UtilisationLotLait();
            usage.setFabrication(fabrication);
            usage.setLotLait(lots.getReferenceById(request.lotLaitId()));
            usage.setQuantiteUtilisee(request.quantiteUtilisee());
            usages.save(usage);
        }
    }

    private Fabrication requireFabrication(Long id) {
        return fabrications.findById(id).orElseThrow(() -> new ResourceNotFoundException("Fabrication introuvable"));
    }

    private UtilisationResponse response(UtilisationLotLait usage) {
        LotLait lot = usage.getLotLait();
        BigDecimal available = lot.getQuantite().subtract(usages.usedOutside(lot.getId(), usage.getFabrication().getId()));
        return new UtilisationResponse(lot.getId(), lot.getNumeroLot(), lot.getDateTraite(), lot.getTypeTraite(), lot.getQuantite(), usage.getQuantiteUtilisee(), available,
                analyses.findByLotLaitIdOrderByDateAnalyseDesc(lot.getId()).stream().map(a -> new AnalyseResponse(a.getId(), a.getDateAnalyse(), a.getTypeAnalyse(), a.getResultat(), a.getUnite(), a.getObservation())).toList());
    }
}
