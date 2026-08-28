package com.fromagerie_back.repository;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import com.fromagerie_back.model.*;
public interface CommandeRepository extends JpaRepository<Commande, Long> {
 @EntityGraph(attributePaths={"client","lignes","lignes.fromage","lignes.fromage"}) List<Commande> findAllByOrderByDateCommandeDescIdDesc();
 @EntityGraph(attributePaths={"client","lignes","lignes.fromage"}) @Query("select c from Commande c where c.id=:id") Optional<Commande> findWithDetailsById(@Param("id") Long id);
 @Query("select c from Commande c where c.id=:id") @Lock(LockModeType.PESSIMISTIC_WRITE) Optional<Commande> findByIdForUpdate(@Param("id") Long id);
}
