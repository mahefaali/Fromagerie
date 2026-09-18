package com.fromagerie_back.repository;
import java.util.*; import org.springframework.data.jpa.repository.JpaRepository; import com.fromagerie_back.model.AnalyseLait;
public interface AnalyseLaitRepository extends JpaRepository<AnalyseLait,Long>{ List<AnalyseLait> findByLotLaitIdOrderByDateAnalyseDesc(Long id); }
