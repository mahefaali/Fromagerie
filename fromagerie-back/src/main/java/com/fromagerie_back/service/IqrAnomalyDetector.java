package com.fromagerie_back.service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.fromagerie_back.dto.analytics.DirectionAnomalie;

@Component
public class IqrAnomalyDetector {

    private static final BigDecimal IQR_FACTOR = new BigDecimal("1.5");
    private static final MathContext MATH_CONTEXT = MathContext.DECIMAL64;

    public Optional<Detection> detect(BigDecimal value, List<BigDecimal> samples) {
        if (value == null || samples.isEmpty()) {
            return Optional.empty();
        }

        List<BigDecimal> sorted = new ArrayList<>(samples);
        sorted.sort(Comparator.naturalOrder());
        BigDecimal q1 = percentile(sorted, new BigDecimal("0.25"));
        BigDecimal q3 = percentile(sorted, new BigDecimal("0.75"));
        BigDecimal margin = q3.subtract(q1).multiply(IQR_FACTOR);
        BigDecimal lower = q1.subtract(margin);
        BigDecimal upper = q3.add(margin);

        if (value.compareTo(lower) < 0) {
            return Optional.of(new Detection(lower, upper, DirectionAnomalie.BASSE));
        }
        if (value.compareTo(upper) > 0) {
            return Optional.of(new Detection(lower, upper, DirectionAnomalie.HAUTE));
        }
        return Optional.empty();
    }

    private BigDecimal percentile(List<BigDecimal> values, BigDecimal percentile) {
        BigDecimal position = BigDecimal.valueOf(values.size() - 1).multiply(percentile);
        int lowerIndex = position.intValue();
        int upperIndex = Math.min(lowerIndex + 1, values.size() - 1);
        BigDecimal fraction = position.subtract(BigDecimal.valueOf(lowerIndex));
        BigDecimal lower = values.get(lowerIndex);
        return lower.add(values.get(upperIndex).subtract(lower).multiply(fraction, MATH_CONTEXT));
    }

    public record Detection(
            BigDecimal borneBasse,
            BigDecimal borneHaute,
            DirectionAnomalie direction) {
    }
}
