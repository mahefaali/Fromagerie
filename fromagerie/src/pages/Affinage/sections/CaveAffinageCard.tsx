import { Snowflake } from "lucide-react";
import { Button } from "./../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./../../../components/ui/card";
import { Label } from "./../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./../../../components/ui/select";
import { type Fabrication } from "./../../../lib/production-store";

interface CaveAffinageCardProps {
  readyLots: Fabrication[];
  selectedLotId: string;
  freeSlots: number;
  onSelectLot: (id: string) => void;
  onConfirmAffinage: () => void;
}

export function CaveAffinageCard({
  readyLots,
  selectedLotId,
  freeSlots,
  onSelectLot,
  onConfirmAffinage,
}: CaveAffinageCardProps) {
  return (
    <Card>
      <CardHeader className="space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Snowflake className="size-4 text-primary" />
          Mettre un lot en affinage
        </CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Sélectionnez un lot prêt (statut « En caillage ») puis placez-le dans la cave courante.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="grid flex-1 gap-1.5">
            <Label className="text-xs">Lot prêt pour l'affinage</Label>
            <Select
              value={selectedLotId}
              onValueChange={onSelectLot}
              disabled={readyLots.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    readyLots.length === 0 ? "Aucun lot prêt" : "Choisir un lot…"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {readyLots.map((fab) => (
                  <SelectItem key={fab.id} value={fab.id}>
                    {fab.batchCode} — {fab.recipeName}
                    {fab.variant && fab.variant !== "Nature" ? ` (${fab.variant})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-muted-foreground sm:pb-2.5">
            {freeSlots} emplacement{freeSlots > 1 ? "s" : ""} libre{freeSlots > 1 ? "s" : ""}
          </div>
          <Button onClick={onConfirmAffinage} disabled={!selectedLotId || freeSlots === 0}>
            <Snowflake className="mr-1 size-4" />
            Mettre en affinage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}