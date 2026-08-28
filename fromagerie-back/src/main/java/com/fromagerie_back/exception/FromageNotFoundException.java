package com.fromagerie_back.exception;

public class FromageNotFoundException extends RuntimeException {

    public FromageNotFoundException(Long id) {
        super("Le fromage avec l'id " + id + " n'existe pas");
    }
}