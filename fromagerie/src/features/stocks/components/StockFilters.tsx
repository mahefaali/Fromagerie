import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { SearchInput } from '../../../components/ui/search-input';

export interface SelectOption {
  value: string;
  label: string;
}

interface StockFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  locationFilter: string;
  onLocationChange: (value: string) => void;
  groupBy: string;
  onGroupByChange: (value: string) => void;
  locationOptions: SelectOption[];
  groupByOptions: SelectOption[];
}

export const StockFilters: React.FC<StockFiltersProps> = ({
  searchQuery,
  onSearchChange,
  locationFilter,
  onLocationChange,
  groupBy,
  onGroupByChange,
  locationOptions,
  groupByOptions,
}) => {
  return (
    <div className="mb-5 flex flex-col items-stretch gap-2.5 lg:flex-row lg:items-center">
      <div className="flex-1 w-full">
        <SearchInput
          placeholder="Rechercher un fromage ou un lot..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex w-full items-center gap-2.5 lg:w-auto">
        {/* Filtre par localisation */}
        <Select value={locationFilter} onValueChange={onLocationChange}>
          <SelectTrigger className="w-full min-w-0 bg-white border-[#e8e2d5] lg:w-[190px]">
            <SelectValue placeholder="Choisir un lieu" />
          </SelectTrigger>
          <SelectContent>
            {locationOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtre par groupement */}
        <Select value={groupBy} onValueChange={onGroupByChange}>
          <SelectTrigger className="w-full min-w-0 bg-white border-[#e8e2d5] lg:w-[200px]">
            <SelectValue placeholder="Grouper par..." />
          </SelectTrigger>
          <SelectContent>
            {groupByOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
