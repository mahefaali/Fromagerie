import React from 'react';
import { MOCK_CELLARS } from './../mockData';
import { Card, CardHeader, CardTitle, CardContent } from "./../../../components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./../../../components/ui/tooltip";
import { Warehouse } from 'lucide-react';

export const CellarGridOverview: React.FC = () => {
  return (
    <Card className="bg-[#fcfaf7] border-[#e8dfd5] shadow-sm text-[#3d312a]">
      {/* En-tête du composant */}
      <CardHeader className="border-b border-[#eee7de] py-3.5 px-4">
        <CardTitle className="text-xs font-bold text-[#5c4a3e] tracking-wider uppercase flex items-center gap-2">
          <Warehouse className="w-4 h-4 text-[#7c6a5a]" />
          ÉTAT DES CAVES
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-6">
        {/* LISTE DES CAVES */}
        {MOCK_CELLARS.map((cellar, index) => {
          const freeSlots = cellar.capacity - cellar.occupied;
          const isOverCapacity = freeSlots < 0;
          const fillPercentage = Math.min((cellar.occupied / cellar.capacity) * 100, 100);

          // Génération des carrés virtuels (pièces + places libres si capacité disponible)
          const squares = [];
          cellar.batches.forEach(b => {
            for (let i = 0; i < b.count; i++) {
              squares.push({ color: b.color, label: b.type });
            }
          });
          
          if (freeSlots > 0) {
            for (let i = 0; i < freeSlots; i++) {
              squares.push({ color: '#e8e2d9', label: 'Place Libre' });
            }
          }

          return (
            <div key={cellar.id} className="space-y-3">
              {/* Infos Header Cave */}
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-sm text-[#2c221e]">{cellar.name}</span>
                  <span className="text-xs text-[#8c7a6b] ml-2 font-normal">
                    {cellar.description} &nbsp;·&nbsp; {cellar.temp}°C &nbsp;·&nbsp; HR {cellar.humidity}%
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-[#8c7a6b] font-medium">{cellar.occupied}/{cellar.capacity} places</span>
                  <span className={`ml-3 font-bold ${isOverCapacity ? 'text-[#b91c1c]' : 'text-[#2d5a27]'}`}>
                    {freeSlots > 0 ? `${freeSlots} libres` : `${freeSlots} libres`}
                  </span>
                </div>
              </div>

              {/* Jauge d'occupation (Rouge si saturée, verte si OK) */}
              <div className="w-full h-1.5 bg-[#e8e2d9] rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${isOverCapacity ? 'bg-[#991b1b]' : 'bg-[#2d4a22]'}`} 
                  style={{ width: isOverCapacity ? '100%' : `${fillPercentage}%` }}
                />
              </div>

              {/* Grille de carrés (Stockage) */}
              <TooltipProvider>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {squares.map((sq, idx) => (
                    <Tooltip key={idx}>
                      <TooltipTrigger asChild>
                        <div 
                          className="w-3.5 h-3.5 rounded-[2px] transition-transform hover:scale-125 cursor-pointer" 
                          style={{ backgroundColor: sq.color }}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="text-[11px] bg-[#3d312a] text-white">
                        {sq.label}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>

              {/* Légende par type de fromage dans la cave */}
              <div className="flex items-center gap-4 text-xs text-[#706053] pt-0.5">
                {cellar.batches.map(b => (
                  <span key={b.type} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: b.color }} />
                    <span className="font-medium text-[#4a3e35]">{b.type}</span>
                    <span className="text-[#8c7a6b]">&nbsp;·&nbsp; {b.count} pièces</span>
                  </span>
                ))}
              </div>

              {index < MOCK_CELLARS.length - 1 && (
                <hr className="border-[#eee7de] my-4" />
              )}
            </div>
          );
        })}

        <hr className="border-[#eee7de]" />

        {/* SECTION : MATURITÉ PAR TYPE */}
        <div className="space-y-3.5 pt-1">
          <h4 className="text-[11px] font-bold uppercase text-[#8c7a6b] tracking-wider">
            MATURITÉ PAR TYPE
          </h4>
          
          <div className="space-y-3 text-xs">
            {/* Camembert */}
            <div className="flex items-center justify-between gap-2">
              <span className="w-24 font-medium text-[#3d312a]">Camembert</span>
              <div className="flex-1 h-3 bg-[#e8e2d9] rounded-full overflow-hidden flex">
                <div className="bg-[#2d4a22] h-full" style={{ width: '40%' }} title="Prêt" />
                <div className="bg-[#6b8e62] h-full" style={{ width: '35%' }} title="≤7j" />
                <div className="bg-[#c2b8aa] h-full" style={{ width: '25%' }} title="En affinage" />
              </div>
              <span className="text-[11px] text-[#706053] font-mono text-right w-16 leading-tight">
                <strong className="block text-[#3d312a]">12/42</strong> prêts
              </span>
            </div>

            {/* Brie */}
            <div className="flex items-center justify-between gap-2">
              <span className="w-24 font-medium text-[#3d312a]">Brie</span>
              <div className="flex-1 h-3 bg-[#e8e2d9] rounded-full overflow-hidden flex">
                <div className="bg-[#c85a32] h-full" style={{ width: '30%' }} title="Prêt" />
                <div className="bg-[#e4c4b5] h-full" style={{ width: '70%' }} title="En affinage" />
              </div>
              <span className="text-[11px] text-[#706053] font-mono text-right w-16 leading-tight">
                <strong className="block text-[#3d312a]">8/28</strong> prêts
              </span>
            </div>

            {/* Comté */}
            <div className="flex items-center justify-between gap-2">
              <span className="w-24 font-medium text-[#3d312a]">Comté</span>
              <div className="flex-1 h-3 bg-[#e8e2d9] rounded-full overflow-hidden flex">
                <div className="bg-[#d97706] h-full" style={{ width: '30%' }} title="Prêt" />
                <div className="bg-[#edd8b8] h-full" style={{ width: '70%' }} title="En affinage" />
              </div>
              <span className="text-[11px] text-[#706053] font-mono text-right w-16 leading-tight">
                <strong className="block text-[#3d312a]">3/10</strong> prêts
              </span>
            </div>

            {/* Emmental */}
            <div className="flex items-center justify-between gap-2">
              <span className="w-24 font-medium text-[#3d312a]">Emmental</span>
              <div className="flex-1 h-3 bg-[#e8e2d9] rounded-full overflow-hidden flex">
                <div className="bg-[#0284c7] h-full" style={{ width: '40%' }} title="Prêt" />
                <div className="bg-[#c0dceb] h-full" style={{ width: '60%' }} title="En affinage" />
              </div>
              <span className="text-[11px] text-[#706053] font-mono text-right w-16 leading-tight">
                <strong className="block text-[#3d312a]">4/10</strong> prêts
              </span>
            </div>

            {/* Chèvre */}
            <div className="flex items-center justify-between gap-2">
              <span className="w-24 font-medium text-[#3d312a]">Chèvre</span>
              <div className="flex-1 h-3 bg-[#e8e2d9] rounded-full overflow-hidden flex">
                <div className="bg-[#9333ea] h-full" style={{ width: '60%' }} title="En affinage" />
                <div className="bg-[#d8b4fe] h-full" style={{ width: '40%' }} title="En affinage" />
              </div>
              <span className="text-[11px] text-[#706053] font-mono text-right w-16 leading-tight">
                <strong className="block text-[#3d312a]">0/40</strong> prêts
              </span>
            </div>
          </div>

          {/* Légende bas de composant */}
          <div className="flex items-center gap-4 text-[11px] text-[#8c7a6b] pt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#2d4a22] rounded-[2px]" /> Prêt
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#6b8e62] rounded-[2px]" /> ≤7j
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#c2b8aa] rounded-[2px]" /> En affinage
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#e8e2d9] rounded-[2px]" /> Libre
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};