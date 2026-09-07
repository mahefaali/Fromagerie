import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import {
  costsApi,
  type Emballage,
  type ConfigurationEmballage,
  type Equipement,
  type RegleAmortissement,
  type RegleCoutEnergie,
  type RegleMainOeuvre,
  type TarifLait,
  type TypeOperationMainOeuvre,
} from "../api/costsApi";

const emptyTarif = { saison: "SECHE" as const, prixParLitre: "", dateDebutValidite: "", dateFinValidite: "", actif: true };
const emptyEmballage = { nom: "", coutUnitaire: "", unite: "", actif: true };
const emptyConfigurationEmballage = { fromageId: "", emballageId: "", quantiteParUnite: "" };
const emptyEnergie = { typeOperation: "CHAUFFE" as const, coutStandard: "", uniteCalcul: "PAR_HEURE" as const, dateDebutValidite: "", dateFinValidite: "", actif: true };
const emptyMainOeuvre = { typeOperation: "FABRICATION" as TypeOperationMainOeuvre, dureeStandardMinutes: "", coutHoraire: "", dateDebutValidite: "", dateFinValidite: "", actif: true };
const emptyEquipement = { nom: "", description: "", actif: true };
const emptyAmortissement = { equipementId: "", coutParFabrication: "", dateDebutValidite: "", dateFinValidite: "", actif: true };

const mainOeuvreLabels: Record<TypeOperationMainOeuvre, string> = {
  FABRICATION: "Fabrication",
  RETOURNEMENT: "Retournement",
  LAVAGE: "Lavage",
  PREPARATION_VENTE: "Préparation vente",
};

function Money({ value }: { value: number }) {
  return <span>{value.toFixed(4)}</span>;
}

export default function CostsSection() {
  const [tarifs, setTarifs] = useState<TarifLait[]>([]);
  const [emballages, setEmballages] = useState<Emballage[]>([]);
  const [configurationsEmballages, setConfigurationsEmballages] = useState<ConfigurationEmballage[]>([]);
  const [fromages, setFromages] = useState<{ id: number; nom: string }[]>([]);
  const [energie, setEnergie] = useState<RegleCoutEnergie[]>([]);
  const [mainOeuvre, setMainOeuvre] = useState<RegleMainOeuvre[]>([]);
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [amortissements, setAmortissements] = useState<RegleAmortissement[]>([]);

  const [tarifForm, setTarifForm] = useState(emptyTarif);
  const [emballageForm, setEmballageForm] = useState(emptyEmballage);
  const [configurationEmballageForm, setConfigurationEmballageForm] = useState(emptyConfigurationEmballage);
  const [energieForm, setEnergieForm] = useState(emptyEnergie);
  const [mainOeuvreForm, setMainOeuvreForm] = useState(emptyMainOeuvre);
  const [equipementForm, setEquipementForm] = useState(emptyEquipement);
  const [amortissementForm, setAmortissementForm] = useState(emptyAmortissement);
  const [editingMainOeuvreId, setEditingMainOeuvreId] = useState<number | null>(null);
  const [editingEquipementId, setEditingEquipementId] = useState<number | null>(null);
  const [editingAmortissementId, setEditingAmortissementId] = useState<number | null>(null);

  const load = async () => {
    try {
      const [lait, pack, packagingConfigurations, cheeses, regles, labor, equipment, depreciation] = await Promise.all([
        costsApi.listTarifsLait(),
        costsApi.listEmballages(),
        costsApi.listConfigurationsEmballages(),
        costsApi.listFromages(),
        costsApi.listEnergie(),
        costsApi.listMainOeuvre(),
        costsApi.listEquipements(),
        costsApi.listAmortissements(),
      ]);
      setTarifs(lait);
      setEmballages(pack);
      setConfigurationsEmballages(packagingConfigurations);
      setFromages(cheeses);
      setEnergie(regles);
      setMainOeuvre(labor);
      setEquipements(equipment);
      setAmortissements(depreciation);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Chargement impossible");
    }
  };

  useEffect(() => { void load(); }, []);

  const runSubmission = async (submission: () => Promise<void>) => {
    try {
      await submission();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Enregistrement impossible");
    }
  };

  const submitTarif = async () => {
    await costsApi.createTarifLait({
      saison: tarifForm.saison,
      prixParLitre: Number(tarifForm.prixParLitre),
      dateDebutValidite: tarifForm.dateDebutValidite,
      dateFinValidite: tarifForm.dateFinValidite || null,
      actif: tarifForm.actif,
    });
    toast.success("Tarif lait ajouté");
    setTarifForm(emptyTarif);
    await load();
  };

  const submitEmballage = async () => {
    await costsApi.createEmballage({
      nom: emballageForm.nom,
      coutUnitaire: Number(emballageForm.coutUnitaire),
      unite: emballageForm.unite,
      actif: emballageForm.actif,
    });
    toast.success("Emballage ajouté");
    setEmballageForm(emptyEmballage);
    await load();
  };

  const submitConfigurationEmballage = async () => {
    await costsApi.createConfigurationEmballage({
      fromageId: Number(configurationEmballageForm.fromageId),
      emballageId: Number(configurationEmballageForm.emballageId),
      quantiteParUnite: Number(configurationEmballageForm.quantiteParUnite),
      actif: true,
    });
    toast.success("Emballage associé au fromage");
    setConfigurationEmballageForm(emptyConfigurationEmballage);
    await load();
  };

  const submitEnergie = async () => {
    await costsApi.createEnergie({
      typeOperation: energieForm.typeOperation,
      coutStandard: Number(energieForm.coutStandard),
      uniteCalcul: energieForm.uniteCalcul,
      dateDebutValidite: energieForm.dateDebutValidite,
      dateFinValidite: energieForm.dateFinValidite || null,
      actif: energieForm.actif,
    });
    toast.success("Règle énergie ajoutée");
    setEnergieForm(emptyEnergie);
    await load();
  };

  const submitMainOeuvre = async () => {
    const request = {
      typeOperation: mainOeuvreForm.typeOperation,
      dureeStandardMinutes: Number(mainOeuvreForm.dureeStandardMinutes),
      coutHoraire: Number(mainOeuvreForm.coutHoraire),
      dateDebutValidite: mainOeuvreForm.dateDebutValidite,
      dateFinValidite: mainOeuvreForm.dateFinValidite || null,
      actif: mainOeuvreForm.actif,
    };
    if (editingMainOeuvreId === null) await costsApi.createMainOeuvre(request);
    else await costsApi.updateMainOeuvre(editingMainOeuvreId, request);
    toast.success(editingMainOeuvreId === null ? "Règle de main-d'œuvre ajoutée" : "Règle de main-d'œuvre modifiée");
    setMainOeuvreForm(emptyMainOeuvre);
    setEditingMainOeuvreId(null);
    await load();
  };

  const submitEquipement = async () => {
    const request = { nom: equipementForm.nom, description: equipementForm.description || null, actif: equipementForm.actif };
    if (editingEquipementId === null) await costsApi.createEquipement(request);
    else await costsApi.updateEquipement(editingEquipementId, request);
    toast.success(editingEquipementId === null ? "Équipement ajouté" : "Équipement modifié");
    setEquipementForm(emptyEquipement);
    setEditingEquipementId(null);
    await load();
  };

  const submitAmortissement = async () => {
    const request = {
      equipementId: Number(amortissementForm.equipementId),
      coutParFabrication: Number(amortissementForm.coutParFabrication),
      dateDebutValidite: amortissementForm.dateDebutValidite,
      dateFinValidite: amortissementForm.dateFinValidite || null,
      actif: amortissementForm.actif,
    };
    if (editingAmortissementId === null) await costsApi.createAmortissement(request);
    else await costsApi.updateAmortissement(editingAmortissementId, request);
    toast.success(editingAmortissementId === null ? "Règle d'amortissement ajoutée" : "Règle d'amortissement modifiée");
    setAmortissementForm(emptyAmortissement);
    setEditingAmortissementId(null);
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-secondary">Coûts de production</p>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Paramètres configurables</h2>
      </div>

      <Tabs defaultValue="lait" className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="lait">Lait</TabsTrigger>
          <TabsTrigger value="emballages">Emballages</TabsTrigger>
          <TabsTrigger value="energie">Énergie</TabsTrigger>
          <TabsTrigger value="main-oeuvre">Main-d'œuvre</TabsTrigger>
          <TabsTrigger value="amortissements">Amortissements</TabsTrigger>
        </TabsList>

        <TabsContent value="lait" className="mt-6 space-y-4">
          <Card>
            <CardHeader><CardTitle>Nouveau tarif lait</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <select className="h-10 rounded-xl border px-3" value={tarifForm.saison} onChange={(e) => setTarifForm({ ...tarifForm, saison: e.target.value as any })}>
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

        <TabsContent value="emballages" className="mt-6 space-y-4">
          <Card>
            <CardHeader><CardTitle>Nouvel emballage</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <Input placeholder="Nom" value={emballageForm.nom} onChange={(e) => setEmballageForm({ ...emballageForm, nom: e.target.value })} />
              <Input placeholder="Unité" value={emballageForm.unite} onChange={(e) => setEmballageForm({ ...emballageForm, unite: e.target.value })} />
              <Input type="number" step="0.0001" min="0" placeholder="Coût unitaire" value={emballageForm.coutUnitaire} onChange={(e) => setEmballageForm({ ...emballageForm, coutUnitaire: e.target.value })} />
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
                <Input id="configuration-emballage-quantite" type="number" min="0.0001" step="0.0001" placeholder="Ex. 0,10" value={configurationEmballageForm.quantiteParUnite} onChange={(e) => setConfigurationEmballageForm({ ...configurationEmballageForm, quantiteParUnite: e.target.value })} />
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
                  onChange={(e) => setEnergieForm({ ...energieForm, typeOperation: e.target.value as any })}
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
                  onChange={(e) => setEnergieForm({ ...energieForm, uniteCalcul: e.target.value as any })}
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

        <TabsContent value="main-oeuvre" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{editingMainOeuvreId === null ? "Nouvelle règle de main-d'œuvre" : "Modifier la règle de main-d'œuvre"}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="main-oeuvre-operation">Opération</Label>
                <select id="main-oeuvre-operation" className="h-10 rounded-xl border bg-background px-3" value={mainOeuvreForm.typeOperation} onChange={(e) => setMainOeuvreForm({ ...mainOeuvreForm, typeOperation: e.target.value as TypeOperationMainOeuvre })}>
                  {Object.entries(mainOeuvreLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
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
                {editingMainOeuvreId !== null && <Button className="rounded-xl" variant="outline" onClick={() => { setEditingMainOeuvreId(null); setMainOeuvreForm(emptyMainOeuvre); }}>Annuler</Button>}
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-3">
            {mainOeuvre.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 font-semibold">
                      {mainOeuvreLabels[item.typeOperation]}
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
                {editingEquipementId !== null && <Button className="rounded-xl" variant="outline" onClick={() => { setEditingEquipementId(null); setEquipementForm(emptyEquipement); }}>Annuler</Button>}
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
                {editingAmortissementId !== null && <Button className="rounded-xl" variant="outline" onClick={() => { setEditingAmortissementId(null); setAmortissementForm(emptyAmortissement); }}>Annuler</Button>}
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
      </Tabs>
    </div>
  );
}
