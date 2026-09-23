import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { NumericTextInput } from "../../../../components/ui/numeric-input";
import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { TabsContent } from "../../../../components/ui/tabs";
import type { CostsConfigurationModel } from "./useCostsConfiguration";

function Money({ value }: { value: number }) {
  return <span>{value.toFixed(4)}</span>;
}

export function PackagingCostsTab({ model }: { model: CostsConfigurationModel }) {
  const { emballages, configurationsEmballages, fromages, emballageForm, setEmballageForm, configurationEmballageForm, setConfigurationEmballageForm, runSubmission, submitEmballage, submitConfigurationEmballage } = model;
  return (
  <TabsContent value="emballages" className="mt-6 space-y-4">
    <Card>
      <CardHeader><CardTitle>Nouvel emballage</CardTitle></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="packaging-name">Nom</Label><Input id="packaging-name" value={emballageForm.nom} onChange={(e) => setEmballageForm({ ...emballageForm, nom: e.target.value })} /></div>
        <div className="space-y-2"><Label htmlFor="packaging-unit">Unité</Label><Input id="packaging-unit" value={emballageForm.unite} onChange={(e) => setEmballageForm({ ...emballageForm, unite: e.target.value })} /></div>
        <div className="space-y-2"><Label htmlFor="packaging-cost">Coût unitaire (€)</Label><NumericTextInput id="packaging-cost" min={0} precision={4} value={emballageForm.coutUnitaire} onValueChange={(value) => setEmballageForm({ ...emballageForm, coutUnitaire: value })} /></div>
        <Button className="rounded-xl" onClick={() => void runSubmission(submitEmballage)}>Ajouter</Button>
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle>Emballages par unité de fromage</CardTitle></CardHeader>
      <CardContent className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(190px,0.9fr)_minmax(140px,0.65fr)]">
        <div className="grid min-w-0 gap-2">
          <Label id="configuration-emballage-fromage-label">Fromage</Label>
          <Select value={configurationEmballageForm.fromageId} onValueChange={(value) => setConfigurationEmballageForm({ ...configurationEmballageForm, fromageId: value })}>
            <SelectTrigger aria-labelledby="configuration-emballage-fromage-label" className="min-w-0 rounded-xl bg-background">
              <SelectValue placeholder="Sélectionner un fromage" />
            </SelectTrigger>
            <SelectContent>
              {fromages.map((fromage) => <SelectItem key={fromage.id} value={String(fromage.id)}>{fromage.nom}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid min-w-0 gap-2">
          <Label id="configuration-emballage-type-label">Emballage</Label>
          <Select value={configurationEmballageForm.emballageId} onValueChange={(value) => setConfigurationEmballageForm({ ...configurationEmballageForm, emballageId: value })}>
            <SelectTrigger aria-labelledby="configuration-emballage-type-label" className="min-w-0 rounded-xl bg-background">
              <SelectValue placeholder="Sélectionner un emballage" />
            </SelectTrigger>
            <SelectContent>
              {emballages.filter((item) => item.actif).map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.nom}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid min-w-0 gap-2">
          <Label htmlFor="configuration-emballage-quantite">Quantité par fromage</Label>
          <NumericTextInput id="configuration-emballage-quantite" min={0.0001} precision={4} placeholder="Ex. 0,10" value={configurationEmballageForm.quantiteParUnite} onValueChange={(value) => setConfigurationEmballageForm({ ...configurationEmballageForm, quantiteParUnite: value })} />
        </div>
        <div className="flex min-w-0 items-end">
          <Button className="w-full rounded-xl" disabled={!configurationEmballageForm.fromageId || !configurationEmballageForm.emballageId || !configurationEmballageForm.quantiteParUnite} onClick={() => void runSubmission(submitConfigurationEmballage)}>Associer</Button>
        </div>
      </CardContent>
    </Card>
    <div className="grid gap-3 md:grid-cols-2">
      {configurationsEmballages.map((item) => (
        <Card key={item.id}>
          <CardContent className="flex items-center justify-between py-4">
            <div><div className="font-semibold">{item.fromageNom}</div><div className="text-sm text-muted-foreground">{item.emballageNom}</div></div>
            <Badge variant="outline">{item.quantiteParUnite} / fromage</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid gap-3">
      {emballages.map((item) => (
        <Card key={item.id}>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <div className="font-semibold">{item.nom}</div>
              <div className="text-sm text-muted-foreground">{item.unite}</div>
            </div>
            <Badge variant="outline"><Money value={item.coutUnitaire} /></Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  </TabsContent>
  );
}
