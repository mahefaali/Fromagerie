import React from 'react';
import { Box } from 'lucide-react';

export const StockHeader: React.FC = () => {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="p-2 bg-[#2d5a37] text-white rounded-lg mt-1 shrink-0">
        <Box className="w-6 h-6" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Stock de fromage finis</h1>
        <p className="text-sm text-muted-foreground">
          Ce qui est immédiatement disponible à la vente : quantités, localisation et durabilité (DLC / DDM).
        </p>
      </div>
    </div>
  );
};