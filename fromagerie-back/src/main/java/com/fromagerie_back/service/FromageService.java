package com.fromagerie_back.service;

import com.fromagerie_back.dto.FromageCreateRequest;
import com.fromagerie_back.dto.FromageResponse;
import com.fromagerie_back.dto.FromageUpdateRequest;
import com.fromagerie_back.exception.FromageNotFoundException;
import com.fromagerie_back.model.Fromage;
import com.fromagerie_back.repository.FromageRepository;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class FromageService {

    private final FromageRepository fromageRepository;

    public FromageService(FromageRepository fromageRepository) {
        this.fromageRepository = fromageRepository;
    }

    @Transactional(readOnly = true)
    public List<FromageResponse> getAllFromages() {

        return fromageRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public FromageResponse createFromage(FromageCreateRequest request) {

        Fromage fromage = new Fromage();

        fromage.setNom(request.getNom());
        fromage.setDescription(request.getDescription());

        Fromage savedFromage = fromageRepository.save(fromage);

        return toResponse(savedFromage);
    }

    @Transactional(readOnly = true)
    public FromageResponse getFromageById(Long id) {

        Fromage fromage = fromageRepository.findById(id)
                .orElseThrow(() -> new FromageNotFoundException(id));

        return toResponse(fromage);
    }

    @Transactional
    public FromageResponse updateFromage(
            Long id,
            FromageUpdateRequest request) {

        Fromage fromage = fromageRepository.findById(id)
                .orElseThrow(() -> new FromageNotFoundException(id));

        fromage.setNom(request.getNom());
        fromage.setDescription(request.getDescription());

        Fromage updatedFromage = fromageRepository.save(fromage);

        return toResponse(updatedFromage);
    }

    @Transactional
    public void deleteFromage(Long id) {

        if (!fromageRepository.existsById(id)) {
            throw new FromageNotFoundException(id);
        }

        fromageRepository.deleteById(id);
    }

    private FromageResponse toResponse(Fromage fromage) {

        return new FromageResponse(
                fromage.getId(),
                fromage.getNom(),
                fromage.getDescription());
    }
}