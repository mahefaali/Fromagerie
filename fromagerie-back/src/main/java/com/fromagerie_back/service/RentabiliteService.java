package com.fromagerie_back.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fromagerie_back.dto.RentabiliteAnalyseResponse;
import com.fromagerie_back.dto.RentabiliteCroiseeResponse;
import com.fromagerie_back.dto.RentabiliteFromageResponse;
import com.fromagerie_back.dto.RentabiliteGroupeResponse;
import com.fromagerie_back.dto.RentabiliteSyntheseResponse;
import com.fromagerie_back.exception.BusinessConflictException;
import com.fromagerie_back.model.CoutProductionLot;
import com.fromagerie_back.model.LigneLivraison;
import com.fromagerie_back.repository.CoutProductionLotRepository;
import com.fromagerie_back.repository.LigneLivraisonRepository;

@Service
public class RentabiliteService {
    private final LigneLivraisonRepository ligneLivraisonRepository;
    private final CoutProductionLotRepository coutProductionLotRepository;

    public RentabiliteService(LigneLivraisonRepository ligneLivraisonRepository,
            CoutProductionLotRepository coutProductionLotRepository) {
        this.ligneLivraisonRepository = ligneLivraisonRepository;
        this.coutProductionLotRepository = coutProductionLotRepository;
    }

    @Transactional(readOnly = true)
    public RentabiliteAnalyseResponse analyser(LocalDate dateDebut, LocalDate dateFin, Long fromageId, Long clientId) {
        if (dateDebut.isAfter(dateFin)) {
            throw new BusinessConflictException("La date de début doit précéder la date de fin");
        }
        List<Valeur> valeurs = valeurs(dateDebut, dateFin, fromageId, clientId);
        Accumulateur synthese = new Accumulateur();
        valeurs.forEach(synthese::add);
        return new RentabiliteAnalyseResponse(dateDebut, dateFin, synthese.toSynthese(),
                grouperFromages(valeurs),
                grouper(valeurs, Valeur::clientId, Valeur::clientNom),
                croiser(valeurs));
    }

    @Transactional(readOnly = true)
    public List<RentabiliteMensuelle> evolutionMensuelle(LocalDate dateDebut, LocalDate dateFin, Long fromageId) {
        Map<YearMonth, Accumulateur> groupes = new LinkedHashMap<>();
        valeurs(dateDebut, dateFin, fromageId, null).forEach(valeur ->
                groupes.computeIfAbsent(YearMonth.from(valeur.dateLivraison()), ignored -> new Accumulateur())
                        .add(valeur));
        return groupes.entrySet().stream()
                .map(entry -> new RentabiliteMensuelle(entry.getKey(), entry.getValue().toSynthese()))
                .toList();
    }

    private List<Valeur> valeurs(LocalDate dateDebut, LocalDate dateFin, Long fromageId, Long clientId) {
        List<LigneLivraison> livraisons = ligneLivraisonRepository.findLivreesPourRentabilite(
                dateDebut, dateFin, fromageId, clientId);
        Map<Long, CoutProductionLot> couts = new LinkedHashMap<>();
        coutProductionLotRepository.findByFabricationIdIn(livraisons.stream()
                .map(l -> l.getStockFromageFini().getLotAffinage().getFabrication().getId()).distinct().toList())
                .forEach(c -> couts.put(c.getFabrication().getId(), c));

        return livraisons.stream().map(l -> toValeur(l, couts)).toList();
    }

    private Valeur toValeur(LigneLivraison ligne, Map<Long, CoutProductionLot> couts) {
        Long fabricationId = ligne.getStockFromageFini().getLotAffinage().getFabrication().getId();
        CoutProductionLot cout = couts.get(fabricationId);
        if (cout == null) {
            throw new BusinessConflictException("Coût définitif absent pour le lot "
                    + ligne.getStockFromageFini().getLotAffinage().getFabrication().getNumeroLot());
        }
        int quantite = ligne.getQuantiteLivree();
        BigDecimal chiffreAffaires = ligne.getLigneCommande().getPrixUnitaire().multiply(BigDecimal.valueOf(quantite));
        BigDecimal coutAttribue = cout.getCoutParUnite().multiply(BigDecimal.valueOf(quantite));
        BigDecimal poidsUnitaire = cout.getFabrication().getPoidsTotalFromages()
                .divide(BigDecimal.valueOf(cout.getNombreUnitesFinales()), 8, RoundingMode.HALF_UP);
        BigDecimal poidsAttribue = poidsUnitaire.multiply(BigDecimal.valueOf(quantite));
        return new Valeur(
                ligne.getLivraison().getDateLivraison(),
                ligne.getLigneCommande().getFromage().getId(), ligne.getLigneCommande().getFromage().getNom(),
                ligne.getLivraison().getCommande().getClient().getId(),
                ligne.getLivraison().getCommande().getClient().getNom(), quantite, chiffreAffaires, coutAttribue,
                poidsAttribue);
    }

    private List<RentabiliteFromageResponse> grouperFromages(List<Valeur> valeurs) {
        Map<Long, Accumulateur> groupes = new LinkedHashMap<>();
        valeurs.forEach(v -> groupes.computeIfAbsent(v.fromageId(), ignored -> new Accumulateur()).add(v));
        return groupes.entrySet().stream().map(entry -> {
            Valeur premier = valeurs.stream().filter(v -> v.fromageId().equals(entry.getKey()))
                    .findFirst().orElseThrow();
            return entry.getValue().toFromage(entry.getKey(), premier.fromageNom());
        }).toList();
    }

    private List<RentabiliteGroupeResponse> grouper(List<Valeur> valeurs, Function<Valeur, Long> id,
            Function<Valeur, String> nom) {
        Map<Long, Accumulateur> groupes = new LinkedHashMap<>();
        valeurs.forEach(v -> groupes.computeIfAbsent(id.apply(v), ignored -> new Accumulateur()).add(v));
        return groupes.entrySet().stream().map(entry -> {
            Valeur premier = valeurs.stream().filter(v -> id.apply(v).equals(entry.getKey())).findFirst().orElseThrow();
            return entry.getValue().toGroupe(entry.getKey(), nom.apply(premier));
        }).toList();
    }

    private List<RentabiliteCroiseeResponse> croiser(List<Valeur> valeurs) {
        Map<String, Accumulateur> groupes = new LinkedHashMap<>();
        valeurs.forEach(v -> groupes.computeIfAbsent(v.fromageId() + ":" + v.clientId(), ignored -> new Accumulateur())
                .add(v));
        return groupes.entrySet().stream().map(entry -> {
            String[] ids = entry.getKey().split(":");
            Valeur v = valeurs.stream().filter(value -> value.fromageId().equals(Long.valueOf(ids[0]))
                    && value.clientId().equals(Long.valueOf(ids[1]))).findFirst().orElseThrow();
            Accumulateur a = entry.getValue();
            return new RentabiliteCroiseeResponse(v.fromageId(), v.fromageNom(), v.clientId(), v.clientNom(),
                    a.quantite, a.prixVenteMoyen(), scale(a.ca), scale(a.cout), scale(a.marge()),
                    taux(a.marge(), a.cout));
        }).toList();
    }

    public record RentabiliteMensuelle(YearMonth mois, RentabiliteSyntheseResponse synthese) {
    }

    private record Valeur(LocalDate dateLivraison, Long fromageId, String fromageNom, Long clientId, String clientNom,
            int quantite, BigDecimal chiffreAffaires, BigDecimal coutAttribue, BigDecimal poidsAttribue) {
    }

    private static class Accumulateur {
        private int quantite;
        private BigDecimal ca = BigDecimal.ZERO;
        private BigDecimal cout = BigDecimal.ZERO;
        private BigDecimal poids = BigDecimal.ZERO;

        void add(Valeur valeur) {
            quantite += valeur.quantite();
            ca = ca.add(valeur.chiffreAffaires());
            cout = cout.add(valeur.coutAttribue());
            poids = poids.add(valeur.poidsAttribue());
        }

        BigDecimal marge() { return ca.subtract(cout); }

        RentabiliteSyntheseResponse toSynthese() {
            return new RentabiliteSyntheseResponse(quantite, scale(ca), scale(cout), scale(marge()), taux(marge(), cout));
        }

        RentabiliteGroupeResponse toGroupe(Long id, String nom) {
            return new RentabiliteGroupeResponse(id, nom, quantite, scale(ca), scale(cout), scale(marge()),
                    taux(marge(), cout));
        }

        RentabiliteFromageResponse toFromage(Long id, String nom) {
            return new RentabiliteFromageResponse(id, nom, quantite, scale(ca), scale(cout),
                    coutProductionParKg(), scale(marge()), taux(marge(), cout));
        }

        BigDecimal prixVenteMoyen() {
            return quantite == 0 ? BigDecimal.ZERO.setScale(4) : divide(ca, BigDecimal.valueOf(quantite));
        }

        BigDecimal coutProductionParKg() {
            return poids.signum() == 0 ? BigDecimal.ZERO.setScale(4) : divide(cout, poids);
        }
    }

    private static BigDecimal taux(BigDecimal marge, BigDecimal cout) {
        if (cout.signum() == 0) {
            return BigDecimal.ZERO.setScale(2);
        }
        return marge.multiply(BigDecimal.valueOf(100)).divide(cout, 2, RoundingMode.HALF_UP);
    }

    private static BigDecimal scale(BigDecimal value) {
        return value.setScale(4, RoundingMode.HALF_UP);
    }

    private static BigDecimal divide(BigDecimal value, BigDecimal divisor) {
        return value.divide(divisor, 4, RoundingMode.HALF_UP);
    }
}
