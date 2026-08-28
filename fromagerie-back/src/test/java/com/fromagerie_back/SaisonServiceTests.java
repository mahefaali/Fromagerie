package com.fromagerie_back;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import com.fromagerie_back.config.AnalyticsProperties;
import com.fromagerie_back.model.TypeSaison;
import com.fromagerie_back.service.SaisonService;

class SaisonServiceTests {

    @Test
    void classifiesDryAndWetDates() {
        SaisonService service = new SaisonService(validProperties());

        assertThat(service.determinerSaison(LocalDate.of(2026, 8, 25))).isEqualTo(TypeSaison.SECHE);
        assertThat(service.determinerSaison(LocalDate.of(2026, 2, 10))).isEqualTo(TypeSaison.HUMIDE);
    }

    @Test
    void seasonBoundsAreInclusive() {
        SaisonService service = new SaisonService(validProperties());

        assertThat(service.determinerSaison(LocalDate.of(2026, 5, 1))).isEqualTo(TypeSaison.SECHE);
        assertThat(service.determinerSaison(LocalDate.of(2026, 10, 31))).isEqualTo(TypeSaison.SECHE);
        assertThat(service.determinerSaison(LocalDate.of(2026, 11, 1))).isEqualTo(TypeSaison.HUMIDE);
        assertThat(service.determinerSaison(LocalDate.of(2026, 4, 30))).isEqualTo(TypeSaison.HUMIDE);
    }

    @Test
    void wetSeasonCrossesTheYearBoundary() {
        SaisonService service = new SaisonService(validProperties());

        assertThat(service.determinerSaison(LocalDate.of(2026, 11, 15))).isEqualTo(TypeSaison.HUMIDE);
        assertThat(service.determinerSaison(LocalDate.of(2026, 12, 31))).isEqualTo(TypeSaison.HUMIDE);
        assertThat(service.determinerSaison(LocalDate.of(2027, 1, 1))).isEqualTo(TypeSaison.HUMIDE);
        assertThat(service.determinerSaison(LocalDate.of(2027, 2, 15))).isEqualTo(TypeSaison.HUMIDE);
    }

    @Test
    void leapDayBelongsToExactlyOneSeason() {
        SaisonService service = new SaisonService(validProperties());

        assertThat(service.determinerSaison(LocalDate.of(2024, 2, 29))).isEqualTo(TypeSaison.HUMIDE);
    }

    @Test
    void everyDayOfALeapYearBelongsToOneSeason() {
        SaisonService service = new SaisonService(validProperties());
        LocalDate day = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 12, 31);

        while (!day.isAfter(end)) {
            assertThat(service.determinerSaison(day))
                    .as("saison du %s", day)
                    .isIn(TypeSaison.SECHE, TypeSaison.HUMIDE);
            day = day.plusDays(1);
        }
    }

    @Test
    void overlappingSeasonsFailFast() {
        AnalyticsProperties properties = validProperties();
        properties.getSaisons().getHumide().setDebut("10-01");

        assertThatThrownBy(() -> new SaisonService(properties))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Configuration saisonnière invalide")
                .hasMessageContaining("chevauchement");
    }

    @Test
    void gapBetweenSeasonsFailsFast() {
        AnalyticsProperties properties = validProperties();
        properties.getSaisons().getSeche().setFin("08-15");
        properties.getSaisons().getHumide().setDebut("08-18");

        assertThatThrownBy(() -> new SaisonService(properties))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Configuration saisonnière invalide")
                .hasMessageContaining("trou")
                .hasMessageContaining("--08-16");
    }

    @Test
    void exhaustiveConfigurationIsAccepted() {
        assertThat(new SaisonService(validProperties())).isNotNull();
    }

    @Test
    void invalidMonthDayFailsFast() {
        AnalyticsProperties properties = validProperties();
        properties.getSaisons().getSeche().setDebut("13-40");

        assertThatThrownBy(() -> new SaisonService(properties))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("format attendu MM-dd");
    }

    private AnalyticsProperties validProperties() {
        AnalyticsProperties properties = new AnalyticsProperties();
        properties.getSaisons().getSeche().setDebut("05-01");
        properties.getSaisons().getSeche().setFin("10-31");
        properties.getSaisons().getHumide().setDebut("11-01");
        properties.getSaisons().getHumide().setFin("04-30");
        return properties;
    }
}
