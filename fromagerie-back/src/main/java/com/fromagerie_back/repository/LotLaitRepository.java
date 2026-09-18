package com.fromagerie_back.repository;
import java.util.*;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import com.fromagerie_back.model.LotLait;
public interface LotLaitRepository extends JpaRepository<LotLait,Long>{
 Optional<LotLait> findByNumeroLotIgnoreCase(String numeroLot); boolean existsByNumeroLotIgnoreCase(String numeroLot); List<LotLait> findAllByOrderByDateTraiteDesc();
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select l from LotLait l where l.id=:id") Optional<LotLait> findByIdForUpdate(@Param("id") Long id);
}
