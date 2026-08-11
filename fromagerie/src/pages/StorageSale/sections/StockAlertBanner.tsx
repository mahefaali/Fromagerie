import React from 'react';
import { Alert } from '../../../components/ui/alert';

export interface ExpiringCheese {
  id: string;
  name: string;
  code: string;
  daysRemaining: number;
}

interface StockAlertBannerProps {
  items: ExpiringCheese[];
}

export const StockAlertBanner: React.FC<StockAlertBannerProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      <Alert>
        <span className="font-bold">
          {items.length} fromage(s) arrivent bientôt en fin de durabilité (≤ 7 jours).
        </span>
        <div className="text-gray-700 mt-1">
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              {item.name} ({item.code}) — {item.daysRemaining} j
              {index < items.length - 1 ? ' — ' : ''}
            </React.Fragment>
          ))}
        </div>
      </Alert>
    </div>
  );
};