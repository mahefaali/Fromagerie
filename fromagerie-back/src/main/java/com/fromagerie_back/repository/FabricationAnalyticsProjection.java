package com.fromagerie_back.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface FabricationAnalyticsProjection {
    Long getFabricationId();

    String getNumeroLot();

    LocalDateTime getDateHeureDebut();

    Long getFromageId();

    String getFromageNom();

    Long getRecetteId();

    String getRecetteNom();

    BigDecimal getTemperatureChauffage();

    BigDecimal getRendement();
}
