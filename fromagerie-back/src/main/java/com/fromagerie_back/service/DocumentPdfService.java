package com.fromagerie_back.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.awt.Color;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
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
        List<String> lignes = lignesLivraisonRegroupees(livraison.getLignes());
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
        List<String> lignes = lignesFactureRegroupees(livraison.getLignes());
        return document("FACTURE", facture.getNumeroFacture(), commande,
                List.of("Commande : " + commande.getNumeroCommande(), "Date : " + facture.getDateFacture(),
                        "Mode de paiement : " + facture.getModePaiement(), "TOTAL : " + money(facture.getTotal()) + " EUR"),
                lignes, "facture-" + facture.getNumeroFacture() + ".pdf");
    }

    private Commande commande(Long id) {
        return commandes.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable : " + id));
    }

    static List<String> lignesLivraisonRegroupees(List<LigneLivraison> lignes) {
        return regrouperParFromage(lignes).stream()
                .map(item -> item.nom() + " | prevu " + item.quantitePrevue()
                        + " u | livre " + item.quantiteLivree() + " u")
                .toList();
    }

    static List<String> lignesFactureRegroupees(List<LigneLivraison> lignes) {
        return regrouperParFromage(lignes).stream().map(item -> {
            BigDecimal prixMoyen = item.quantiteLivree() == 0
                    ? BigDecimal.ZERO
                    : item.total().divide(BigDecimal.valueOf(item.quantiteLivree()), 4, java.math.RoundingMode.HALF_UP);
            return item.nom() + " | " + item.quantiteLivree() + " u x " + money(prixMoyen)
                    + " EUR (prix moyen) | " + money(item.total()) + " EUR";
        }).toList();
    }

    private static List<LigneFromage> regrouperParFromage(List<LigneLivraison> lignes) {
        Map<String, LigneFromage> groupes = new LinkedHashMap<>();
        for (LigneLivraison ligne : lignes) {
            String nom = ligne.getLigneCommande().getFromage().getNom();
            String cle = nom.trim().toLowerCase(Locale.ROOT);
            BigDecimal total = ligne.getLigneCommande().getPrixUnitaire()
                    .multiply(BigDecimal.valueOf(ligne.getQuantiteLivree()));
            groupes.merge(cle,
                    new LigneFromage(nom, ligne.getQuantitePrevue(), ligne.getQuantiteLivree(), total),
                    (actuelle, ajout) -> new LigneFromage(actuelle.nom(),
                            actuelle.quantitePrevue() + ajout.quantitePrevue(),
                            actuelle.quantiteLivree() + ajout.quantiteLivree(),
                            actuelle.total().add(ajout.total())));
        }
        return new ArrayList<>(groupes.values());
    }

    private record LigneFromage(String nom, int quantitePrevue, int quantiteLivree, BigDecimal total) {}

    private PdfDocument document(String titre, String numero, Commande commande, List<String> informations,
            List<String> lignes, String filename) {
        try (PDDocument pdf = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(pdf);
            writer.title(titre, numero);
            writer.section("DESTINATAIRE");
            writer.line("Client : " + commande.getClient().getNom(), true);
            if (commande.getClient().getAdresse() != null) writer.line("Adresse : " + commande.getClient().getAdresse(), false);
            if (commande.getClient().getTelephone() != null) writer.line("Telephone : " + commande.getClient().getTelephone(), false);
            writer.section("INFORMATIONS");
            for (String information : informations) writer.line(information, information.startsWith("TOTAL"));
            writer.section("DETAIL");
            if (lignes.isEmpty()) writer.line("Aucune ligne.", false);
            else for (String ligne : lignes) writer.detailRow(ligne);
            writer.signature("Signature du client");
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
            writer.meta("Fromagerie Artisanale de Salazie");
            writer.meta("Genere le " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            for (String ligne : lignes) {
                if (ligne.startsWith("## ")) {
                    writer.section(ligne.substring(3));
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

    public PdfDocument documentReglementaireAvecTable(String titre, String identification,
            String periode, List<String> entetes, List<List<String>> lignes, float[] largeurs,
            String messageVide, String filename) {
        try (PDDocument pdf = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(pdf);
            writer.title(titre, identification);
            writer.meta("Fromagerie Artisanale de Salazie");
            writer.meta("Genere le " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            writer.section("PERIODE");
            writer.line(periode, true);
            writer.section("LOTS");
            if (lignes.isEmpty()) writer.line(messageVide, false);
            else writer.table(entetes, lignes, largeurs);
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
        private static final int[] GREEN = {42, 72, 27};
        private static final int[] GOLD = {222, 178, 76};
        private static final int[] INK = {48, 45, 40};
        private static final int[] MUTED = {108, 101, 90};
        private static final int[] CREAM = {248, 245, 238};
        private static final int[] PALE_GREEN = {238, 243, 234};
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
            stream = new PDPageContentStream(document, page);
            drawFooter();
            y = page.getMediaBox().getHeight() - MARGIN;
        }
        private void title(String title, String number) throws IOException {
            float top = page.getMediaBox().getHeight() - 38;
            fillRect(36, top - 80, page.getMediaBox().getWidth() - 72, 80, CREAM);
            drawLogo(MARGIN, top - 59, 42);
            textAt("FROMAGERIE ARTISANALE", MARGIN + 56, top - 20, bold, 8, GREEN);
            textAt(safe(title), MARGIN + 56, top - 42, bold, 19, INK);
            textAt(safe(number), MARGIN + 56, top - 59, regular, 10, MUTED);
            fillRect(36, top - 83, page.getMediaBox().getWidth() - 72, 3, GOLD);
            y = top - 105;
        }
        private void meta(String value) throws IOException { text(value, false, MUTED); }
        private void section(String value) throws IOException {
            space(10);
            ensureSpace(30);
            fillRect(MARGIN, y - 17, page.getMediaBox().getWidth() - (2 * MARGIN), 22, PALE_GREEN);
            textAt(safe(value), MARGIN + 8, y - 11, bold, 9, GREEN);
            y -= 30;
        }
        private void line(String value, boolean strong) throws IOException {
            for (String part : wrap(safe(value), 88)) text(part, strong, strong ? INK : MUTED);
        }
        private void detailRow(String value) throws IOException {
            List<String> parts = wrap(safe(value), 82);
            float height = Math.max(28, parts.size() * 14 + 10);
            ensureSpace(height + 4);
            fillRect(MARGIN, y - height + 5, page.getMediaBox().getWidth() - (2 * MARGIN), height, CREAM);
            float lineY = y - 10;
            for (String part : parts) {
                textAt(part, MARGIN + 10, lineY, regular, 9.5f, INK);
                lineY -= 14;
            }
            y -= height + 4;
        }
        private void table(List<String> headers, List<List<String>> rows, float[] widths) throws IOException {
            if (headers.size() != widths.length) throw new IllegalArgumentException("Le nombre de colonnes du tableau est invalide");
            tableHeader(headers, widths);
            for (int index = 0; index < rows.size(); index++) tableRow(headers, rows.get(index), widths, index % 2 == 0);
        }
        private void tableHeader(List<String> headers, float[] widths) throws IOException {
            float height = 25;
            if (y - height < MARGIN + 20) newPage();
            float x = MARGIN;
            for (int index = 0; index < headers.size(); index++) {
                fillRect(x, y - height, widths[index], height, GREEN);
                strokeRect(x, y - height, widths[index], height, new int[] {255, 255, 255});
                List<String> parts = wrap(safe(headers.get(index)), Math.max(5, (int) (widths[index] / 4.3f)));
                float baseline = y - 10;
                for (String part : parts.subList(0, Math.min(2, parts.size()))) {
                    textAt(part, x + 4, baseline, bold, 7.2f, new int[] {255, 253, 249});
                    baseline -= 8;
                }
                x += widths[index];
            }
            y -= height;
        }
        private void tableRow(List<String> headers, List<String> cells, float[] widths, boolean alternate) throws IOException {
            List<List<String>> wrapped = new ArrayList<>();
            int maxLines = 1;
            for (int index = 0; index < widths.length; index++) {
                String value = index < cells.size() ? cells.get(index) : "";
                List<String> parts = wrap(safe(value), Math.max(4, (int) (widths[index] / 4.2f)));
                wrapped.add(parts);
                maxLines = Math.max(maxLines, parts.size());
            }
            float height = Math.max(24, maxLines * 10 + 10);
            if (y - height < MARGIN + 20) {
                newPage();
                tableHeader(headers, widths);
            }
            float x = MARGIN;
            for (int index = 0; index < widths.length; index++) {
                if (alternate) fillRect(x, y - height, widths[index], height, CREAM);
                strokeRect(x, y - height, widths[index], height, new int[] {218, 211, 198});
                float baseline = y - 12;
                for (String part : wrapped.get(index)) {
                    textAt(part, x + 4, baseline, regular, 7.4f, INK);
                    baseline -= 10;
                }
                x += widths[index];
            }
            y -= height;
        }
        private void signature(String label) throws IOException {
            space(14);
            ensureSpace(76);
            strokeRect(MARGIN, y - 62, 210, 62, new int[] {190, 185, 174});
            textAt(safe(label), MARGIN + 10, y - 16, bold, 9, MUTED);
            y -= 76;
        }
        private void text(String value, boolean strong, int[] color) throws IOException {
            ensureSpace(LEADING + 4);
            textAt(value, MARGIN, y, strong ? bold : regular, 10, color);
            y -= LEADING;
        }
        private void ensureSpace(float required) throws IOException { if (y - required < MARGIN + 20) newPage(); }
        private void textAt(String value, float x, float baseline, PDType1Font font, float size, int[] color) throws IOException {
            stream.setNonStrokingColor(new Color(color[0], color[1], color[2]));
            stream.beginText(); stream.setFont(font, size); stream.newLineAtOffset(x, baseline); stream.showText(value); stream.endText();
        }
        private void fillRect(float x, float bottom, float width, float height, int[] color) throws IOException {
            stream.setNonStrokingColor(new Color(color[0], color[1], color[2]));
            stream.addRect(x, bottom, width, height); stream.fill();
        }
        private void strokeRect(float x, float bottom, float width, float height, int[] color) throws IOException {
            stream.setStrokingColor(new Color(color[0], color[1], color[2]));
            stream.setLineWidth(0.7f); stream.addRect(x, bottom, width, height); stream.stroke();
        }
        private void drawLogo(float x, float bottom, float size) throws IOException {
            fillRect(x, bottom, size, size, GREEN);
            stream.setNonStrokingColor(new Color(GOLD[0], GOLD[1], GOLD[2]));
            stream.moveTo(x + 6, bottom + size - 14); stream.lineTo(x + size / 2, bottom + size - 5);
            stream.lineTo(x + size - 6, bottom + size - 14); stream.lineTo(x + size - 6, bottom + size - 20);
            stream.lineTo(x + 6, bottom + size - 20); stream.closePath(); stream.fill();
            textAt("FA", x + 11, bottom + 8, bold, 14, new int[] {255, 253, 249});
        }
        private void drawFooter() throws IOException {
            float width = page.getMediaBox().getWidth();
            stream.setStrokingColor(new Color(218, 211, 198)); stream.setLineWidth(0.5f);
            stream.moveTo(MARGIN, 42); stream.lineTo(width - MARGIN, 42); stream.stroke();
            textAt("FROMAGERIE ARTISANALE", MARGIN, 27, bold, 7, GREEN);
            textAt("Document genere par le systeme de gestion", width - 230, 27, regular, 7, MUTED);
        }
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
