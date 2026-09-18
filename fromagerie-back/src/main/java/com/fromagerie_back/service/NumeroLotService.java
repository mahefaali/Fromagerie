package com.fromagerie_back.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;

import com.fromagerie_back.repository.FabricationRepository;

@Service
public class NumeroLotService {

    private final FabricationRepository fabricationRepository;

    public NumeroLotService(FabricationRepository fabricationRepository) {
        this.fabricationRepository = fabricationRepository;
    }

    public String genererNumeroLot(LocalDate date) {

        LocalDateTime debut = date.atStartOfDay();
        LocalDateTime fin = date.plusDays(1).atStartOfDay();

        long nombreFabrications = fabricationRepository
                .countByDateHeureDebutGreaterThanEqualAndDateHeureDebutLessThan(debut, fin);

        long sequence = nombreFabrications + 1;

        String numeroLot = String.format(
                "%s-%03d",
                date.format(DateTimeFormatter.BASIC_ISO_DATE),
                sequence);
        while (fabricationRepository.existsByNumeroLot(numeroLot)) {
            sequence++;
            numeroLot = String.format(
                    "%s-%03d",
                    date.format(DateTimeFormatter.BASIC_ISO_DATE),
                    sequence);
        }
        return numeroLot;
    }
}
