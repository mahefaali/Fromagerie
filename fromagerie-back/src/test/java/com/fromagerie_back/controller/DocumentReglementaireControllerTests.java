package com.fromagerie_back.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import com.fromagerie_back.service.DocumentPdfService.PdfDocument;
import com.fromagerie_back.service.DocumentReglementaireService;

class DocumentReglementaireControllerTests {
    @Test void retourneLeContentTypePdfEtLeBonNomDeFichier() {
        DocumentReglementaireService service=mock(DocumentReglementaireService.class);
        when(service.ficheFabrication(1L)).thenReturn(new PdfDocument("%PDF-test".getBytes(),"fabrication-FAB-1.pdf"));
        var response=new DocumentReglementaireController(service).fabrication(1L);
        assertThat(response.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_PDF);
        assertThat(response.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION)).contains("fabrication-FAB-1.pdf");
        assertThat(response.getBody()).isNotEmpty();
    }
}
