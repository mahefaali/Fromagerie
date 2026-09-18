import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { TabsContent } from "../../../../components/ui/tabs";
import { EMPTY_AMORTISSEMENT, EMPTY_EQUIPEMENT } from "./costForm.config";
import type { CostsConfigurationModel } from "./useCostsConfiguration";

function Money({ value }: { value: number }) {
  return <span>{value.toFixed(4)}</span>;
}

export function DepreciationCostsTab({ model }: { model: CostsConfigurationModel }) {
  const { equipements, amortissements, equipementForm, setEquipementForm, amortissementForm, setAmortissementForm, editingEquipementId, setEditingEquipementId, editingAmortissementId, setEditingAmortissementId, runSubmission, submitEquipement, submitAmortissement } = model;
  return (
  <TabsContent value="amortissements" className="mt-6 space-y-6">
    <Card>
      <CardHeader><CardTitle>{editingEquipementId === null ? "Nouvel équipement" : "Modifier l'équipement"}</CardTitle></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="equipement-nom">Nom</Label>
          <Input id="equipement-nom" maxLength={120} value={equipementForm.nom} onChange={(e) => setEquipementForm({ ...equipementForm, nom: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="equipement-description">Description (optionnelle)</Label>
          <Input id="equipement-description" maxLength={500} value={equipementForm.description} onChange={(e) => setEquipementForm({ ...equipementForm, description: e.target.value })} />
        </div>
        <Label className="flex items-center gap-2">
          <input type="checkbox" checked={equipementForm.actif} onChange={(e) => setEquipementForm({ ...equipementForm, actif: e.target.checked })} />
          Équipement actif
        </Label>
        <div className="flex gap-2 md:justify-end">
          <Button className="rounded-xl" disabled={!equipementForm.nom.trim()} onClick={() => void runSubmission(submitEquipement)}>{editingEquipementId === null ? "Ajouter" : "Enregistrer"}</Button>
          {editingEquipementId !== null && <Button className="rounded-xl" variant="outline" onClick={() => { setEditingEquipementId(null); setEquipementForm(EMPTY_EQUIPEMENT); }}>Annuler</Button>}
        </div>
      </CardContent>
    </Card>

    <div className="grid gap-3 md:grid-cols-2">
      {equipements.map((item) => (
        <Card key={item.id}>
          <CardContent className="flex items-start justify-between gap-3 py-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 font-semibold">{item.nom}<Badge variant={item.actif ? "outline" : "secondary"}>{item.actif ? "Actif" : "Inactif"}</Badge></div>
              {item.description && <div className="text-sm text-muted-foreground">{item.description}</div>}
            </div>
            <Button className="rounded-xl" size="sm" variant="outline" onClick={() => {
              setEditingEquipementId(item.id);
              setEquipementForm({ nom: item.nom, description: item.description ?? "", actif: item.actif });
            }}>Modifier</Button>
          </CardContent>
        </Card>
      ))}
    </div>

    <Card>
      <CardHeader><CardTitle>{editingAmortissementId === null ? "Nouveau coût par fabrication" : "Modifier le coût par fabrication"}</CardTitle></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="amortissement-equipement">Équipement</Label>
          <select id="amortissement-equipement" className="h-10 rounded-xl border bg-background px-3" value={amortissementForm.equipementId} onChange={(e) => setAmortissementForm({ ...amortissementForm, equipementId: e.target.value })}>
            <option value="">Sélectionner un équipement</option>
            {equipements.map((item) => <option key={item.id} value={item.id}>{item.nom}{item.actif ? "" : " (inactif)"}</option>)}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="amortissement-cout">Coût par fabrication</Label>
          <Input id="amortissement-cout" type="number" min="0" step="0.0001" value={amortissementForm.coutParFabrication} onChange={(e) => setAmortissementForm({ ...amortissementForm, coutParFabrication: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="amortissement-date-debut">Début de validité</Label>
          <Input id="amortissement-date-debut" type="date" value={amortissementForm.dateDebutValidite} onChange={(e) => setAmortissementForm({ ...amortissementForm, dateDebutValidite: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="amortissement-date-fin">Fin de validité (optionnelle)</Label>
          <Input id="amortissement-date-fin" type="date" min={amortissementForm.dateDebutValidite || undefined} value={amortissementForm.dateFinValidite} onChange={(e) => setAmortissementForm({ ...amortissementForm, dateFinValidite: e.target.value })} />
        </div>
        <Label className="flex items-center gap-2">
          <input type="checkbox" checked={amortissementForm.actif} onChange={(e) => setAmortissementForm({ ...amortissementForm, actif: e.target.checked })} />
          Règle active
        </Label>
        <div className="flex gap-2 md:justify-end">
          <Button className="rounded-xl" disabled={!amortissementForm.equipementId || !amortissementForm.coutParFabrication || !amortissementForm.dateDebutValidite} onClick={() => void runSubmission(submitAmortissement)}>{editingAmortissementId === null ? "Ajouter" : "Enregistrer"}</Button>
          {editingAmortissementId !== null && <Button className="rounded-xl" variant="outline" onClick={() => { setEditingAmortissementId(null); setAmortissementForm(EMPTY_AMORTISSEMENT); }}>Annuler</Button>}
        </div>
      </CardContent>
    </Card>

    <div className="grid gap-3">
      {amortissements.map((item) => (
        <Card key={item.id}>
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 font-semibold">{item.equipementNom}<Badge variant={item.actif ? "outline" : "secondary"}>{item.actif ? "Actif" : "Inactif"}</Badge></div>
              <div className="text-sm text-muted-foreground"><Money value={item.coutParFabrication} /> / fabrication · {item.dateDebutValidite} → {item.dateFinValidite ?? "..."}</div>
            </div>
            <Button className="rounded-xl" size="sm" variant="outline" onClick={() => {
              setEditingAmortissementId(item.id);
              setAmortissementForm({ equipementId: String(item.equipementId), coutParFabrication: String(item.coutParFabrication), dateDebutValidite: item.dateDebutValidite, dateFinValidite: item.dateFinValidite ?? "", actif: item.actif });
            }}>Modifier</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </TabsContent>
  );
}
