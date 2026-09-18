package com.fromagerie_back.controller;

import java.util.List;
import java.nio.charset.StandardCharsets;
import org.springframework.security.core.Authentication;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.fromagerie_back.dto.CommandeRequests.*;
import com.fromagerie_back.dto.CommandeResponses.*;
import com.fromagerie_back.service.CommandeService;
import com.fromagerie_back.service.DocumentPdfService;
import com.fromagerie_back.service.DocumentPdfService.PdfDocument;

@RestController
@RequestMapping("/api")
public class CommandeController {
 private final CommandeService service;
 private final DocumentPdfService documents;
 public CommandeController(CommandeService service,DocumentPdfService documents){this.service=service;this.documents=documents;}
 @GetMapping("/clients") public List<ClientResponse> clients(){return service.clients();}
 @GetMapping("/clients/{id}") public ClientResponse client(@PathVariable Long id){return service.client(id);}
 @PostMapping("/clients") public ClientResponse createClient(@Valid @RequestBody ClientRequest r){return service.createClient(r);}
 @PutMapping("/clients/{id}") public ClientResponse updateClient(@PathVariable Long id,@Valid @RequestBody ClientRequest r){return service.updateClient(id,r);}
 @GetMapping("/commandes") public List<CommandeResponse> commandes(){return service.list();}
 @GetMapping("/commandes/{id}") public CommandeResponse commande(@PathVariable Long id){return service.get(id);}
 @PostMapping("/commandes") public CommandeResponse create(@Valid @RequestBody CommandeRequest r,Authentication a){return service.create(r,a);}
 @PutMapping("/commandes/{id}") public CommandeResponse update(@PathVariable Long id,@Valid @RequestBody CommandeRequest r){return service.update(id,r);}
 @PostMapping("/commandes/{id}/confirmation") public CommandeResponse confirm(@PathVariable Long id){return service.confirm(id);}
 @PostMapping("/commandes/{id}/annulation") public CommandeResponse cancel(@PathVariable Long id){return service.cancel(id);}
 @PostMapping("/commandes/{id}/preparation") public CommandeResponse prepare(@PathVariable Long id){return service.prepare(id);}
 @PostMapping("/commandes/{id}/livraison") public CommandeResponse deliver(@PathVariable Long id,@Valid @RequestBody LivraisonRequest r,Authentication a){return service.deliver(id,r,a);}
 @GetMapping("/commandes/{id}/bon-preparation") public CommandeResponse preparation(@PathVariable Long id){return service.get(id);}
 @GetMapping(value="/commandes/{id}/bon-preparation.pdf",produces=MediaType.APPLICATION_PDF_VALUE) public ResponseEntity<byte[]> preparationPdf(@PathVariable Long id){return pdf(documents.bonPreparation(id));}
 @PostMapping("/commandes/{id}/facture") public FactureResponse facture(@PathVariable Long id,@Valid @RequestBody FactureRequest r){return service.facture(id,r);}
 @GetMapping(value="/commandes/{id}/bon-livraison.pdf",produces=MediaType.APPLICATION_PDF_VALUE) public ResponseEntity<byte[]> livraisonPdf(@PathVariable Long id){return pdf(documents.bonLivraison(id));}
 @GetMapping("/factures/{id}") public FactureResponse facture(@PathVariable Long id){return service.getFacture(id);}
 @GetMapping(value="/factures/{id}/document.pdf",produces=MediaType.APPLICATION_PDF_VALUE) public ResponseEntity<byte[]> facturePdf(@PathVariable Long id){return pdf(documents.facture(id));}
 private ResponseEntity<byte[]> pdf(PdfDocument document){return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).header(HttpHeaders.CONTENT_DISPOSITION,ContentDisposition.attachment().filename(document.filename(),StandardCharsets.UTF_8).build().toString()).body(document.content());}
}
