package com.fromagerie_back.controller;
import java.net.URI; import java.util.*;
import org.springframework.http.ResponseEntity; import org.springframework.web.bind.annotation.*;
import com.fromagerie_back.dto.LotLaitDtos.*; import com.fromagerie_back.service.LotLaitService; import jakarta.validation.Valid;
@RestController @RequestMapping("/api/lots-lait") public class LotLaitController{
 private final LotLaitService service; public LotLaitController(LotLaitService s){service=s;}
 @GetMapping public List<Response> all(){return service.findAll();} @GetMapping("/{id}") public Response one(@PathVariable Long id){return service.find(id);}
 @PostMapping public ResponseEntity<Response> create(@Valid @RequestBody Request r){Response x=service.create(r);return ResponseEntity.created(URI.create("/api/lots-lait/"+x.id())).body(x);}
 @PutMapping("/{id}") public Response update(@PathVariable Long id,@Valid @RequestBody Request r){return service.update(id,r);}
 @GetMapping("/{id}/analyses") public List<AnalyseResponse> analyses(@PathVariable Long id){return service.analyses(id);}
 @PostMapping("/{id}/analyses") public ResponseEntity<AnalyseResponse> add(@PathVariable Long id,@Valid @RequestBody AnalyseRequest r){AnalyseResponse x=service.addAnalyse(id,r);return ResponseEntity.created(URI.create("/api/analyses-lait/"+x.id())).body(x);}
}
