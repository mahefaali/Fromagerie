import { useState, useMemo } from 'react';
import { MOCK_STOCK_ITEMS, LOCATION_OPTIONS } from './stock.constants';

export function useStock() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [groupBy, setGroupBy] = useState('type');

  const filteredItems = useMemo(() => {
    return MOCK_STOCK_ITEMS.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLocation =
        locationFilter === 'all' || item.locationValue === locationFilter;

      return matchesSearch && matchesLocation;
    });
  }, [searchQuery, locationFilter]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof filteredItems> = {};

    filteredItems.forEach((item) => {
      let key = item.name;
      if (groupBy === 'location') {
        key = LOCATION_OPTIONS.find((l) => l.value === item.locationValue)?.label || 'Autre';
      } else if (groupBy === 'release_date') {
        key = item.affinageEndDate || 'Date inconnue';
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return groups;
  }, [filteredItems, groupBy]);

  return {
    searchQuery,
    setSearchQuery,
    locationFilter,
    setLocationFilter,
    groupBy,
    setGroupBy,
    groupedItems,
    hasResults: Object.keys(groupedItems).length > 0,
  };
}