package com.fromagerie_back.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.fromagerie_back.model.Fromage;
import com.fromagerie_back.model.LigneCommande;
import com.fromagerie_back.model.LigneLivraison;

class DocumentPdfServiceTests {

    @Test
    void regroupeUnMemeFromageDansLeBonDeLivraisonSansAfficherLesLots() {
        List<String> lignes = DocumentPdfService.lignesLivraisonRegroupees(List.of(
                ligne("Tomme", 5, 4, "8.00"),
                ligne("Tomme", 3, 3, "8.00"),
                ligne("Bleu", 2, 2, "10.00")));

        assertThat(lignes).containsExactly(
                "Tomme | prevu 8 u | livre 7 u",
                "Bleu | prevu 2 u | livre 2 u");
        assertThat(lignes).noneMatch(ligne -> ligne.contains("lot"));
    }

    @Test
    void regroupeUnMemeFromageDansLaFactureEtConserveLeMontantExact() {
        List<String> lignes = DocumentPdfService.lignesFactureRegroupees(List.of(
                ligne("Tomme", 2, 2, "8.00"),
                ligne("Tomme", 3, 3, "10.00")));

        assertThat(lignes).containsExactly(
                "Tomme | 5 u x 9.20 EUR (prix moyen) | 46.00 EUR");
    }

    private LigneLivraison ligne(String fromageNom, int prevue, int livree, String prixUnitaire) {
        Fromage fromage = mock(Fromage.class);
        when(fromage.getNom()).thenReturn(fromageNom);
        LigneCommande commande = mock(LigneCommande.class);
        when(commande.getFromage()).thenReturn(fromage);
        when(commande.getPrixUnitaire()).thenReturn(new BigDecimal(prixUnitaire));
        LigneLivraison ligne = mock(LigneLivraison.class);
        when(ligne.getLigneCommande()).thenReturn(commande);
        when(ligne.getQuantitePrevue()).thenReturn(prevue);
        when(ligne.getQuantiteLivree()).thenReturn(livree);
        return ligne;
    }
}
