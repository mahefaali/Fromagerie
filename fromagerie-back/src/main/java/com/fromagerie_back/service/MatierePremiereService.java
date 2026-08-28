package com.fromagerie_back.service;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fromagerie_back.dto.MatierePremiereRequest;
import com.fromagerie_back.dto.MatierePremiereResponse;
import com.fromagerie_back.exception.BusinessConflictException;
import com.fromagerie_back.exception.ResourceNotFoundException;
import com.fromagerie_back.model.MatierePremiere;
import com.fromagerie_back.repository.MatierePremiereRepository;
import com.fromagerie_back.repository.RecetteIngredientRepository;

@Service
public class MatierePremiereService {

    private final MatierePremiereRepository matierePremiereRepository;
    private final RecetteIngredientRepository recetteIngredientRepository;

    public MatierePremiereService(
            MatierePremiereRepository matierePremiereRepository,
            RecetteIngredientRepository recetteIngredientRepository) {
        this.matierePremiereRepository = matierePremiereRepository;
        this.recetteIngredientRepository = recetteIngredientRepository;
    }

    @Transactional(readOnly = true)
    public List<MatierePremiereResponse> findAll() {
        return matierePremiereRepository.findAllByOrderByNomAsc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public MatierePremiereResponse findById(Long id) {
        return toResponse(find(id));
    }

    @Transactional
    public MatierePremiereResponse create(MatierePremiereRequest request) {
        String name = request.getNom().trim();
        if (matierePremiereRepository.existsByNomIgnoreCase(name)) {
            throw new BusinessConflictException("Une matière première portant ce nom existe déjà");
        }
        MatierePremiere material = new MatierePremiere();
        apply(material, request, name);
        return save(material);
    }

    @Transactional
    public MatierePremiereResponse update(Long id, MatierePremiereRequest request) {
        MatierePremiere material = find(id);
        String name = request.getNom().trim();
        if (matierePremiereRepository.existsByNomIgnoreCaseAndIdNot(name, id)) {
            throw new BusinessConflictException("Une matière première portant ce nom existe déjà");
        }
        if (material.getUniteReference() != request.getUniteReference()
                && recetteIngredientRepository.existsByMatierePremiereId(id)) {
            throw new BusinessConflictException(
                    "L'unité de référence d'une matière déjà utilisée ne peut pas être modifiée");
        }
        apply(material, request, name);
        return save(material);
    }

    private MatierePremiere find(Long id) {
        return matierePremiereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Matière première introuvable avec l'id : " + id));
    }

    private void apply(MatierePremiere material, MatierePremiereRequest request, String name) {
        material.setNom(name);
        material.setUniteReference(request.getUniteReference());
        material.setCoutUnitaire(request.getCoutUnitaire());
        material.setActif(request.isActif());
    }

    private MatierePremiereResponse save(MatierePremiere material) {
        try {
            return toResponse(matierePremiereRepository.saveAndFlush(material));
        } catch (DataIntegrityViolationException exception) {
            throw new BusinessConflictException("Une matière première portant ce nom existe déjà");
        }
    }

    private MatierePremiereResponse toResponse(MatierePremiere material) {
        return new MatierePremiereResponse(
                material.getId(), material.getNom(), material.getUniteReference(),
                material.getCoutUnitaire(), material.isActif());
    }
}
