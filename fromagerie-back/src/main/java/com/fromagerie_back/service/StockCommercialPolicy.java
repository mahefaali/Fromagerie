package com.fromagerie_back.service;

import java.time.LocalDate;
import java.util.List;
import java.util.function.ToIntFunction;
import com.fromagerie_back.model.StatutStockFromageFini;
import com.fromagerie_back.model.StockFromageFini;

final class StockCommercialPolicy {
    private StockCommercialPolicy() {}
    static boolean isVendable(StockFromageFini stock, int physical, LocalDate today) {
        return stock.getStatut() == StatutStockFromageFini.DISPONIBLE
                && physical > 0
                && !stock.getDateDurabilite().isBefore(today);
    }
    static List<StockFromageFini> filterSellable(List<StockFromageFini> stocks,
            ToIntFunction<StockFromageFini> physical, LocalDate today) {
        return stocks.stream().filter(stock -> isVendable(stock, physical.applyAsInt(stock), today)).toList();
    }
}
