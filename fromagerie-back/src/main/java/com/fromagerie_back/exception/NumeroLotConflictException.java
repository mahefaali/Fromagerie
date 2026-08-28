package com.fromagerie_back.exception;

public class NumeroLotConflictException extends RuntimeException {

    public NumeroLotConflictException(String numeroLot) {
        super("Le numéro de lot " + numeroLot + " existe déjà");
    }
}
