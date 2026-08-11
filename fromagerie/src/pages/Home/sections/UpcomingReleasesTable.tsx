import React from 'react';
import { MOCK_RELEASES } from '../mockData';
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Package } from 'lucide-react';

export const UpcomingReleasesTable: React.FC = () => {
  return (
    <Card className="bg-[#fcfaf7] border-[#e8dfd5] shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-[#eee7de] pb-3">
        <CardTitle className="text-sm font-bold text-[#5c4a3e] tracking-wide flex items-center gap-2">
          <Package className="w-4 h-4 text-[#2d5a27]" />
          SORTIES PRÉVUES — 7 PROCHAINS JOURS
        </CardTitle>
        <Badge variant="secondary" className="bg-[#f0e6da] text-[#5c4a3e] font-bold">
          {MOCK_RELEASES.length}
        </Badge>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-[#f5eee6]">
            <TableRow className="border-[#eee7de]">
              <TableHead className="text-[11px] font-bold text-[#8c7a6b] uppercase">Lot</TableHead>
              <TableHead className="text-[11px] font-bold text-[#8c7a6b] uppercase">Type</TableHead>
              <TableHead className="text-[11px] font-bold text-[#8c7a6b] uppercase">Cave</TableHead>
              <TableHead className="text-[11px] font-bold text-[#8c7a6b] uppercase">Sortie Prévue</TableHead>
              <TableHead className="text-[11px] font-bold text-[#8c7a6b] uppercase">Échéance</TableHead>
              <TableHead className="text-[11px] font-bold text-[#8c7a6b] uppercase">Qté</TableHead>
              <TableHead className="text-[11px] font-bold text-[#8c7a6b] uppercase">Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_RELEASES.map((row) => (
              <TableRow key={row.id} className="border-[#f0e6da] hover:bg-[#f7f2ec]">
                <TableCell className="font-mono text-xs font-semibold text-[#3d312a]">{row.code}</TableCell>
                <TableCell className="text-xs font-medium text-[#3d312a]">
                  <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: row.color }} />
                  {row.type}
                </TableCell>
                <TableCell className="text-xs text-[#706053] font-mono">{row.location}</TableCell>
                <TableCell className="text-xs text-[#706053]">{row.expectedReleaseDate}</TableCell>
                <TableCell>
                  <Badge 
                    className={`text-[10px] font-bold px-2 py-0.5 border-none ${
                      row.dueStatus === "Aujourd'hui" 
                        ? 'bg-[#fbebe6] text-[#c85a32]' 
                        : row.dueStatus === 'Demain' 
                        ? 'bg-[#fef3c7] text-[#92400e]' 
                        : 'bg-[#e0f2fe] text-[#0369a1]'
                    }`}
                  >
                    {row.dueStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs font-bold text-[#3d312a]">{row.quantity} pcs</TableCell>
                <TableCell className="text-xs text-[#8c7a6b] italic">{row.note || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};