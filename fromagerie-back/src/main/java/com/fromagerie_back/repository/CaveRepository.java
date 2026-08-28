package com.fromagerie_back.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import com.fromagerie_back.model.Cave;

public interface CaveRepository extends JpaRepository<Cave, Long> {
    List<Cave> findAllByOrderByNomAsc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Cave c WHERE c.id = :id")
    Optional<Cave> findByIdForUpdate(@Param("id") Long id);
}
