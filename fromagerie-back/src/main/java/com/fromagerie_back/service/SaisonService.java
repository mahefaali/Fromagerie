package com.fromagerie_back.service;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.MonthDay;

import org.springframework.stereotype.Service;

import com.fromagerie_back.config.AnalyticsProperties;
import com.fromagerie_back.model.TypeSaison;

@Service
public class SaisonService {

    private final MonthDay debutSeche;
    private final MonthDay finSeche;
    private final MonthDay debutHumide;
    private final MonthDay finHumide;

    public SaisonService(AnalyticsProperties properties) {
        debutSeche = parse(properties.getSaisons().getSeche().getDebut(), "saison sèche début");
        finSeche = parse(properties.getSaisons().getSeche().getFin(), "saison sèche fin");
        debutHumide = parse(properties.getSaisons().getHumide().getDebut(), "saison humide début");
        finHumide = parse(properties.getSaisons().getHumide().getFin(), "saison humide fin");
        validateCoverage();
    }

    public TypeSaison determinerSaison(LocalDate date) {
        MonthDay day = MonthDay.from(date);
        if (contains(day, debutSeche, finSeche)) {
            return TypeSaison.SECHE;
        }
        if (contains(day, debutHumide, finHumide)) {
            return TypeSaison.HUMIDE;
        }
        throw new IllegalStateException("Aucune saison configurée pour la date " + date);
    }

    private void validateCoverage() {
        // L'année 2000 est bissextile : elle couvre tous les MonthDay possibles, dont le 29 février.
        LocalDate day = LocalDate.of(2000, 1, 1);
        LocalDate end = LocalDate.of(2000, 12, 31);
        while (!day.isAfter(end)) {
            MonthDay monthDay = MonthDay.from(day);
            int matches = (contains(monthDay, debutSeche, finSeche) ? 1 : 0)
                    + (contains(monthDay, debutHumide, finHumide) ? 1 : 0);
            if (matches == 0) {
                throw new IllegalStateException(
                        "Configuration saisonnière invalide: trou détecté, aucune saison ne couvre le jour "
                                + monthDay);
            }
            if (matches > 1) {
                throw new IllegalStateException(
                        "Configuration saisonnière invalide: chevauchement détecté, plusieurs saisons couvrent le jour "
                                + monthDay);
            }
            day = day.plusDays(1);
        }
    }

    private boolean contains(MonthDay day, MonthDay start, MonthDay end) {
        if (start.compareTo(end) <= 0) {
            return day.compareTo(start) >= 0 && day.compareTo(end) <= 0;
        }
        return day.compareTo(start) >= 0 || day.compareTo(end) <= 0;
    }

    private MonthDay parse(String value, String label) {
        try {
            return MonthDay.parse("--" + value);
        } catch (DateTimeException | NullPointerException exception) {
            throw new IllegalStateException(
                    "Configuration invalide pour " + label + ": format attendu MM-dd", exception);
        }
    }
}
