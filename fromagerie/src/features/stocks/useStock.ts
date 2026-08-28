import { useEffect, useMemo, useState } from 'react';
import { stockApi, type EmplacementStock, type StockFromageFini } from './api/stockApi';
import type { SelectOption } from './components/StockFilters';
import type { StockItem } from './components/StockCard';

const daysFromToday = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export function useStock() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [groupBy, setGroupBy] = useState('type');
  const [stocks, setStocks] = useState<StockFromageFini[]>([]);
  const [emplacements, setEmplacements] = useState<EmplacementStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([stockApi.findStocks(), stockApi.findEmplacements()])
      .then(([stockData, emplacementData]) => {
        if (active) {
          setStocks(stockData);
          setEmplacements(emplacementData);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const locationOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'all', label: 'Tous les lieux' },
      ...emplacements
        .filter((emplacement) => emplacement.active)
        .map((emplacement) => ({
          value: String(emplacement.id),
          label: emplacement.nom,
        })),
    ],
    [emplacements],
  );

  const filteredItems = useMemo(() => {
    return stocks.filter((item) => {
      const code = item.numeroLotFabrication.toLowerCase();
      const name = item.fromageNom.toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = name.includes(query) || code.includes(query);

      const matchesLocation =
        locationFilter === 'all' || String(item.emplacementStockId) === locationFilter;

      return matchesSearch && matchesLocation;
    });
  }, [searchQuery, locationFilter, stocks]);

  const displayItems = useMemo<(StockItem & { locationValue?: string })[]>(() => {
    return filteredItems.map((item) => {
      const daysRemaining = daysFromToday(item.dateDurabilite);
      return ({
      id: String(item.id),
      name: item.fromageNom,
      code: item.numeroLotFabrication,
      quantity: item.quantitePhysique,
      unit: 'pièce',
      affinageEndDate: new Date(item.dateEntreeStock).toLocaleDateString('fr-FR'),
      dlcDate: new Date(item.dateDurabilite).toLocaleDateString('fr-FR'),
      daysBeforeDlc: daysRemaining,
      durabilityType: item.typeDateDurabilite,
      price: 0,
      isExpired: item.statut === 'DISPONIBLE' && daysRemaining < 0,
      isExpiringSoon: item.statut === 'DISPONIBLE' && daysRemaining >= 0 && daysRemaining <= 7,
      locationValue: String(item.emplacementStockId),
    });
    });
  }, [filteredItems]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, (StockItem & { locationValue?: string })[]> = {};

    displayItems.forEach((item, index) => {
      const source = filteredItems[index];
      let key = item.name;
      if (groupBy === 'location') {
        key = source.emplacementStockNom;
      } else if (groupBy === 'release_date') {
        key = item.affinageEndDate || 'Date inconnue';
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return groups;
  }, [displayItems, filteredItems, groupBy]);

  const expiringSoonItems = useMemo(
    () => stocks.filter((item) => {
      const days = daysFromToday(item.dateDurabilite);
      return days >= 0 && days <= 7 && item.statut === 'DISPONIBLE';
    }),
    [stocks],
  );

  const expiredItems = useMemo(
    () => stocks.filter((item) => item.quantitePhysique > 0 && daysFromToday(item.dateDurabilite) < 0),
    [stocks],
  );

  return {
    loading,
    searchQuery,
    setSearchQuery,
    locationFilter,
    setLocationFilter,
    groupBy,
    setGroupBy,
    locationOptions,
    groupedItems,
    hasResults: Object.keys(groupedItems).length > 0,
    stocks,
    expiringSoonItems,
    expiredItems,
    displayItems,
  };
}
