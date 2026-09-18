import React from 'react';
import { PackageCheck } from 'lucide-react';

export const StockHeader: React.FC = () => {
  return (
    <div className=" mb-6">
      <div className="flex items-center gap-2">
        <PackageCheck className="h-5 w-5 text-emerald-600" />
        <h1 className="text-2xl font-bold text-foreground">Stock de fromage finis</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Ce qui est immédiatement disponible à la vente : quantités, localisation et durabilité (DLC / DDM).
      </p>
    </div>
  );
};