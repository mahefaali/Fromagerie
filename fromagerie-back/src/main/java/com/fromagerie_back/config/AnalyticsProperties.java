package com.fromagerie_back.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Component
@Validated
@ConfigurationProperties(prefix = "fromagerie.analytics")
public class AnalyticsProperties {

    @Valid
    private final Anomalies anomalies = new Anomalies();

    @Valid
    private final Saisons saisons = new Saisons();

    public Anomalies getAnomalies() {
        return anomalies;
    }

    public Saisons getSaisons() {
        return saisons;
    }

    public static class Anomalies {
        @Min(1)
        private int minimumSamples = 8;

        public int getMinimumSamples() {
            return minimumSamples;
        }

        public void setMinimumSamples(int minimumSamples) {
            this.minimumSamples = minimumSamples;
        }
    }

    public static class Saisons {
        @Valid
        private final Periode seche = new Periode();

        @Valid
        private final Periode humide = new Periode();

        public Periode getSeche() {
            return seche;
        }

        public Periode getHumide() {
            return humide;
        }
    }

    public static class Periode {
        @NotBlank
        private String debut;

        @NotBlank
        private String fin;

        public String getDebut() {
            return debut;
        }

        public void setDebut(String debut) {
            this.debut = debut;
        }

        public String getFin() {
            return fin;
        }

        public void setFin(String fin) {
            this.fin = fin;
        }
    }
}
