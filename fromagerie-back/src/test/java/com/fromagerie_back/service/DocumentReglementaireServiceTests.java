package com.fromagerie_back.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.fromagerie_back.dto.AffinageDetailResponse;
import com.fromagerie_back.dto.PlacementAffinageResponse;
import com.fromagerie_back.dto.SoinAffinageResponse;
import com.fromagerie_back.dto.TracabiliteDescendanteResponse;
import com.fromagerie_back.exception.BusinessValidationException;
import com.fromagerie_back.exception.ResourceNotFoundException;
import com.fromagerie_back.model.*;
import com.fromagerie_back.repository.*;
import com.fromagerie_back.service.DocumentPdfService.PdfDocument;

class DocumentReglementaireServiceTests {
    private FabricationRepository fabrications; private UtilisationLotLaitRepository usages;
    private LotLaitRepository lots; private AnalyseLaitRepository analyses; private StockFromageFiniRepository stocks;
    private TracabiliteService tracabilite; private AffinageService affinage; private DocumentReglementaireService service;

    @BeforeEach void setUp() {
        fabrications=mock(FabricationRepository.class); usages=mock(UtilisationLotLaitRepository.class);
        lots=mock(LotLaitRepository.class); analyses=mock(AnalyseLaitRepository.class); stocks=mock(StockFromageFiniRepository.class);
        tracabilite=mock(TracabiliteService.class); affinage=mock(AffinageService.class);
        DocumentPdfService pdf=new DocumentPdfService(mock(CommandeRepository.class),mock(LivraisonRepository.class),mock(FactureRepository.class),mock(ReservationStockRepository.class));
        service=new DocumentReglementaireService(fabrications,usages,lots,analyses,stocks,tracabilite,affinage,pdf);
    }

    @Test void genereUneFicheFabricationValideAvecDonneesReellesOperateurEtLotLait() throws Exception {
        Fabrication f=fabrication(); when(fabrications.findByIdWithDetails(1L)).thenReturn(Optional.of(f));
        UtilisationLotLait usage=mock(UtilisationLotLait.class); LotLait lot=lotLait(); when(usage.getLotLait()).thenReturn(lot); when(usage.getQuantiteUtilisee()).thenReturn(new BigDecimal("87.5"));
        when(usages.findByFabricationIdOrderByLotLaitDateTraiteAsc(1L)).thenReturn(List.of(usage));
        PdfDocument result=service.ficheFabrication(1L); String text=text(result);
        assertThat(new String(result.content(), java.nio.charset.StandardCharsets.ISO_8859_1)).startsWith("%PDF"); assertThat(result.filename()).isEqualTo("fabrication-FAB-2026-0098.pdf");
        assertThat(text).contains("Présure réelle B", "Ferment réel B", "LAIT-2026-001", "Alice", "Fromages produits : 50");
    }

    @Test void ressourceFabricationInexistante() {
        assertThatThrownBy(()->service.ficheFabrication(99L)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test void genereFicheAffinageAvecSoinsPlacementsEtSortieReelle() throws Exception {
        PlacementAffinageResponse placement=new PlacementAffinageResponse(1L,1L,"Cave Nord",2L,2,3L,3,4,13,10,LocalDateTime.of(2026,9,2,8,0),null,true);
        SoinAffinageResponse soin=new SoinAffinageResponse(1L,TypeSoinAffinage.RETOURNEMENT,LocalDateTime.of(2026,9,3,9,0),"RAS","Souple",1L,"Alice");
        AffinageDetailResponse detail=new AffinageDetailResponse(2L,1L,"FAB-2026-0098","Tomme","Recette A","Alice",LocalDate.of(2026,9,2),LocalDate.of(2026,9,20),0,StatutLotAffinage.EN_AFFINAGE,50,10,40,java.util.Set.of("Cave Nord"),"Souple",List.of(placement),List.of(),List.of(soin));
        when(affinage.findById(2L)).thenReturn(detail); StockFromageFini stock=mock(StockFromageFini.class); when(stock.getDateEntreeStock()).thenReturn(LocalDate.of(2026,9,21)); when(stocks.findByLotAffinageId(2L)).thenReturn(Optional.of(stock));
        PdfDocument result=service.ficheAffinage(2L); String text=text(result);
        assertThat(result.filename()).isEqualTo("affinage-FAB-2026-0098.pdf");
        assertThat(text).contains("Cave Nord", "positions 4-13", "RETOURNEMENT", "Alice", "2026-09-21");
    }

    @Test void genereAnalysesLaitAvecPlusieursAnalyses() throws Exception {
        LotLait lot=lotLait(); when(lots.findById(3L)).thenReturn(Optional.of(lot));
        List<AnalyseLait> resultats=List.of(analyse("pH","6.7",""),analyse("Acidité","18","°D"));
        when(analyses.findByLotLaitIdOrderByDateAnalyseDesc(3L)).thenReturn(resultats);
        PdfDocument result=service.analysesLait(3L); String text=text(result);
        assertThat(result.filename()).isEqualTo("analyses-lait-LAIT-2026-001.pdf"); assertThat(text).contains("pH", "6.7", "Acidité", "18");
    }

    @Test void lotSansAnalyseProduitUnPdfValide() throws Exception {
        LotLait lot=lotLait();
        when(lots.findById(3L)).thenReturn(Optional.of(lot)); when(analyses.findByLotLaitIdOrderByDateAnalyseDesc(3L)).thenReturn(List.of());
        PdfDocument result=service.analysesLait(3L);
        assertThat(text(result)).contains("Aucune analyse enregistrée pour ce lot de lait"); assertThat(result.content()).isNotEmpty();
    }

    @Test void lotLaitInexistant() { assertThatThrownBy(()->service.analysesLait(99L)).isInstanceOf(ResourceNotFoundException.class); }

    @Test void registrePeriodeAvecPlusieursFabricationsEtSynthese() throws Exception {
        Fabrication first=fabrication(); Fabrication second=fabrication(); when(second.getNumeroLot()).thenReturn("FAB-2026-0099");
        when(fabrications.findForTraceabilityRegister(LocalDate.of(2026,9,1).atStartOfDay(),LocalDate.of(2026,10,1).atStartOfDay())).thenReturn(List.of(first,second));
        TracabiliteDescendanteResponse trace=new TracabiliteDescendanteResponse(1L,"x","Tomme",LocalDateTime.now(),50,30,20,18,2,List.of(),List.of(),List.of());
        when(tracabilite.byNumeroLotDescendant("FAB-2026-0098")).thenReturn(trace); when(tracabilite.byNumeroLotDescendant("FAB-2026-0099")).thenReturn(trace);
        PdfDocument result=service.registre(LocalDate.of(2026,9,1),LocalDate.of(2026,9,30)); String text=text(result);
        assertThat(result.filename()).isEqualTo("registre-tracabilite-2026-09-01-2026-09-30.pdf");
        assertThat(text).contains("FAB-2026-0098", "FAB-2026-0099", "Produit : 50", "Livré : 30", "Perdu : 2", "Disponible : 18");
    }

    @Test void registreVideProduitUnPdfValide() throws Exception {
        PdfDocument result=service.registre(LocalDate.of(2026,9,1),LocalDate.of(2026,9,30));
        assertThat(text(result)).contains("Aucune donnée ne correspond à cette période");
    }

    @Test void periodeInvalideEstRefusee() {
        assertThatThrownBy(()->service.registre(LocalDate.of(2026,10,1),LocalDate.of(2026,9,1))).isInstanceOf(BusinessValidationException.class);
    }

    private Fabrication fabrication() {
        Fabrication f=mock(Fabrication.class); Recette r=mock(Recette.class); Fromage fromage=mock(Fromage.class); Utilisateur user=mock(Utilisateur.class);
        when(f.getId()).thenReturn(1L); when(f.getNumeroLot()).thenReturn("FAB-2026-0098"); when(f.getDateHeureDebut()).thenReturn(LocalDateTime.of(2026,9,1,8,0)); when(f.getRecette()).thenReturn(r);
        when(r.getFromage()).thenReturn(fromage); when(fromage.getNom()).thenReturn("Tomme"); when(r.getNom()).thenReturn("Recette A"); when(r.getNumeroVersion()).thenReturn(2);
        when(f.getOperateur()).thenReturn(user); when(user.getNom()).thenReturn("Alice"); when(f.getQuantiteLait()).thenReturn(new BigDecimal("100")); when(f.getTemperatureLait()).thenReturn(new BigDecimal("6"));
        when(f.getTypePresure()).thenReturn("Présure réelle B"); when(f.getQuantitePresure()).thenReturn(new BigDecimal("20")); when(f.getTypeFerments()).thenReturn("Ferment réel B"); when(f.getQuantiteFerments()).thenReturn(new BigDecimal("3"));
        when(f.getTemperatureChauffage()).thenReturn(new BigDecimal("32")); when(f.getDureeChauffageMinutes()).thenReturn(45); when(f.getTemperatureMiseEnMoule()).thenReturn(new BigDecimal("28")); when(f.getDureeEgouttageMinutes()).thenReturn(120);
        when(f.getNombreFromages()).thenReturn(50); when(f.getPoidsTotalFromages()).thenReturn(new BigDecimal("25")); when(f.getRendement()).thenReturn(new BigDecimal("25")); when(f.getObservations()).thenReturn("Conforme"); return f;
    }
    private LotLait lotLait(){LotLait l=mock(LotLait.class);when(l.getNumeroLot()).thenReturn("LAIT-2026-001");when(l.getDateTraite()).thenReturn(LocalDateTime.of(2026,9,1,6,0));when(l.getTypeTraite()).thenReturn(TypeTraite.MATIN);when(l.getQuantite()).thenReturn(new BigDecimal("120"));return l;}
    private AnalyseLait analyse(String type,String resultat,String unite){AnalyseLait a=mock(AnalyseLait.class);when(a.getDateAnalyse()).thenReturn(LocalDateTime.of(2026,9,1,7,0));when(a.getTypeAnalyse()).thenReturn(type);when(a.getResultat()).thenReturn(resultat);when(a.getUnite()).thenReturn(unite);return a;}
    private String text(PdfDocument document)throws IOException{try(var pdf=Loader.loadPDF(document.content())){return new PDFTextStripper().getText(pdf);}}
}
