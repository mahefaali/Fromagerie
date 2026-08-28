package com.fromagerie_back.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.fromagerie_back.model.Client;
public interface ClientRepository extends JpaRepository<Client, Long> {}
