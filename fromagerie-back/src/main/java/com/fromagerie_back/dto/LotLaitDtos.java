package com.fromagerie_back.dto;

import java.math.BigDecimal; import java.time.LocalDateTime; import java.util.List;
import com.fromagerie_back.model.TypeTraite;
import jakarta.validation.constraints.*;

public final class LotLaitDtos {
 private LotLaitDtos(){}
 public record Request(@NotBlank @Size(max=80) String numeroLot,@NotNull @PastOrPresent LocalDateTime dateTraite,@NotNull TypeTraite typeTraite,@NotNull @Positive BigDecimal quantite,@NotNull @DecimalMin(value="0.0000") @Digits(integer=15,fraction=4) BigDecimal coutUnitaire,@Size(max=4000) String observations){}
 public record Response(Long id,String numeroLot,LocalDateTime dateTraite,TypeTraite typeTraite,BigDecimal quantite,BigDecimal quantiteDisponible,BigDecimal coutUnitaire,String observations,List<AnalyseResponse> analyses){}
 public record AnalyseRequest(@NotNull @PastOrPresent LocalDateTime dateAnalyse,@NotBlank @Size(max=120) String typeAnalyse,@NotBlank @Size(max=255) String resultat,@Size(max=40) String unite,@Size(max=1000) String observation){}
 public record AnalyseResponse(Long id,LocalDateTime dateAnalyse,String typeAnalyse,String resultat,String unite,String observation){}
 public record UtilisationRequest(
   @NotNull(message="Le lot de lait doit être renseigné.") Long lotLaitId,
   @NotNull(message="La quantité utilisée doit être renseignée.")
   @Positive(message="La quantité utilisée doit être supérieure à 0.")
   @Digits(integer=15,fraction=4,message="La quantité utilisée dépasse la précision de 4 décimales supportée.") BigDecimal quantiteUtilisee){}
 public record UtilisationResponse(Long lotLaitId,String numeroLot,LocalDateTime dateTraite,TypeTraite typeTraite,BigDecimal quantiteLot,BigDecimal quantiteUtilisee,BigDecimal quantiteDisponible,List<AnalyseResponse> analyses){}
}
