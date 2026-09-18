package com.fromagerie_back.repository;
import java.math.BigDecimal; import java.util.*;
import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param;
import com.fromagerie_back.model.UtilisationLotLait;
public interface UtilisationLotLaitRepository extends JpaRepository<UtilisationLotLait,Long>{
 @EntityGraph(attributePaths={"lotLait"}) List<UtilisationLotLait> findByFabricationIdOrderByLotLaitDateTraiteAsc(Long id);
 @Query("select coalesce(sum(u.quantiteUtilisee),0) from UtilisationLotLait u where u.lotLait.id=:lotId and (:fabricationId is null or u.fabrication.id<>:fabricationId)") BigDecimal usedOutside(@Param("lotId") Long lotId,@Param("fabricationId") Long fabricationId);
 void deleteByFabricationId(Long id);
}
