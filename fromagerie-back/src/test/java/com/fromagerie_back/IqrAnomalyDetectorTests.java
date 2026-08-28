package com.fromagerie_back;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.fromagerie_back.dto.analytics.DirectionAnomalie;
import com.fromagerie_back.service.IqrAnomalyDetector;

class IqrAnomalyDetectorTests {

    private final IqrAnomalyDetector detector = new IqrAnomalyDetector();
    private final List<BigDecimal> usualValues = decimals("9.8", "10.0", "10.1", "10.2", "10.3", "10.4");

    @Test
    void detectsClearlyLowValue() {
        assertThat(detector.detect(new BigDecimal("6.8"), usualValues))
                .get()
                .extracting(IqrAnomalyDetector.Detection::direction)
                .isEqualTo(DirectionAnomalie.BASSE);
    }

    @Test
    void detectsClearlyHighValue() {
        assertThat(detector.detect(new BigDecimal("15.0"), usualValues))
                .get()
                .extracting(IqrAnomalyDetector.Detection::direction)
                .isEqualTo(DirectionAnomalie.HAUTE);
    }

    @Test
    void doesNotFlagValueInsideUsualDistribution() {
        assertThat(detector.detect(new BigDecimal("10.15"), usualValues)).isEmpty();
    }

    private List<BigDecimal> decimals(String... values) {
        return java.util.Arrays.stream(values).map(BigDecimal::new).toList();
    }
}
