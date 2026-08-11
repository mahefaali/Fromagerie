import { useEffect, useMemo, useState } from "react";
import { Button } from "./../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./../../../components/ui/card";
import { Input } from "./../../../components/ui/input";
import { Label } from "./../../../components/ui/label";
import { Badge } from "./../../../components/ui/badge";
import { Separator } from "./../../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./../../../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./../../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./../../../components/ui/select";
import { Textarea } from "./../../../components/ui/textarea";
import { ScrollArea } from "./../../../components/ui/scroll-area";
import { Plus, Pencil, History, Beaker, Euro, Trash2, FilePlus } from "lucide-react";

// ---------- Types ----------
type IngredientKey = "lait" | "sel" | "presure" | "ferments";

export type Ingredient = {
  key: IngredientKey;
  label: string;
  unit: string;
  quantity: number;
  pricePerUnit: number;
};

export type VariantExtra = { label: string; quantity: number; unit: string; pricePerUnit: number };

export type RecipeVariant = {
  id: string;
  name: string;
  extras: VariantExtra[];
};

export type RecipeRevision = {
  id: string;
  date: string;
  author: string;
  note: string;
  ingredients: Ingredient[];
};

export type Recipe = {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  variants: RecipeVariant[];
  history: RecipeRevision[];
};

// ---------- Defaults ----------
const DEFAULT_PRICES: Record<IngredientKey, { label: string; unit: string; pricePerUnit: number }> = {
  lait: { label: "Lait cru", unit: "L", pricePerUnit: 0.85 },
  sel: { label: "Sel", unit: "g", pricePerUnit: 0.002 },
  presure: { label: "Présure", unit: "ml", pricePerUnit: 0.12 },
  ferments: { label: "Ferments lactiques", unit: "g", pricePerUnit: 0.45 },
};

const makeIngredients = (q: Record<IngredientKey, number>): Ingredient[] =>
  (Object.keys(DEFAULT_PRICES) as IngredientKey[]).map((k) => ({
    key: k,
    label: DEFAULT_PRICES[k].label,
    unit: DEFAULT_PRICES[k].unit,
    pricePerUnit: DEFAULT_PRICES[k].pricePerUnit,
    quantity: q[k],
  }));

const INITIAL_RECIPES: Recipe[] = [
  {
    id: "camembert",
    name: "Camembert fermier",
    description: "Pâte molle à croûte fleurie, affinage 21 jours.",
    ingredients: makeIngredients({ lait: 22, sel: 60, presure: 4, ferments: 8 }),
    variants: [
      { id: "v-herbes", name: "Aux herbes de Provence", extras: [{ label: "Herbes de Provence", quantity: 12, unit: "g", pricePerUnit: 0.08 }] },
      { id: "v-poivre", name: "Au poivre noir", extras: [{ label: "Poivre noir concassé", quantity: 8, unit: "g", pricePerUnit: 0.15 }] },
    ],
    history: [
      { id: "r1", date: "2026-05-12", author: "Marie L.", note: "Réduction du sel de 65g à 60g pour adoucir.", ingredients: makeIngredients({ lait: 22, sel: 65, presure: 4, ferments: 8 }) },
      { id: "r2", date: "2026-06-02", author: "Marie L.", note: "Augmentation des ferments pour accélérer l'acidification.", ingredients: makeIngredients({ lait: 22, sel: 60, presure: 4, ferments: 7 }) },
    ],
  },
  {
    id: "tomme",
    name: "Tomme de montagne",
    description: "Pâte pressée non cuite, affinage 3 mois.",
    ingredients: makeIngredients({ lait: 80, sel: 220, presure: 15, ferments: 25 }),
    variants: [],
    history: [],
  },
];

// ---------- Helpers ----------
const computeCost = (ingredients: Ingredient[], extras: VariantExtra[] = []) => {
  const base = ingredients.reduce((sum, i) => sum + i.quantity * i.pricePerUnit, 0);
  const add = extras.reduce((sum, e) => sum + e.quantity * e.pricePerUnit, 0);
  return base + add;
};

const fmtEUR = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ---------- Component ----------
export function RecipeManager() {
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_RECIPES[0].id);
  const [editOpen, setEditOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeVariantPage, setActiveVariantPage] = useState(0);

  const selected = useMemo(
    () => recipes.find((r) => r.id === selectedId) ?? recipes[0],
    [recipes, selectedId],
  );

  const baseCost = computeCost(selected.ingredients);
  const fixedPanelHeight = "min-h-[360px]";
  const variantsPerPage = 2;
  const totalVariantPages = Math.max(1, Math.ceil(selected.variants.length / variantsPerPage));
  const visibleVariants = selected.variants.slice(
    activeVariantPage * variantsPerPage,
    (activeVariantPage + 1) * variantsPerPage,
  );

  useEffect(() => {
    setActiveVariantPage(0);
  }, [selectedId]);

  const updateRecipe = (id: string, updater: (r: Recipe) => Recipe) => {
    setRecipes((prev) => prev.map((r) => (r.id === id ? updater(r) : r)));
  };

  const saveEdit = (
    ingredients: Ingredient[],
    variants: RecipeVariant[],
    note: string,
    author: string,
  ) => {
    updateRecipe(selected.id, (r) => ({
      ...r,
      ingredients,
      variants,
      history: [
        {
          id: uid("rev"),
          date: new Date().toISOString().slice(0, 10),
          author: author || "Anonyme",
          note: note || "Modification de la recette",
          ingredients: ingredients.map((i) => ({ ...i })),
        },
        ...r.history,
      ],
    }));
    setEditOpen(false);
  };

  const createRecipe = (recipe: Recipe) => {
    setRecipes((prev) => [...prev, recipe]);
    setSelectedId(recipe.id);
    setCreateOpen(false);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Gestion des recettes</h1>
          <p className="text-sm text-muted-foreground">
            Recettes des fromages, variantes, historique et coûts matière première.
          </p>
        </div>
        <div className="flex items-end gap-2">
          <div className="w-60">
            <Label htmlFor="recipe-select" className="text-xs text-muted-foreground">
              Fromage
            </Label>
            <Select value={selected.id} onValueChange={setSelectedId}>
              <SelectTrigger id="recipe-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {recipes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <FilePlus className="mr-1 size-4" /> Nouvelle recette
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="size-5 text-primary" />
              {selected.name}
            </CardTitle>
            <CardDescription>{selected.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)}>
              <History className="mr-1 size-4" /> Historique
            </Button>
            <Button size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-1 size-4" /> Modifier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="base">
            <TabsList>
              <TabsTrigger value="base">Recette de base</TabsTrigger>
              <TabsTrigger value="variants">
                Variantes <Badge variant="secondary" className="ml-2">{selected.variants.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="base" className={`mt-4 ${fixedPanelHeight}`}>
              <div className="space-y-4 rounded-xl border bg-card/40 p-4">
                <IngredientTable ingredients={selected.ingredients} />
                <CostFooter label="Coût matière première (base)" amount={baseCost} />
              </div>
            </TabsContent>

            <TabsContent value="variants" className={`mt-4 ${fixedPanelHeight}`}>
              <div className="min-h-[320px] rounded-xl border bg-card/40 p-4">
                {selected.variants.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucune variante définie pour cette recette.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {visibleVariants.map((v) => {
                      const cost = computeCost(selected.ingredients, v.extras);
                      return (
                        <div key={v.id} className="rounded-lg border bg-card p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="font-medium">{v.name}</h4>
                            <Badge variant="outline">+{fmtEUR(cost - baseCost)}</Badge>
                          </div>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {v.extras.map((e, idx) => (
                              <li key={idx} className="flex justify-between">
                                <span>{e.label} — {e.quantity} {e.unit}</span>
                                <span>{fmtEUR(e.quantity * e.pricePerUnit)}</span>
                              </li>
                            ))}
                          </ul>
                          <Separator className="my-3" />
                          <div className="flex justify-between text-sm font-medium">
                            <span>Coût total variante</span>
                            <span>{fmtEUR(cost)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selected.variants.length > 1 && (
                  <div className="mt-4 flex justify-end gap-1">
                    {Array.from({ length: totalVariantPages }, (_, idx) => {
                      const isActive = idx === activeVariantPage;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveVariantPage(idx)}
                          className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                          aria-label={`Afficher la variante ${idx + 1}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {editOpen && (
        <EditDialog
          key={`edit-${selected.id}`}
          open={editOpen}
          onOpenChange={setEditOpen}
          recipe={selected}
          onSave={saveEdit}
        />
      )}

      <HistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} history={selected.history} />

      {createOpen && (
        <CreateRecipeDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreate={createRecipe}
        />
      )}
    </div>
  );
}

// ---------- Sub-components ----------
function IngredientTable({ ingredients }: { ingredients: Ingredient[] }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-2">Ingrédient</th>
            <th className="px-4 py-2">Quantité</th>
            <th className="px-4 py-2">Prix unitaire</th>
            <th className="px-4 py-2 text-right">Coût</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((i) => (
            <tr key={i.key} className="border-t">
              <td className="px-4 py-2 font-medium">{i.label}</td>
              <td className="px-4 py-2">{i.quantity} {i.unit}</td>
              <td className="px-4 py-2 text-muted-foreground">{fmtEUR(i.pricePerUnit)} / {i.unit}</td>
              <td className="px-4 py-2 text-right">{fmtEUR(i.quantity * i.pricePerUnit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CostFooter({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Euro className="size-4 text-primary" />
        {label}
      </div>
      <span className="text-lg font-semibold">{fmtEUR(amount)}</span>
    </div>
  );
}

function VariantEditor({
  variants,
  onChange,
}: {
  variants: RecipeVariant[];
  onChange: (v: RecipeVariant[]) => void;
}) {
  const updateVariant = (id: string, patch: Partial<RecipeVariant>) =>
    onChange(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const updateExtra = (vid: string, idx: number, patch: Partial<VariantExtra>) =>
    onChange(
      variants.map((v) =>
        v.id === vid
          ? { ...v, extras: v.extras.map((e, i) => (i === idx ? { ...e, ...patch } : e)) }
          : v,
      ),
    );

  const addVariant = () =>
    onChange([...variants, { id: uid("v"), name: "Nouvelle variante", extras: [] }]);

  const removeVariant = (id: string) => onChange(variants.filter((v) => v.id !== id));

  const addExtra = (vid: string) =>
    onChange(
      variants.map((v) =>
        v.id === vid
          ? { ...v, extras: [...v.extras, { label: "", quantity: 0, unit: "g", pricePerUnit: 0 }] }
          : v,
      ),
    );

  const removeExtra = (vid: string, idx: number) =>
    onChange(
      variants.map((v) =>
        v.id === vid ? { ...v, extras: v.extras.filter((_, i) => i !== idx) } : v,
      ),
    );

  return (
    <div className="space-y-3">
      {variants.length === 0 && (
        <p className="text-sm text-muted-foreground">Aucune variante. Ajoutez-en une ci-dessous.</p>
      )}
      {variants.map((v) => (
        <div key={v.id} className="rounded-lg border bg-card p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={v.name}
              onChange={(e) => updateVariant(v.id, { name: e.target.value })}
              placeholder="Nom de la variante"
            />
            <Button variant="ghost" size="icon" onClick={() => removeVariant(v.id)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
          {v.extras.map((e, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_70px_60px_80px_32px] items-center gap-1">
              <Input
                value={e.label}
                onChange={(ev) => updateExtra(v.id, idx, { label: ev.target.value })}
                placeholder="Ingrédient"
              />
              <Input
                type="number"
                step="0.01"
                value={e.quantity}
                onChange={(ev) => updateExtra(v.id, idx, { quantity: parseFloat(ev.target.value) || 0 })}
                placeholder="Qté"
              />
              <Input
                value={e.unit}
                onChange={(ev) => updateExtra(v.id, idx, { unit: ev.target.value })}
                placeholder="g"
              />
              <Input
                type="number"
                step="0.001"
                value={e.pricePerUnit}
                onChange={(ev) => updateExtra(v.id, idx, { pricePerUnit: parseFloat(ev.target.value) || 0 })}
                placeholder="€/unit"
              />
              <Button variant="ghost" size="icon" onClick={() => removeExtra(v.id, idx)}>
                <Trash2 className="size-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => addExtra(v.id)}>
            <Plus className="mr-1 size-3" /> Ingrédient
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addVariant}>
        <Plus className="mr-1 size-4" /> Ajouter une variante
      </Button>
    </div>
  );
}

function EditDialog({
  open,
  onOpenChange,
  recipe,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  recipe: Recipe;
  onSave: (ingredients: Ingredient[], variants: RecipeVariant[], note: string, author: string) => void;
}) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(recipe.ingredients.map((i) => ({ ...i })));
  const [variants, setVariants] = useState<RecipeVariant[]>(
    recipe.variants.map((v) => ({ ...v, extras: v.extras.map((e) => ({ ...e })) })),
  );
  const [note, setNote] = useState("");
  const [author, setAuthor] = useState("");

  const setQty = (key: IngredientKey, q: number) =>
    setIngredients((prev) => prev.map((i) => (i.key === key ? { ...i, quantity: q } : i)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Modifier la recette</DialogTitle>
          <DialogDescription>
            Ajustez les quantités et gérez les variantes. Une révision sera ajoutée à l'historique.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto pr-4">
          <Tabs defaultValue="base">
            <TabsList>
              <TabsTrigger value="base">Ingrédients</TabsTrigger>
              <TabsTrigger value="variants">Variantes <Badge variant="secondary" className="ml-2">{variants.length}</Badge></TabsTrigger>
            </TabsList>
            <TabsContent value="base" className="space-y-3 mt-4">
              {ingredients.map((i) => (
                <div key={i.key} className="grid grid-cols-[1fr_120px_40px] items-center gap-2">
                  <Label className="text-sm">{i.label}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={i.quantity}
                    onChange={(e) => setQty(i.key, parseFloat(e.target.value) || 0)}
                  />
                  <span className="text-xs text-muted-foreground">{i.unit}</span>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="variants" className="mt-4">
              <VariantEditor variants={variants} onChange={setVariants} />
            </TabsContent>
          </Tabs>
          <Separator className="my-4" />
          <div className="grid gap-2">
            <Label htmlFor="author">Auteur</Label>
            <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Votre nom" />
          </div>
          <div className="grid gap-2 mt-2">
            <Label htmlFor="note">Note de révision</Label>
            <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Pourquoi cette modification ?" />
          </div>
        </div>
        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={() => onSave(ingredients, variants, note, author)}>
            <Plus className="mr-1 size-4" /> Enregistrer la révision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateRecipeDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (r: Recipe) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    makeIngredients({ lait: 20, sel: 50, presure: 4, ferments: 8 }),
  );
  const [variants, setVariants] = useState<RecipeVariant[]>([]);

  const setQty = (key: IngredientKey, q: number) =>
    setIngredients((prev) => prev.map((i) => (i.key === key ? { ...i, quantity: q } : i)));

  const submit = () => {
    if (!name.trim()) return;
    const id = uid("rec");
    onCreate({
      id,
      name: name.trim(),
      description: description.trim() || "Nouvelle recette",
      ingredients,
      variants,
      history: [
        {
          id: uid("rev"),
          date: new Date().toISOString().slice(0, 10),
          author: "Création",
          note: "Création de la recette",
          ingredients: ingredients.map((i) => ({ ...i })),
        },
      ],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Nouvelle recette</DialogTitle>
          <DialogDescription>Définissez le fromage, ses ingrédients et ses variantes.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto pr-4">
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="rname">Nom du fromage</Label>
              <Input id="rname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Brie de campagne" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rdesc">Description</Label>
              <Textarea id="rdesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Type de pâte, durée d'affinage…" />
            </div>
            <Separator />
            <h4 className="text-sm font-medium">Ingrédients de base</h4>
            {ingredients.map((i) => (
              <div key={i.key} className="grid grid-cols-[1fr_120px_40px] items-center gap-2">
                <Label className="text-sm">{i.label}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={i.quantity}
                  onChange={(e) => setQty(i.key, parseFloat(e.target.value) || 0)}
                />
                <span className="text-xs text-muted-foreground">{i.unit}</span>
              </div>
            ))}
            <Separator />
            <h4 className="text-sm font-medium">Variantes</h4>
            <VariantEditor variants={variants} onChange={setVariants} />
          </div>
        </div>
        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={!name.trim()}>
            <FilePlus className="mr-1 size-4" /> Créer la recette
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HistoryDialog({
  open,
  onOpenChange,
  history,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  history: RecipeRevision[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Historique des modifications</DialogTitle>
          <DialogDescription>Chaque révision conserve les quantités utilisées à ce moment.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune révision enregistrée.</p>
          ) : (
            <ol className="space-y-4">
              {history.map((rev) => (
                <li key={rev.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{rev.date}</p>
                      <p className="text-xs text-muted-foreground">par {rev.author}</p>
                    </div>
                    <Badge variant="outline">{fmtEUR(computeCost(rev.ingredients))}</Badge>
                  </div>
                  <p className="mt-2 text-sm">{rev.note}</p>
                  <ul className="mt-3 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                    {rev.ingredients.map((i) => (
                      <li key={i.key}>{i.label}: {i.quantity} {i.unit}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default RecipeManager;
