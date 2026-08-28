package com.fromagerie_back.controller;

import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.fromagerie_back.dto.CommandeRequests.*;
import com.fromagerie_back.dto.CommandeResponses.*;
import com.fromagerie_back.service.CommandeService;

@RestController
@RequestMapping("/api")
public class CommandeController {
 private final CommandeService service;
 public CommandeController(CommandeService service){this.service=service;}
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
 @PostMapping("/commandes/{id}/facture") public FactureResponse facture(@PathVariable Long id,@Valid @RequestBody FactureRequest r){return service.facture(id,r);}
 @GetMapping("/factures/{id}") public FactureResponse facture(@PathVariable Long id){return service.getFacture(id);}
}
