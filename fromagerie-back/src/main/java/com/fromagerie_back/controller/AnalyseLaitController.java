package com.fromagerie_back.controller;
import org.springframework.web.bind.annotation.*; import com.fromagerie_back.dto.LotLaitDtos.*; import com.fromagerie_back.service.LotLaitService; import jakarta.validation.Valid;
@RestController @RequestMapping("/api/analyses-lait") public class AnalyseLaitController{private final LotLaitService service;public AnalyseLaitController(LotLaitService s){service=s;}@PutMapping("/{id}") public AnalyseResponse update(@PathVariable Long id,@Valid @RequestBody AnalyseRequest r){return service.updateAnalyse(id,r);}}
