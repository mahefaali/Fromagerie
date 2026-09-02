package com.fromagerie_back.dto;

import java.time.LocalDate;
import java.util.List;

public record RentabiliteAnalyseResponse(
        LocalDate dateDebut,
        LocalDate dateFin,
        RentabiliteSyntheseResponse synthese,
        List<RentabiliteFromageResponse> parFromage,
        List<RentabiliteGroupeResponse> parClient,
        List<RentabiliteCroiseeResponse> croisee) {
}
