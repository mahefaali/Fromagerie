import React, { useState } from 'react';
import { MOCK_CELLARS, MOCK_RELEASES, } from './../mockData';
import { type Cellar } from './../types';
import { Card, CardHeader, CardTitle, CardContent } from "./../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./../../../components/ui/table";
import { Badge } from "./../../../components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./../../../components/ui/sheet";
import { Warehouse, Ban, CheckCircle2, Clock, Scale, ArrowRight, ChevronRight } from 'lucide-react';

export const ProductionPlannerTable: React.FC = () => {
  const [selectedCellar, setSelectedCellar] = useState<Cellar | null>(null);

  return (
    <>
      <Card className="bg-[#fcfaf7] border-[#e8dfd5] shadow-sm">
        <CardHeader className="border-b border-[#eee7de] pb-3">
          <CardTitle className="text-sm font-bold text-[#5c4a3e] tracking-wide flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-[#8b5cf6]" />
            PLANIFICATION DE LA PRODUCTION
          </CardTitle>
          <p className="text-xs text-[#8c7a6b] mt-0.5">
            Cliquez sur une cave pour analyser les options de lancement.
          </p>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#f5eee6]">
              <TableRow className="border-[#eee7de]">
                <TableHead className="text-[11px] font-bold text-[#8c7a6b] uppercase">Cave</TableHead>
                <TableHead className="text-[11px] font-bold text-[#8c7a6b] uppercase">Capacité</TableHead>
                <TableHead className="text-[11px] font-bold text-[#8c7a6b] uppercase">Places Libres</TableHead>
                <TableHead className="text-[11px] font-bold text-[#8c7a6b] uppercase">Disponibilité</TableHead>
                <TableHead className="w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_CELLARS.map((cellar) => {
                const freeSlots = cellar.capacity - cellar.occupied;
                const isFull = freeSlots <= 0;

                return (
                  <TableRow
                    key={cellar.id}
                    onClick={() => setSelectedCellar(cellar)}
                    className="border-[#f0e6da] hover:bg-[#f2e9df] cursor-pointer transition-colors"
                  >
                    {/* Cave */}
                    <TableCell className="text-xs font-bold text-[#3d312a]">
                      <span className="font-semibold text-sm block">{cellar.name}</span>
                      <span className="text-[10px] text-[#8c7a6b] font-normal">{cellar.description}</span>
                    </TableCell>

                    {/* Capacité */}
                    <TableCell className="text-xs text-[#706053]">
                      <span className="font-mono">{cellar.occupied}</span> / <span className="font-mono">{cellar.capacity}</span> pcs
                    </TableCell>

                    {/* Places Libres */}
                    <TableCell className={`text-xs font-extrabold font-mono ${isFull ? 'text-rose-600' : 'text-[#2d5a27]'}`}>
                      {freeSlots > 0 ? `+${freeSlots}` : freeSlots} pcs
                    </TableCell>

                    {/* Disponibilité */}
                    <TableCell>
                      {isFull ? (
                        <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700 text-[10px] font-bold flex items-center gap-1 w-fit">
                          <Ban className="w-3 h-3" /> Cave Saturée
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px] font-bold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Disponible
                        </Badge>
                      )}
                    </TableCell>

                    {/* Icône d'indication d'ouverture */}
                    <TableCell>
                      <ChevronRight className="w-4 h-4 text-[#8c7a6b]" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- PANNEAU DÉTAILLÉ DE PLANIFICATION (SHEET) --- */}
      <Sheet open={!!selectedCellar} onOpenChange={(open) => !open && setSelectedCellar(null)}>
        <SheetContent className="bg-[#fcfaf7] border-l border-[#e8dfd5] text-[#3d312a] sm:max-w-md">
          {selectedCellar && <CellarPlannerDetails cellar={selectedCellar} />}
        </SheetContent>
      </Sheet>
    </>
  );
};

/* --- SOUS-COMPOSANT : DÉTAILS D'AIDE À LA DÉCISION --- */
const CellarPlannerDetails: React.FC<{ cellar: Cellar }> = ({ cellar }) => {
  const freeSlots = cellar.capacity - cellar.occupied;
  const isFull = freeSlots <= 0;

  const upcomingRelease = MOCK_RELEASES.find(
    (r) => r.location.startsWith(cellar.name) || r.location.includes(cellar.id)
  );

  return (
    <div className="space-y-6 pt-4">
      <SheetHeader>
        <SheetTitle className="text-lg font-bold text-[#5c4a3e]">
          Détails & Options : {cellar.name}
        </SheetTitle>
        <SheetDescription className="text-xs text-[#8c7a6b]">
          {cellar.description} • Temp: {cellar.temp}°C • HR: {cellar.humidity}%
        </SheetDescription>
      </SheetHeader>

      {/* Résumé rapide */}
      <div className="p-3 bg-[#f5eee6] rounded-lg border border-[#e8dfd5] flex justify-between items-center text-xs">
        <div>
          <span className="text-[#8c7a6b] block">Occupation actuelle</span>
          <span className="font-bold font-mono text-sm">{cellar.occupied} / {cellar.capacity} pcs</span>
        </div>
        <div className="text-right">
          <span className="text-[#8c7a6b] block">Places libres immédiates</span>
          <span className={`font-bold font-mono text-sm ${isFull ? 'text-rose-600' : 'text-[#2d5a27]'}`}>
            {freeSlots > 0 ? `+${freeSlots}` : freeSlots} places
          </span>
        </div>
      </div>

      {/* Recommandations et scénarios */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#8c7a6b]">
          Scénarios de fabrication
        </h4>

        {isFull ? (
          <div className="space-y-3">
            {/* Scénario 1: Attendre la sortie */}
            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Option A : Libération programmée</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Sortie prévue le <strong className="underline">{upcomingRelease?.expectedReleaseDate || 'prochainement'}</strong> (libération de <strong>+{upcomingRelease?.quantity || 0} places</strong>).
              </p>
            </div>

            {/* Scénario 2: Redirection */}
            <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-lg space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <ArrowRight className="w-4 h-4 text-blue-600" />
                <span>Option B : Redirection de cave</span>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                Transférer certains lots prêts vers l'espace de stockage d'expédition ou utiliser une cave secondaire avec de la place libre.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>Lancement immédiat possible</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Vous pouvez lancer une fabrication de <strong>{freeSlots} pièces max</strong> aujourd'hui dans cette cave sans saturation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};