import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { TabsContent } from "../../../../components/ui/tabs";
import { isTypeOperationEnergie, isUniteCalculEnergie } from "./costForm.config";
import type { CostsConfigurationModel } from "./useCostsConfiguration";

function Money({ value }: { value: number }) {
  return <span>{value.toFixed(4)}</span>;
}

export function EnergyCostsTab({ model }: { model: CostsConfigurationModel }) {
  const { energie, energieForm, setEnergieForm, runSubmission, submitEnergie } = model;
  return (
  <TabsContent value="energie" className="mt-6 space-y-4">
    <Card>
      <CardHeader><CardTitle>Nouvelle règle énergie</CardTitle></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="energie-operation">Opération</Label>
          <select
            id="energie-operation"
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            value={energieForm.typeOperation}
            onChange={(e) => { if (isTypeOperationEnergie(e.target.value)) setEnergieForm({ ...energieForm, typeOperation: e.target.value }); }}
          >
            <option value="CHAUFFE">Chauffe</option>
            <option value="AFFINAGE_CAVE">Affinage en cave</option>
            <option value="CHAMBRE_FROIDE">Chambre froide</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="energie-unite">Unité de calcul</Label>
          <select
            id="energie-unite"
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            value={energieForm.uniteCalcul}
            onChange={(e) => { if (isUniteCalculEnergie(e.target.value)) setEnergieForm({ ...energieForm, uniteCalcul: e.target.value }); }}
          >
            <option value="PAR_HEURE">Par heure</option>
            <option value="PAR_FROMAGE_PAR_JOUR">Par fromage et par jour</option>
            <option value="PAR_FABRICATION">Par fabrication</option>
          </select>
        </div>
        <Input type="number" step="0.0001" min="0" placeholder="Coût standard" value={energieForm.coutStandard} onChange={(e) => setEnergieForm({ ...energieForm, coutStandard: e.target.value })} />
        <div className="grid gap-2">
          <Label htmlFor="energie-date-debut">Début de validité</Label>
          <Input id="energie-date-debut" type="date" required value={energieForm.dateDebutValidite} onChange={(e) => setEnergieForm({ ...energieForm, dateDebutValidite: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="energie-date-fin">Fin de validité (optionnelle)</Label>
          <Input id="energie-date-fin" type="date" min={energieForm.dateDebutValidite || undefined} value={energieForm.dateFinValidite} onChange={(e) => setEnergieForm({ ...energieForm, dateFinValidite: e.target.value })} />
        </div>
        <Button className="rounded-xl" onClick={() => void runSubmission(submitEnergie)}>Ajouter</Button>
      </CardContent>
    </Card>
    <div className="grid gap-3">
      {energie.map((item) => (
        <Card key={item.id}>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <div className="font-semibold">{item.typeOperation}</div>
              <div className="text-sm text-muted-foreground">{item.uniteCalcul} · {item.dateDebutValidite} → {item.dateFinValidite ?? "..."}</div>
            </div>
            <Badge variant="outline"><Money value={item.coutStandard} /></Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  </TabsContent>
  );
}
