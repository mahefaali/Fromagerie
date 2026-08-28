package com.fromagerie_back;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import com.fromagerie_back.dto.AffinageCreateRequest;
import com.fromagerie_back.dto.CaveRequest;
import com.fromagerie_back.dto.DeplacementAffinageRequest;
import com.fromagerie_back.dto.EtagereRequest;
import com.fromagerie_back.dto.PlacementResultResponse;
import com.fromagerie_back.dto.RangeeRequest;
import com.fromagerie_back.dto.SoinAffinageRequest;
import com.fromagerie_back.exception.BusinessConflictException;
import com.fromagerie_back.exception.BusinessValidationException;
import com.fromagerie_back.exception.ResourceNotFoundException;
import com.fromagerie_back.model.Cave;
import com.fromagerie_back.model.Etagere;
import com.fromagerie_back.model.Fabrication;
import com.fromagerie_back.model.Fromage;
import com.fromagerie_back.model.OrigineLait;
import com.fromagerie_back.model.Rangee;
import com.fromagerie_back.model.Recette;
import com.fromagerie_back.model.Role;
import com.fromagerie_back.model.TypeSoinAffinage;
import com.fromagerie_back.model.Utilisateur;
import com.fromagerie_back.repository.CaveRepository;
import com.fromagerie_back.repository.FabricationRepository;
import com.fromagerie_back.repository.FromageRepository;
import com.fromagerie_back.repository.LotAffinageRepository;
import com.fromagerie_back.repository.PlacementAffinageRepository;
import com.fromagerie_back.repository.RecetteRepository;
import com.fromagerie_back.repository.SoinAffinageRepository;
import com.fromagerie_back.repository.UtilisateurRepository;
import com.fromagerie_back.service.AffinageService;
import com.fromagerie_back.service.CaveService;

@SpringBootTest
@AutoConfigureMockMvc
class AffinageIntegrationTests {

    @Autowired private AffinageService affinageService;
    @Autowired private CaveService caveService;
    @Autowired private MockMvc mockMvc;
    @Autowired private CaveRepository caveRepository;
    @Autowired private LotAffinageRepository lotRepository;
    @Autowired private PlacementAffinageRepository placementRepository;
    @Autowired private SoinAffinageRepository soinRepository;
    @Autowired private FabricationRepository fabricationRepository;
    @Autowired private RecetteRepository recetteRepository;
    @Autowired private FromageRepository fromageRepository;
    @Autowired private UtilisateurRepository utilisateurRepository;

    private Recette recette;
    private Utilisateur employe;
    private int lotSequence;

    @BeforeEach
    void setUp() {
        cleanDatabase();
        Fromage fromage = fromageRepository.save(new Fromage(null, "Tomme", "Fromage test"));
        recette = new Recette("Classique");
        recette.setFromage(fromage);
        recette = recetteRepository.save(recette);
        employe = utilisateurRepository.save(new Utilisateur(
                "employee", "Employé affinage", "hash", Role.FABRICATION, true));
    }

    @AfterEach
    void tearDown() {
        cleanDatabase();
    }

    @Test
    void createsUniqueLotFromFabricationSnapshotAndCalculatesRemainingDays() {
        Fabrication fabrication = fabrication(17);
        var created = createLot(fabrication, LocalDate.now().plusDays(12));

        assertThat(created.quantiteInitiale()).isEqualTo(17);
        assertThat(created.joursRestants()).isEqualTo(12);
        assertThat(created.quantitePlacee()).isZero();
        assertThat(created.quantiteRestante()).isEqualTo(17);

        fabrication.setNombreFromages(20);
        fabricationRepository.saveAndFlush(fabrication);
        assertThat(affinageService.findById(created.id()).quantiteInitiale()).isEqualTo(17);
        assertThatThrownBy(() -> createLot(fabrication, LocalDate.now().plusDays(20)))
                .isInstanceOf(BusinessConflictException.class);
    }

    @Test
    void placementContinuesAcrossRowsAndShelvesInPhysicalOrder() {
        Cave cave = cave("Cave 1", new int[][] { { 10, 10 }, { 10 } });
        var lot = createLot(fabrication(25), LocalDate.now().plusDays(30));
        Rangee depart = cave.getEtageres().getFirst().getRangees().getFirst();

        PlacementResultResponse result = affinageService.placer(
                lot.id(), new com.fromagerie_back.dto.AffinagePlacementRequest(
                        cave.getId(), depart.getId()));

        assertThat(result.placementComplet()).isTrue();
        assertThat(result.placementsCrees())
                .extracting(p -> p.etagereNumero() + ":" + p.rangeeNumero() + ":" + p.positionDebut() + ":" + p.quantite())
                .containsExactly("1:1:1:10", "1:2:1:10", "2:1:1:5");
    }

    @Test
    void placementStartsAtFirstAvailablePositionWithoutOverlap() {
        Cave cave = cave("Cave occupée", new int[][] { { 10, 10 } });
        Rangee depart = cave.getEtageres().getFirst().getRangees().getFirst();
        var premierLot = createLot(fabrication(3), LocalDate.now().plusDays(10));
        affinageService.placer(premierLot.id(), new com.fromagerie_back.dto.AffinagePlacementRequest(
                cave.getId(), depart.getId()));

        var secondLot = createLot(fabrication(10), LocalDate.now().plusDays(10));
        PlacementResultResponse result = affinageService.placer(
                secondLot.id(), new com.fromagerie_back.dto.AffinagePlacementRequest(
                        cave.getId(), depart.getId()));

        assertThat(result.placementsCrees())
                .extracting(p -> p.rangeeNumero() + ":" + p.positionDebut() + "-" + p.positionFin())
                .containsExactly("1:4-10", "2:1-3");
        assertThat(placementRepository.findActiveByCaveId(cave.getId()))
                .allSatisfy(placement -> assertThat(
                        placement.getPositionDebut() + placement.getQuantite() - 1)
                        .isLessThanOrEqualTo(placement.getRangee().getCapacite()));
    }

    @Test
    void caveOccupationsExposeTheLotNumberForEachActivePlacement() throws Exception {
        Cave cave = cave("Cave avec lots", new int[][] { { 5 } });
        Fabrication fabrication = fabrication(3);
        var lot = createLot(fabrication, LocalDate.now().plusDays(10));
        affinageService.placer(lot.id(), placement(cave));

        assertThat(caveService.findOccupations(cave.getId()))
                .singleElement()
                .satisfies(occupation -> {
                    assertThat(occupation.etagereNumero()).isEqualTo(1);
                    assertThat(occupation.rangeeNumero()).isEqualTo(1);
                    assertThat(occupation.positionDebut()).isEqualTo(1);
                    assertThat(occupation.positionFin()).isEqualTo(3);
                    assertThat(occupation.numeroLot()).isEqualTo(fabrication.getNumeroLot());
                });

        mockMvc.perform(get("/api/caves/{id}/occupations", cave.getId())
                        .with(user("employee").roles("FABRICATION")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].numeroLot").value(fabrication.getNumeroLot()))
                .andExpect(jsonPath("$[0].positionDebut").value(1))
                .andExpect(jsonPath("$[0].positionFin").value(3));
    }

    @Test
    void insufficientCaveReturnsRemainderThenPlacesItInAnotherCaveAndUpdatesCapacity() {
        Cave petite = cave("Petite", new int[][] { { 5 } });
        Cave autre = cave("Autre", new int[][] { { 4 } });
        var lot = createLot(fabrication(8), LocalDate.now().plusDays(15));

        PlacementResultResponse first = affinageService.placer(
                lot.id(), placement(petite));
        assertThat(first.quantitePlacee()).isEqualTo(5);
        assertThat(first.quantiteRestante()).isEqualTo(3);
        assertThat(first.placementComplet()).isFalse();

        PlacementResultResponse second = affinageService.placer(
                lot.id(), placement(autre));
        assertThat(second.quantiteDemandee()).isEqualTo(3);
        assertThat(second.quantiteRestante()).isZero();

        var caveResponse = caveService.findById(petite.getId());
        assertThat(caveResponse.capaciteOccupee()).isEqualTo(5);
        assertThat(caveResponse.capaciteDisponible()).isZero();
        assertThat(caveResponse.etageres().getFirst().rangees().getFirst().capaciteOccupee()).isEqualTo(5);
        assertThat(caveResponse.etageres().getFirst().rangees().getFirst().capaciteDisponible()).isZero();
    }

    @Test
    void movementClosesOldPlacementsAndFailureKeepsCurrentPlacementActive() {
        Cave source = cave("Source", new int[][] { { 5 } });
        Cave destination = cave("Destination", new int[][] { { 5 } });
        Cave tropPetite = cave("Trop petite", new int[][] { { 4 } });
        var lot = createLot(fabrication(5), LocalDate.now().plusDays(20));
        affinageService.placer(lot.id(), placement(source));

        affinageService.deplacer(lot.id(), new DeplacementAffinageRequest(
                destination.getId(), firstRange(destination).getId()));
        var historique = affinageService.findById(lot.id());
        assertThat(historique.historiquePlacements()).hasSize(1);
        assertThat(historique.historiquePlacements().getFirst().dateFin()).isNotNull();
        assertThat(historique.placementsActifs().getFirst().caveNom()).isEqualTo("Destination");

        assertThatThrownBy(() -> affinageService.deplacer(lot.id(), new DeplacementAffinageRequest(
                tropPetite.getId(), firstRange(tropPetite).getId())))
                .isInstanceOf(BusinessValidationException.class);
        assertThat(affinageService.findById(lot.id()).placementsActifs())
                .singleElement().extracting(p -> p.caveNom()).isEqualTo("Destination");
    }

    @Test
    void careUsesAuthenticatedUserAndKeepsRindHistory() {
        var lot = createLot(fabrication(6), LocalDate.now().plusDays(10));
        var authentication = new UsernamePasswordAuthenticationToken("employee", "ignored");

        var soin = affinageService.addSoin(lot.id(), new SoinAffinageRequest(
                TypeSoinAffinage.RETOURNEMENT, LocalDateTime.now().minusHours(1),
                "Retournement régulier", "Croûte sèche"), authentication);

        assertThat(soin.utilisateurId()).isEqualTo(employe.getId());
        assertThat(soin.utilisateurNom()).isEqualTo("Employé affinage");
        assertThat(affinageService.findById(lot.id()).etatCroute()).isEqualTo("Croûte sèche");
        assertThat(affinageService.findSoins(lot.id())).hasSize(1);
    }

    @Test
    void fabricationRoleCanManageAffinageWhileSalesCannot() throws Exception {
        mockMvc.perform(get("/api/affinages").with(user("employee").roles("FABRICATION")))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/affinages").with(user("sales").roles("VENTE")))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/affinages")
                        .with(user("sales").roles("VENTE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void ownerAndFabricationCanCallFinishedStockReleaseRoute() throws Exception {
        mockMvc.perform(post("/api/affinages/999999/sortie-stock")
                        .with(user("owner").roles("PROPRIETAIRE"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(post("/api/affinages/999999/sortie-stock")
                        .with(user("employee").roles("FABRICATION"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void distinguishesMissingRowFromRowBelongingToAnotherCave() {
        Cave cave = cave("Cave cible", new int[][] { { 5 } });
        Cave autre = cave("Autre cave", new int[][] { { 5 } });
        var lot = createLot(fabrication(2), LocalDate.now().plusDays(10));

        assertThatThrownBy(() -> affinageService.placer(lot.id(),
                new com.fromagerie_back.dto.AffinagePlacementRequest(cave.getId(), 999999L)))
                .isInstanceOf(ResourceNotFoundException.class);
        assertThatThrownBy(() -> affinageService.placer(lot.id(),
                new com.fromagerie_back.dto.AffinagePlacementRequest(
                        cave.getId(), firstRange(autre).getId())))
                .isInstanceOf(BusinessValidationException.class);
    }

    @Test
    void occupiedCaveAllowsMetadataUpdateButRejectsStructuralChanges() {
        Cave cave = cave("Cave historique", new int[][] { { 5 } });
        var lot = createLot(fabrication(2), LocalDate.now().plusDays(10));
        affinageService.placer(lot.id(), placement(cave));

        CaveRequest metadataOnly = caveRequest("Cave désactivée", false, 5);
        var updated = caveService.update(cave.getId(), metadataOnly);
        assertThat(updated.active()).isFalse();
        assertThat(updated.capaciteOccupee()).isEqualTo(2);

        assertThatThrownBy(() -> caveService.update(
                cave.getId(), caveRequest("Cave agrandie", false, 6)))
                .isInstanceOf(BusinessConflictException.class);
    }

    private com.fromagerie_back.dto.AffinageDetailResponse createLot(
            Fabrication fabrication, LocalDate sortie) {
        return affinageService.create(new AffinageCreateRequest(
                fabrication.getId(), LocalDate.now(), sortie, null));
    }

    private com.fromagerie_back.dto.AffinagePlacementRequest placement(Cave cave) {
        return new com.fromagerie_back.dto.AffinagePlacementRequest(
                cave.getId(), firstRange(cave).getId());
    }

    private Rangee firstRange(Cave cave) {
        return cave.getEtageres().getFirst().getRangees().getFirst();
    }

    private Cave cave(String nom, int[][] capacites) {
        Cave cave = new Cave();
        cave.setNom(nom);
        cave.setTemperature(BigDecimal.valueOf(12));
        cave.setHumidite(BigDecimal.valueOf(90));
        cave.setAgeMinJours(1);
        cave.setAgeMaxJours(60);
        cave.setActive(true);
        for (int e = 0; e < capacites.length; e++) {
            Etagere etagere = new Etagere();
            etagere.setNumero(e + 1);
            etagere.setOrdre(e + 1);
            for (int r = 0; r < capacites[e].length; r++) {
                Rangee rangee = new Rangee();
                rangee.setNumero(r + 1);
                rangee.setOrdre(r + 1);
                rangee.setCapacite(capacites[e][r]);
                etagere.addRangee(rangee);
            }
            cave.addEtagere(etagere);
        }
        return caveRepository.saveAndFlush(cave);
    }

    private CaveRequest caveRequest(String nom, boolean active, int capacite) {
        return new CaveRequest(
                nom, null, BigDecimal.valueOf(12), BigDecimal.valueOf(90),
                1, 60, active,
                java.util.List.of(new EtagereRequest(
                        1, 1, java.util.List.of(new RangeeRequest(1, 1, capacite)))));
    }

    private Fabrication fabrication(int nombreFromages) {
        Fabrication fabrication = new Fabrication();
        fabrication.setNumeroLot("AFF-TEST-" + (++lotSequence) + "-" + System.nanoTime());
        fabrication.setDateHeureDebut(LocalDateTime.now().minusDays(1));
        fabrication.setRecette(recette);
        fabrication.setQuantiteLait(BigDecimal.valueOf(100));
        fabrication.setTemperatureLait(BigDecimal.valueOf(32));
        fabrication.setOrigineLait(OrigineLait.TRAITE_MATIN);
        fabrication.setTemperatureChauffage(BigDecimal.valueOf(35));
        fabrication.setDureeChauffageMinutes(30);
        fabrication.setTypePresure("Présure");
        fabrication.setQuantitePresure(BigDecimal.ONE);
        fabrication.setTypeFerments("Ferments");
        fabrication.setQuantiteFerments(BigDecimal.ONE);
        fabrication.setTemperatureMiseEnMoule(BigDecimal.valueOf(28));
        fabrication.setDureeEgouttageMinutes(60);
        fabrication.setPoidsTotalFromages(BigDecimal.valueOf(20));
        fabrication.setRendement(BigDecimal.valueOf(20));
        fabrication.setNombreFromages(nombreFromages);
        fabrication.setOperateur(employe);
        return fabricationRepository.saveAndFlush(fabrication);
    }

    private void cleanDatabase() {
        soinRepository.deleteAll();
        placementRepository.deleteAll();
        lotRepository.deleteAll();
        fabricationRepository.deleteAll();
        caveRepository.deleteAll();
        recetteRepository.deleteAll();
        fromageRepository.deleteAll();
        utilisateurRepository.deleteAll();
    }
}
