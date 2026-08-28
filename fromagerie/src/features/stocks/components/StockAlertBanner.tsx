import React from 'react';
import { Alert } from '../../../components/ui/alert';

export interface ExpiringCheese {
  id: string;
  name: string;
  code: string;
  daysRemaining: number;
  durabilityType: 'DLC' | 'DDM';
}

interface StockAlertBannerProps {
  items: ExpiringCheese[];
}

export const StockAlertBanner: React.FC<StockAlertBannerProps> = ({ items }) => {
  if (items.length === 0) return null;

  const expiredCount = items.filter((item) => item.daysRemaining < 0).length;
  const expiringCount = items.length - expiredCount;

  return (
    <div className="mb-6">
      <Alert>
        <span className="font-bold">
          {expiredCount > 0 && `${expiredCount} lot(s) avec une date dépassée`}
          {expiredCount > 0 && expiringCount > 0 && ' — '}
          {expiringCount > 0 && `${expiringCount} lot(s) bientôt à leur date limite (≤ 7 jours)`}
        </span>
        <div className="text-gray-700 mt-1">
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              {item.name} ({item.code}) — {item.daysRemaining < 0
                ? `${item.durabilityType} dépassée de ${Math.abs(item.daysRemaining)} j — Non vendable`
                : `${item.durabilityType} dans ${item.daysRemaining} j`}
              {index < items.length - 1 ? ' — ' : ''}
            </React.Fragment>
          ))}
        </div>
      </Alert>
    </div>
  );
};
