package com.fromagerie_back.dto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import com.fromagerie_back.model.ModePaiement;
public final class CommandeRequests {
 private CommandeRequests() {}
 public record ClientRequest(@NotBlank String nom, @NotNull com.fromagerie_back.model.TypeClient typeClient, String telephone, String adresse, Boolean actif) {}
 public record LigneRequest(@NotNull Long fromageId, @NotNull @Positive Integer quantiteCommandee, @NotNull @DecimalMin("0.00") BigDecimal prixUnitaire) {}
 public record CommandeRequest(@NotNull Long clientId, @NotNull @FutureOrPresent LocalDate dateLivraisonSouhaitee, String observations, @NotEmpty List<@Valid LigneRequest> lignes) {}
 public record LivraisonLigneRequest(@NotNull Long reservationId, @NotNull @Min(0) Integer quantiteLivree) {}
 public record LivraisonRequest(@NotNull LocalDate dateLivraison, String observations, @NotEmpty List<@Valid LivraisonLigneRequest> lignes) {}
 public record FactureRequest(@NotNull ModePaiement modePaiement) {}
}
