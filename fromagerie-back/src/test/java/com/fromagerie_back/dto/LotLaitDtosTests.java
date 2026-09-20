package com.fromagerie_back.dto;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;

import com.fromagerie_back.model.TypeTraite;

import jakarta.validation.Validation;
import jakarta.validation.Validator;

class LotLaitDtosTests {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void coutUnitairePositifEstAccepte() {
        assertThat(validator.validate(request("1.2500"))).isEmpty();
    }

    @Test
    void coutUnitaireZeroEstAccepte() {
        assertThat(validator.validate(request("0.0000"))).isEmpty();
    }

    @Test
    void coutUnitaireNegatifEstRefuse() {
        assertThat(validator.validate(request("-0.0001")))
                .anyMatch(violation -> violation.getPropertyPath().toString().equals("coutUnitaire"));
    }

    private LotLaitDtos.Request request(String cout) {
        return new LotLaitDtos.Request("LAIT-TEST", LocalDateTime.now().minusMinutes(1), TypeTraite.MATIN,
                new BigDecimal("120.0000"), new BigDecimal(cout), null);
    }
}
