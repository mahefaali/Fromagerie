package com.fromagerie_back.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fromagerie_back.dto.MessageResponse;
import com.fromagerie_back.model.Fromage;

@RestController
public class HelloController {

    @GetMapping("/api/hello")
    public String hello() {
        return "Bienvenue dans Fromagerie API";
    }

    @GetMapping("/api/bonjour")
    public String bonjour() {
        return "Bonjour depuis Spring Boot!";
    }

    @GetMapping("/api/message")
    public MessageResponse message() {
        return new MessageResponse(
                "Bienvenue dans le système de gestion de la Fromagerie");
    }

    @GetMapping("/api/fromage")
    public Fromage fromage() {
        return new Fromage(
                1L,
                "Fromage des Hauts",
                "Fromage de type tomme");
    }
}