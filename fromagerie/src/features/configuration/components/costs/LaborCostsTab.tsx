import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { TabsContent } from "../../../../components/ui/tabs";
import type { TypeOperationMainOeuvre } from "../../api/costsApi";
import { EMPTY_MAIN_OEUVRE, MAIN_OEUVRE_LABELS } from "./costForm.config";
import type { CostsConfigurationModel } from "./useCostsConfiguration";

function Money({ value }: { value: number }) {
  return <span>{value.toFixed(4)}</span>;
}

export function LaborCostsTab({ model }: { model: CostsConfigurationModel }) {
  const { mainOeuvre, mainOeuvreForm, setMainOeuvreForm, editingMainOeuvreId, setEditingMainOeuvreId, runSubmission, submitMainOeuvre } = model;
  return (
  <TabsContent value="main-oeuvre" className="mt-6 space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>{editingMainOeuvreId === null ? "Nouvelle règle de main-d'œuvre" : "Modifier la règle de main-d'œuvre"}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="main-oeuvre-operation">Opération</Label>
          <select id="main-oeuvre-operation" className="h-10 rounded-xl border bg-background px-3" value={mainOeuvreForm.typeOperation} onChange={(e) => setMainOeuvreForm({ ...mainOeuvreForm, typeOperation: e.target.value as TypeOperationMainOeuvre })}>
            {Object.entries(MAIN_OEUVRE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="main-oeuvre-duree">Durée standard (minutes)</Label>
          <Input id="main-oeuvre-duree" type="number" min="1" step="1" value={mainOeuvreForm.dureeStandardMinutes} onChange={(e) => setMainOeuvreForm({ ...mainOeuvreForm, dureeStandardMinutes: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="main-oeuvre-cout">Coût horaire</Label>
          <Input id="main-oeuvre-cout" type="number" min="0" step="0.0001" value={mainOeuvreForm.coutHoraire} onChange={(e) => setMainOeuvreForm({ ...mainOeuvreForm, coutHoraire: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="main-oeuvre-date-debut">Début de validité</Label>
          <Input id="main-oeuvre-date-debut" type="date" value={mainOeuvreForm.dateDebutValidite} onChange={(e) => setMainOeuvreForm({ ...mainOeuvreForm, dateDebutValidite: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="main-oeuvre-date-fin">Fin de validité (optionnelle)</Label>
          <Input id="main-oeuvre-date-fin" type="date" min={mainOeuvreForm.dateDebutValidite || undefined} value={mainOeuvreForm.dateFinValidite} onChange={(e) => setMainOeuvreForm({ ...mainOeuvreForm, dateFinValidite: e.target.value })} />
        </div>
        <Label className="flex items-center gap-2 self-end pb-2">
          <input type="checkbox" checked={mainOeuvreForm.actif} onChange={(e) => setMainOeuvreForm({ ...mainOeuvreForm, actif: e.target.checked })} />
          Règle active
        </Label>
        <div className="flex gap-2 md:col-span-2">
          <Button className="rounded-xl" disabled={!mainOeuvreForm.dureeStandardMinutes || !mainOeuvreForm.coutHoraire || !mainOeuvreForm.dateDebutValidite} onClick={() => void runSubmission(submitMainOeuvre)}>{editingMainOeuvreId === null ? "Ajouter" : "Enregistrer"}</Button>
          {editingMainOeuvreId !== null && <Button className="rounded-xl" variant="outline" onClick={() => { setEditingMainOeuvreId(null); setMainOeuvreForm(EMPTY_MAIN_OEUVRE); }}>Annuler</Button>}
        </div>
      </CardContent>
    </Card>
    <div className="grid gap-3">
      {mainOeuvre.map((item) => (
        <Card key={item.id}>
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 font-semibold">
                {MAIN_OEUVRE_LABELS[item.typeOperation]}
                <Badge variant={item.actif ? "outline" : "secondary"}>{item.actif ? "Actif" : "Inactif"}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">{item.dureeStandardMinutes} min · <Money value={item.coutHoraire} /> / heure · {item.dateDebutValidite} → {item.dateFinValidite ?? "..."}</div>
            </div>
            <Button className="rounded-xl" size="sm" variant="outline" onClick={() => {
              setEditingMainOeuvreId(item.id);
              setMainOeuvreForm({ typeOperation: item.typeOperation, dureeStandardMinutes: String(item.dureeStandardMinutes), coutHoraire: String(item.coutHoraire), dateDebutValidite: item.dateDebutValidite, dateFinValidite: item.dateFinValidite ?? "", actif: item.actif });
            }}>Modifier</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </TabsContent>
  );
}
