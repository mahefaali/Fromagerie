import React from 'react';
import { type MainTab } from './../types/navigation';

interface MainNavigationTabsProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

export const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: 'stock', label: 'Stock' },
  { id: 'orders', label: 'Commande' },
  { id: 'unsold', label: 'Invendu' },
  { id: 'loss', label: 'Perte' },
];

export const MainNavigationTabs: React.FC<MainNavigationTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
      {MAIN_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              isActive
                ? 'bg-[#2d4a27] text-white shadow-sm'
                : 'bg-white/80 text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
};