package com.fromagerie_back.controller;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fromagerie_back.service.DocumentPdfService.PdfDocument;
import com.fromagerie_back.service.DocumentReglementaireService;

@RestController
@RequestMapping("/api/documents")
public class DocumentReglementaireController {
    private final DocumentReglementaireService service;

    public DocumentReglementaireController(DocumentReglementaireService service) { this.service = service; }

    @GetMapping(value = "/registre-tracabilite", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> registre(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return pdf(service.registre(debut, fin));
    }

    @GetMapping(value = "/fabrications/{id}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> fabrication(@PathVariable Long id) { return pdf(service.ficheFabrication(id)); }

    @GetMapping(value = "/affinages/{id}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> affinage(@PathVariable Long id) { return pdf(service.ficheAffinage(id)); }

    @GetMapping(value = "/lots-lait/{id}/analyses", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> analyses(@PathVariable Long id) { return pdf(service.analysesLait(id)); }

    private ResponseEntity<byte[]> pdf(PdfDocument document) {
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(document.filename(), StandardCharsets.UTF_8).build().toString())
                .body(document.content());
    }
}
