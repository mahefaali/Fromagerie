import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { TabsContent } from "../../../../components/ui/tabs";
import { isSaison } from "./costForm.config";
import type { CostsConfigurationModel } from "./useCostsConfiguration";

function Money({ value }: { value: number }) {
  return <span>{value.toFixed(4)}</span>;
}

export function MilkCostsTab({ model }: { model: CostsConfigurationModel }) {
  const { tarifs, tarifForm, setTarifForm, runSubmission, submitTarif } = model;
  return (
  <TabsContent value="lait" className="mt-6 space-y-4">
    <Card>
      <CardHeader><CardTitle>Nouveau tarif lait</CardTitle></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        <select className="h-10 rounded-xl border px-3" value={tarifForm.saison} onChange={(e) => { if (isSaison(e.target.value)) setTarifForm({ ...tarifForm, saison: e.target.value }); }}>
          <option value="SECHE">SECHE</option>
          <option value="HUMIDE">HUMIDE</option>
        </select>
        <Input type="number" step="0.0001" min="0" placeholder="Prix par litre" value={tarifForm.prixParLitre} onChange={(e) => setTarifForm({ ...tarifForm, prixParLitre: e.target.value })} />
        <div className="grid gap-2">
          <Label htmlFor="tarif-lait-date-debut">Début de validité</Label>
          <Input id="tarif-lait-date-debut" type="date" required value={tarifForm.dateDebutValidite} onChange={(e) => setTarifForm({ ...tarifForm, dateDebutValidite: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="tarif-lait-date-fin">Fin de validité (optionnelle)</Label>
          <Input id="tarif-lait-date-fin" type="date" min={tarifForm.dateDebutValidite || undefined} value={tarifForm.dateFinValidite} onChange={(e) => setTarifForm({ ...tarifForm, dateFinValidite: e.target.value })} />
        </div>
        <Button className="rounded-xl" onClick={() => void runSubmission(submitTarif)}>Ajouter</Button>
      </CardContent>
    </Card>
    <div className="grid gap-3">
      {tarifs.map((item) => (
        <Card key={item.id}>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <div className="font-semibold">{item.saison}</div>
              <div className="text-sm text-muted-foreground">{item.dateDebutValidite} → {item.dateFinValidite ?? "..."}</div>
            </div>
            <Badge variant="outline"><Money value={item.prixParLitre} /> / L</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  </TabsContent>
  );
}
