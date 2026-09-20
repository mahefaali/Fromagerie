package com.fromagerie_back.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fromagerie_back.exception.ResourceNotFoundException;
import com.fromagerie_back.exception.BusinessConflictException;
import com.fromagerie_back.model.Commande;
import com.fromagerie_back.model.Facture;
import com.fromagerie_back.model.LigneLivraison;
import com.fromagerie_back.model.Livraison;
import com.fromagerie_back.model.ReservationStock;
import com.fromagerie_back.model.StatutCommande;
import com.fromagerie_back.repository.CommandeRepository;
import com.fromagerie_back.repository.FactureRepository;
import com.fromagerie_back.repository.LivraisonRepository;
import com.fromagerie_back.repository.ReservationStockRepository;

@Service
public class DocumentPdfService {
    private final CommandeRepository commandes;
    private final LivraisonRepository livraisons;
    private final FactureRepository factures;
    private final ReservationStockRepository reservations;

    public DocumentPdfService(CommandeRepository commandes, LivraisonRepository livraisons,
            FactureRepository factures, ReservationStockRepository reservations) {
        this.commandes = commandes;
        this.livraisons = livraisons;
        this.factures = factures;
        this.reservations = reservations;
    }

    @Transactional(readOnly = true)
    public PdfDocument bonPreparation(Long commandeId) {
        Commande commande = commande(commandeId);
        if (commande.getStatut() == StatutCommande.BROUILLON || commande.getStatut() == StatutCommande.ANNULEE) {
            throw new BusinessConflictException("Le bon de préparation est disponible après confirmation de la commande");
        }
        List<String> lignes = new ArrayList<>();
        for (ReservationStock reservation : reservations.findByLigneCommandeCommandeId(commandeId)) {
            lignes.add(reservation.getLigneCommande().getFromage().getNom()
                    + " | " + reservation.getQuantiteReservee() + " u"
                    + " | lot " + reservation.getStockFromageFini().getLotAffinage().getFabrication().getNumeroLot()
                    + " | " + reservation.getStockFromageFini().getEmplacementStock().getNom());
        }
        return document("BON DE PREPARATION", commande.getNumeroCommande(), commande,
                List.of("Livraison souhaitee : " + commande.getDateLivraisonSouhaitee()), lignes,
                "bon-preparation-" + commande.getNumeroCommande() + ".pdf");
    }

    @Transactional(readOnly = true)
    public PdfDocument bonLivraison(Long commandeId) {
        Commande commande = commande(commandeId);
        Livraison livraison = livraisons.findByCommandeId(commandeId)
                .orElseThrow(() -> new ResourceNotFoundException("Livraison introuvable pour cette commande"));
        List<String> lignes = livraison.getLignes().stream().map(this::ligneLivraison).toList();
        String numero = livraison.getNumeroLivraison() != null ? livraison.getNumeroLivraison() : "BL-HIST-" + livraison.getId();
        List<String> informations = new ArrayList<>();
        informations.add("Commande : " + commande.getNumeroCommande());
        informations.add("Date de livraison : " + livraison.getDateLivraison());
        informations.add("Preparee par : " + livraison.getUtilisateur().getNom());
        if (livraison.getObservations() != null && !livraison.getObservations().isBlank()) {
            informations.add("Observations : " + livraison.getObservations());
        }
        return document("BON DE LIVRAISON", numero, commande, informations, lignes,
                "bon-livraison-" + numero + ".pdf");
    }

    @Transactional(readOnly = true)
    public PdfDocument facture(Long factureId) {
        Facture facture = factures.findById(factureId)
                .orElseThrow(() -> new ResourceNotFoundException("Facture introuvable : " + factureId));
        Commande commande = commande(facture.getCommande().getId());
        Livraison livraison = livraisons.findByCommandeId(commande.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Livraison introuvable pour cette facture"));
        List<String> lignes = livraison.getLignes().stream().map(this::ligneFacture).toList();
        return document("FACTURE", facture.getNumeroFacture(), commande,
                List.of("Commande : " + commande.getNumeroCommande(), "Date : " + facture.getDateFacture(),
                        "Mode de paiement : " + facture.getModePaiement(), "TOTAL : " + money(facture.getTotal()) + " EUR"),
                lignes, "facture-" + facture.getNumeroFacture() + ".pdf");
    }

    private Commande commande(Long id) {
        return commandes.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable : " + id));
    }

    private String ligneLivraison(LigneLivraison ligne) {
        return ligne.getLigneCommande().getFromage().getNom() + " | prevu " + ligne.getQuantitePrevue()
                + " u | livre " + ligne.getQuantiteLivree() + " u | lot "
                + ligne.getStockFromageFini().getLotAffinage().getFabrication().getNumeroLot();
    }

    private String ligneFacture(LigneLivraison ligne) {
        BigDecimal prix = ligne.getLigneCommande().getPrixUnitaire();
        BigDecimal total = prix.multiply(BigDecimal.valueOf(ligne.getQuantiteLivree()));
        return ligne.getLigneCommande().getFromage().getNom() + " | " + ligne.getQuantiteLivree()
                + " u x " + money(prix) + " EUR | " + money(total) + " EUR";
    }

    private PdfDocument document(String titre, String numero, Commande commande, List<String> informations,
            List<String> lignes, String filename) {
        try (PDDocument pdf = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(pdf);
            writer.title(titre, numero);
            writer.line("Fromagerie Artisanale", true);
            writer.space(8);
            writer.line("Client : " + commande.getClient().getNom(), true);
            if (commande.getClient().getAdresse() != null) writer.line("Adresse : " + commande.getClient().getAdresse(), false);
            if (commande.getClient().getTelephone() != null) writer.line("Telephone : " + commande.getClient().getTelephone(), false);
            writer.space(8);
            for (String information : informations) writer.line(information, false);
            writer.space(12);
            writer.line("DETAIL", true);
            writer.rule();
            if (lignes.isEmpty()) writer.line("Aucune ligne.", false);
            else for (String ligne : lignes) writer.line(ligne, false);
            writer.space(18);
            writer.line("Signature du client :", true);
            writer.close();
            pdf.save(output);
            return new PdfDocument(output.toByteArray(), filename);
        } catch (IOException exception) {
            throw new IllegalStateException("Impossible de generer le document PDF", exception);
        }
    }

    private static String money(BigDecimal value) { return value.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString(); }

    public record PdfDocument(byte[] content, String filename) {}

    public PdfDocument documentReglementaire(String titre, String identification, List<String> lignes,
            String filename) {
        try (PDDocument pdf = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(pdf);
            writer.title(titre, identification);
            writer.line("Fromagerie Salazie", true);
            writer.line("Genere le " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), false);
            writer.space(12);
            for (String ligne : lignes) {
                if (ligne.startsWith("## ")) {
                    writer.space(6);
                    writer.line(ligne.substring(3), true);
                    writer.rule();
                } else {
                    writer.line(ligne, false);
                }
            }
            writer.close();
            pdf.save(output);
            return new PdfDocument(output.toByteArray(), filename);
        } catch (IOException exception) {
            throw new IllegalStateException("Impossible de generer le document PDF", exception);
        }
    }

    private static final class PdfWriter {
        private static final float MARGIN = 52;
        private static final float LEADING = 16;
        private final PDDocument document;
        private final PDType1Font regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        private final PDType1Font bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
        private PDPage page;
        private PDPageContentStream stream;
        private float y;

        private PdfWriter(PDDocument document) throws IOException { this.document = document; newPage(); }
        private void newPage() throws IOException {
            if (stream != null) stream.close();
            page = new PDPage(PDRectangle.A4); document.addPage(page);
            stream = new PDPageContentStream(document, page); y = page.getMediaBox().getHeight() - MARGIN;
        }
        private void title(String title, String number) throws IOException {
            text(title, bold, 18); text(number, regular, 11); rule(); space(8);
        }
        private void line(String value, boolean strong) throws IOException {
            for (String part : wrap(safe(value), 88)) text(part, strong ? bold : regular, 10);
        }
        private void text(String value, PDType1Font font, float size) throws IOException {
            if (y < MARGIN + 30) newPage();
            stream.beginText(); stream.setFont(font, size); stream.newLineAtOffset(MARGIN, y); stream.showText(value); stream.endText(); y -= LEADING;
        }
        private void rule() throws IOException { stream.moveTo(MARGIN, y); stream.lineTo(page.getMediaBox().getWidth() - MARGIN, y); stream.stroke(); y -= 10; }
        private void space(float amount) { y -= amount; }
        private void close() throws IOException { if (stream != null) stream.close(); }
        private static List<String> wrap(String text, int max) {
            List<String> result = new ArrayList<>(); String remaining = text;
            while (remaining.length() > max) { int cut = remaining.lastIndexOf(' ', max); if (cut < 1) cut = max; result.add(remaining.substring(0, cut)); remaining = remaining.substring(cut).trim(); }
            result.add(remaining); return result;
        }
        private static String safe(String value) {
            String normalized = value.replace('’', '\'').replace('–', '-').replace('—', '-').replace("€", "EUR");
            StringBuilder result = new StringBuilder(normalized.length());
            normalized.codePoints().forEach(code -> result.append(code <= 255 ? (char) code : '?'));
            return result.toString();
        }
    }
}
