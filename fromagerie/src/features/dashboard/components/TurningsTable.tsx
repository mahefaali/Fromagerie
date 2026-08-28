import React, { useState } from 'react';
import { MOCK_TURNINGS } from './../mockData';
import { Card, CardHeader, CardTitle, CardContent } from "./../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./../../../components/ui/table";
import { Badge } from "./../../../components/ui/badge";
import { Progress } from "./../../../components/ui/progress";
import { Button } from "./../../../components/ui/button";
import { Check, RotateCw } from 'lucide-react';

export const TurningsTable: React.FC = () => {
  const [items, setItems] = useState(MOCK_TURNINGS);

  const toggleComplete = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <Card className="bg-[#fcfaf7] border-[#e8dfd5] shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-[#eee7de] pb-3">
        <CardTitle className="text-sm font-bold text-[#5c4a3e] tracking-wide flex items-center gap-2">
          <RotateCw className="w-4 h-4 text-[#c85a32]" />
          RETOURNEMENTS DU JOUR
        </CardTitle>
        <Badge variant="secondary" className="bg-[#f0e6da] text-[#5c4a3e] font-bold">
          {items.length}
        </Badge>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-[#f5eee6]">
            <TableRow className="border-[#eee7de]">
              <TableHead className="w-[80px] text-[11px] font-bold text-[#8c7a6b] uppercase">Lot</TableHead>
              <TableHead className="text-[11px] font-bold text-[#8c7a6b] uppercase">Type</TableHead>
              <TableHead className="text-[11px] font-bold text-[#8c7a6b] uppercase">Étagère</TableHead>
              <TableHead className="text-[11px] font-bold text-[#8c7a6b] uppercase">Dernier Retournement</TableHead>
              <TableHead className="text-[11px] font-bold text-[#8c7a6b] uppercase">Qté</TableHead>
              <TableHead className="w-[120px] text-[11px] font-bold text-[#8c7a6b] uppercase">Avancement</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((row) => (
              <TableRow key={row.id} className="border-[#f0e6da] hover:bg-[#f7f2ec]">
                <TableCell className="font-mono text-xs font-semibold text-[#3d312a]">{row.code}</TableCell>
                <TableCell className="text-xs font-medium text-[#3d312a]">
                  <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: row.color }} />
                  {row.type}
                </TableCell>
                <TableCell className="text-xs text-[#706053] font-mono">{row.location}</TableCell>
                <TableCell className="text-xs text-[#706053]">{row.lastTurned}</TableCell>
                <TableCell className="text-xs font-bold text-[#3d312a]">{row.quantity} pcs</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={row.progressPercent} className="h-2 bg-[#e2d7cb]" />
                    <span className="text-[10px] font-semibold text-[#706053]">{row.progressPercent}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleComplete(row.id)}
                    className="h-7 w-7 text-[#8c7a6b] hover:text-emerald-700 hover:bg-emerald-50 rounded-full"
                    title="Valider le retournement"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};