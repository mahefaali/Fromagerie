package com.fromagerie_back.service;

import static org.assertj.core.api.Assertions.assertThat;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import com.fromagerie_back.model.StatutStockFromageFini;
import com.fromagerie_back.model.StockFromageFini;

class StockCommercialPolicyTests {
    @Test
    void expiredStockIsExcludedButTodayAndFutureRemainSellable() {
        LocalDate today = LocalDate.of(2026, 8, 27);
        StockFromageFini expired = stock(today.minusDays(1));
        StockFromageFini current = stock(today);
        StockFromageFini future = stock(today.plusDays(1));
        assertThat(StockCommercialPolicy.filterSellable(List.of(expired, current, future), ignored -> 5, today))
                .containsExactly(current, future).doesNotContain(expired);
    }
    private StockFromageFini stock(LocalDate date) {
        StockFromageFini stock = new StockFromageFini();
        stock.setStatut(StatutStockFromageFini.DISPONIBLE);
        stock.setDateDurabilite(date);
        return stock;
    }
}
