package com.fromagerie_back.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fromagerie_back.dto.AffinageDetailResponse;
import com.fromagerie_back.dto.PlacementAffinageResponse;
import com.fromagerie_back.dto.SoinAffinageResponse;
import com.fromagerie_back.dto.TracabiliteDescendanteResponse;
import com.fromagerie_back.exception.BusinessValidationException;
import com.fromagerie_back.exception.ResourceNotFoundException;
import com.fromagerie_back.model.AnalyseLait;
import com.fromagerie_back.model.Fabrication;
import com.fromagerie_back.model.LotLait;
import com.fromagerie_back.model.UtilisationLotLait;
import com.fromagerie_back.repository.AnalyseLaitRepository;
import com.fromagerie_back.repository.FabricationRepository;
import com.fromagerie_back.repository.LotLaitRepository;
import com.fromagerie_back.repository.StockFromageFiniRepository;
import com.fromagerie_back.repository.UtilisationLotLaitRepository;
import com.fromagerie_back.service.DocumentPdfService.PdfDocument;

@Service
public class DocumentReglementaireService {
    private final FabricationRepository fabrications;
    private final UtilisationLotLaitRepository utilisationsLait;
    private final LotLaitRepository lotsLait;
    private final AnalyseLaitRepository analyses;
    private final StockFromageFiniRepository stocks;
    private final TracabiliteService tracabilite;
    private final AffinageService affinage;
    private final DocumentPdfService pdf;

    public DocumentReglementaireService(FabricationRepository fabrications,
            UtilisationLotLaitRepository utilisationsLait, LotLaitRepository lotsLait,
            AnalyseLaitRepository analyses, StockFromageFiniRepository stocks,
            TracabiliteService tracabilite, AffinageService affinage, DocumentPdfService pdf) {
        this.fabrications = fabrications;
        this.utilisationsLait = utilisationsLait;
        this.lotsLait = lotsLait;
        this.analyses = analyses;
        this.stocks = stocks;
        this.tracabilite = tracabilite;
        this.affinage = affinage;
        this.pdf = pdf;
    }

    @Transactional(readOnly = true)
    public PdfDocument registre(LocalDate debut, LocalDate fin) {
        if (debut == null || fin == null) throw new BusinessValidationException("Les dates de début et de fin sont obligatoires");
        if (debut.isAfter(fin)) throw new BusinessValidationException("La date de début doit précéder ou égaler la date de fin");
        List<Fabrication> items = fabrications.findForTraceabilityRegister(debut.atStartOfDay(), fin.plusDays(1).atStartOfDay());
        List<List<String>> lignes = new ArrayList<>();
        for (Fabrication fabrication : items) {
            TracabiliteDescendanteResponse trace = tracabilite.byNumeroLotDescendant(fabrication.getNumeroLot());
            List<UtilisationLotLait> usages = utilisationsLait.findByFabricationIdOrderByLotLaitDateTraiteAsc(fabrication.getId());
            String lots = usages.isEmpty() ? "Non détaillés" : usages.stream()
                    .map(u -> u.getLotLait().getNumeroLot() + " (" + decimal(u.getQuantiteUtilisee()) + " L)")
                    .reduce((a, b) -> a + ", " + b).orElse("Non détaillés");
            lignes.add(List.of(
                    fabrication.getNumeroLot(),
                    fabrication.getDateHeureDebut().toLocalDate().toString(),
                    fabrication.getRecette().getFromage().getNom(),
                    lots,
                    trace.quantiteProduite() + " u",
                    trace.quantiteLivree() + " u",
                    trace.quantitePerdue() + " u",
                    trace.quantiteDisponible() + " u"));
        }
        return pdf.documentReglementaireAvecTable(
                "REGISTRE DE TRACABILITE",
                debut + " - " + fin,
                "Du " + debut + " au " + fin,
                List.of("Lot fabrication", "Date", "Fromage", "Lots de lait", "Produit", "Livré", "Perdu", "Disponible"),
                lignes,
                new float[] {76, 54, 67, 112, 43, 40, 40, 55},
                "Aucune donnée ne correspond à cette période.",
                "registre-tracabilite-" + debut + "-" + fin + ".pdf");
    }

    @Transactional(readOnly = true)
    public PdfDocument ficheFabrication(Long id) {
        Fabrication f = fabrications.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fabrication introuvable : " + id));
        List<UtilisationLotLait> usages = utilisationsLait.findByFabricationIdOrderByLotLaitDateTraiteAsc(id);
        List<String> lignes = new ArrayList<>();
        lignes.add("## IDENTIFICATION");
        lignes.add("Lot : " + f.getNumeroLot()); lignes.add("Date et heure : " + f.getDateHeureDebut());
        lignes.add("Fromage : " + f.getRecette().getFromage().getNom());
        lignes.add("Recette : " + f.getRecette().getNom() + " | version " + value(f.getRecette().getNumeroVersion()));
        lignes.add("Opérateur : " + (f.getOperateur() == null ? "Non renseigné" : f.getOperateur().getNom()));
        lignes.add("## LAIT UTILISE");
        if (usages.isEmpty()) lignes.add("Lots détaillés non disponibles (donnée historique).");
        for (UtilisationLotLait usage : usages) lignes.add(usage.getLotLait().getNumeroLot() + " : " + decimal(usage.getQuantiteUtilisee()) + " L");
        lignes.add("Quantité totale réelle : " + decimal(f.getQuantiteLait()) + " L");
        lignes.add("Température du lait : " + decimal(f.getTemperatureLait()) + " °C");
        lignes.add("## PARAMETRES REELS");
        lignes.add("Présure : " + f.getTypePresure() + " | quantité : " + decimal(f.getQuantitePresure()));
        lignes.add("Ferments : " + f.getTypeFerments() + " | quantité : " + decimal(f.getQuantiteFerments()));
        lignes.add("Chauffage : " + decimal(f.getTemperatureChauffage()) + " °C pendant " + f.getDureeChauffageMinutes() + " min");
        lignes.add("Mise en moule : " + decimal(f.getTemperatureMiseEnMoule()) + " °C");
        lignes.add("Égouttage : " + f.getDureeEgouttageMinutes() + " min");
        lignes.add("## RESULTATS");
        lignes.add("Fromages produits : " + f.getNombreFromages() + " u");
        lignes.add("Poids total : " + decimal(f.getPoidsTotalFromages()) + " kg");
        lignes.add("Rendement : " + decimal(f.getRendement()) + " %");
        lignes.add("Observations : " + value(f.getObservations()));
        return pdf.documentReglementaire("FICHE DE FABRICATION", f.getNumeroLot(), lignes,
                "fabrication-" + safeFilename(f.getNumeroLot()) + ".pdf");
    }

    @Transactional(readOnly = true)
    public PdfDocument ficheAffinage(Long id) {
        AffinageDetailResponse lot = affinage.findById(id);
        List<String> lignes = new ArrayList<>();
        lignes.add("## IDENTIFICATION"); lignes.add("Lot : " + lot.numeroLot());
        lignes.add("Fromage : " + lot.fromageNom()); lignes.add("Fabrication d'origine : " + lot.fabricationId());
        lignes.add("## DATES"); lignes.add("Entrée en affinage : " + lot.dateMiseEnCave());
        lignes.add("Sortie prévue : " + lot.dateSortiePrevue());
        lignes.add("Sortie réelle : " + stocks.findByLotAffinageId(id).map(s -> s.getDateEntreeStock().toString()).orElse("Pas encore sortie"));
        lignes.add("## PLACEMENTS ET DEPLACEMENTS");
        List<PlacementAffinageResponse> placements = new ArrayList<>(lot.historiquePlacements()); placements.addAll(lot.placementsActifs());
        if (placements.isEmpty()) lignes.add("Aucun placement enregistré.");
        for (PlacementAffinageResponse p : placements) lignes.add(p.caveNom() + " | étagère " + p.etagereNumero()
                + " | rangée " + p.rangeeNumero() + " | positions " + p.positionDebut() + "-" + p.positionFin()
                + " | du " + p.dateDebut() + " au " + (p.dateFin() == null ? "actuel" : p.dateFin()));
        lignes.add("## SOINS D'AFFINAGE");
        if (lot.soins().isEmpty()) lignes.add("Aucun soin enregistré.");
        for (SoinAffinageResponse soin : lot.soins()) lignes.add(soin.dateHeure() + " | " + soin.type()
                + " | opérateur " + soin.utilisateurNom() + " | observation : " + value(soin.observation())
                + " | état croûte : " + value(soin.etatCroute()));
        return pdf.documentReglementaire("FICHE D'AFFINAGE", lot.numeroLot(), lignes,
                "affinage-" + safeFilename(lot.numeroLot()) + ".pdf");
    }

    @Transactional(readOnly = true)
    public PdfDocument analysesLait(Long id) {
        LotLait lot = lotsLait.findById(id).orElseThrow(() -> new ResourceNotFoundException("Lot de lait introuvable : " + id));
        List<AnalyseLait> items = analyses.findByLotLaitIdOrderByDateAnalyseDesc(id);
        List<String> lignes = new ArrayList<>();
        lignes.add("## LOT DE LAIT"); lignes.add("Numéro : " + lot.getNumeroLot());
        lignes.add("Traite : " + lot.getDateTraite() + " | " + lot.getTypeTraite());
        lignes.add("Quantité : " + decimal(lot.getQuantite()) + " L");
        lignes.add("## ANALYSES");
        if (items.isEmpty()) lignes.add("Aucune analyse enregistrée pour ce lot de lait.");
        for (AnalyseLait analyse : items) lignes.add(analyse.getDateAnalyse() + " | " + analyse.getTypeAnalyse()
                + " | résultat : " + analyse.getResultat() + (analyse.getUnite() == null ? "" : " " + analyse.getUnite())
                + " | observation : " + value(analyse.getObservation()));
        return pdf.documentReglementaire("ANALYSES DE LAIT", lot.getNumeroLot(), lignes,
                "analyses-lait-" + safeFilename(lot.getNumeroLot()) + ".pdf");
    }

    private static String decimal(BigDecimal value) { return value == null ? "Non renseigné" : value.stripTrailingZeros().toPlainString(); }
    private static String value(Object value) { return value == null || value.toString().isBlank() ? "Non renseigné" : value.toString(); }
    private static String safeFilename(String value) { return value.replaceAll("[^A-Za-z0-9._-]", "-"); }
}
