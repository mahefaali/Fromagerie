import { useEffect, useEffectEvent, useState } from "react";
import { CircleDollarSign, Layers3, PackageCheck, TrendingUp } from "lucide-react";
import { orderApi } from "../../features/stocks/api/stockApi";
import {
  profitabilityApi,
  type CrossProfitability,
  type LotProductionCost,
  type ProfitabilityAnalysis,
  type ProfitabilityGroup,
} from "../../features/profitability/api/profitabilityApi";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

const today = new Date();
const initialEnd = today.toISOString().slice(0, 10);
const initialStart = `${today.getFullYear()}-01-01`;
const money = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const number = new Intl.NumberFormat("fr-FR");

interface Option { id: number; nom: string }

function MetricCard({ title, value, detail, icon: Icon }: {
  title: string;
  value: string;
  detail: string;
  icon: typeof CircleDollarSign;
}) {
  return (
    <Card className="overflow-hidden rounded-2xl border-[#d8c3a5]/70 bg-[#fffdf9] shadow-sm">
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8a7565]">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-[#34454c]">{value}</p>
          <p className="mt-1 text-xs text-[#8a7565]">{detail}</p>
        </div>
        <span className="rounded-full bg-[#c96a4a]/10 p-3 text-[#c96a4a]"><Icon className="h-5 w-5" /></span>
      </CardContent>
    </Card>
  );
}

function ProfitabilityTable({ rows, firstHeading, showCostPerKg = false }: {
  rows: ProfitabilityGroup[];
  firstHeading: string;
  showCostPerKg?: boolean;
}) {
  return (
    <Table>
      <TableHeader><TableRow><TableHead>{firstHeading}</TableHead><TableHead>Livré</TableHead><TableHead>CA</TableHead><TableHead>Coût</TableHead>{showCostPerKg && <TableHead>Coût/kg pondéré</TableHead>}<TableHead>Marge</TableHead><TableHead>Rentabilité</TableHead></TableRow></TableHeader>
      <TableBody>
        {rows.map((row) => <TableRow key={row.id}><TableCell className="font-medium">{row.nom}</TableCell><TableCell>{number.format(row.quantiteLivree)}</TableCell><TableCell>{money.format(row.chiffreAffaires)}</TableCell><TableCell>{money.format(row.coutAttribue)}</TableCell>{showCostPerKg && <TableCell>{money.format(row.coutProductionParKg ?? 0)}</TableCell>}<TableCell className={row.margeBrute < 0 ? "text-red-700" : "text-emerald-700"}>{money.format(row.margeBrute)}</TableCell><TableCell>{number.format(row.tauxRentabilite)} %</TableCell></TableRow>)}
        {rows.length === 0 && <TableRow><TableCell colSpan={showCostPerKg ? 7 : 6} className="py-10 text-center text-[#8a7565]">Aucune livraison sur cette période.</TableCell></TableRow>}
      </TableBody>
    </Table>
  );
}

function CrossTable({ rows }: { rows: CrossProfitability[] }) {
  return (
    <Table><TableHeader><TableRow><TableHead>Fromage</TableHead><TableHead>Client</TableHead><TableHead>Livré</TableHead><TableHead>Prix moyen/unité</TableHead><TableHead>CA</TableHead><TableHead>Marge</TableHead><TableHead>Rentabilité</TableHead></TableRow></TableHeader>
      <TableBody>{rows.map((row) => <TableRow key={`${row.fromageId}-${row.clientId}`}><TableCell className="font-medium">{row.fromageNom}</TableCell><TableCell>{row.clientNom}</TableCell><TableCell>{row.quantiteLivree}</TableCell><TableCell>{money.format(row.prixVenteMoyen)}</TableCell><TableCell>{money.format(row.chiffreAffaires)}</TableCell><TableCell>{money.format(row.margeBrute)}</TableCell><TableCell>{number.format(row.tauxRentabilite)} %</TableCell></TableRow>)}
      {rows.length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-[#8a7565]">Aucune donnée croisée disponible.</TableCell></TableRow>}</TableBody>
    </Table>
  );
}

export default function ProfitabilityPage() {
  const [dateDebut, setDateDebut] = useState(initialStart);
  const [dateFin, setDateFin] = useState(initialEnd);
  const [fromageId, setFromageId] = useState("all");
  const [clientId, setClientId] = useState("all");
  const [fromages, setFromages] = useState<Option[]>([]);
  const [clients, setClients] = useState<Option[]>([]);
  const [analysis, setAnalysis] = useState<ProfitabilityAnalysis | null>(null);
  const [lots, setLots] = useState<LotProductionCost[]>([]);
  const [selectedLot, setSelectedLot] = useState<LotProductionCost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const [analysisResult, lotsResult] = await Promise.allSettled([
        profitabilityApi.analyse({ dateDebut, dateFin, fromageId: fromageId === "all" ? undefined : Number(fromageId), clientId: clientId === "all" ? undefined : Number(clientId) }),
        profitabilityApi.lots(),
      ]);
      if (analysisResult.status === "fulfilled") {
        setAnalysis(analysisResult.value);
      }
      if (lotsResult.status === "fulfilled") {
        setLots(lotsResult.value);
      } else {
        setLots([]);
      }
      const failures = [analysisResult, lotsResult]
        .filter((result): result is PromiseRejectedResult => result.status === "rejected")
        .map((result) => result.reason instanceof Error ? result.reason.message : "Chargement impossible");
      if (failures.length > 0) {
        setError(failures.join(" "));
      }
    } finally {
      setLoading(false);
    }
  };
  const initialLoad = useEffectEvent(load);

  useEffect(() => {
    Promise.all([orderApi.findFromages(), orderApi.findClients()])
      .then(([cheeses, customers]) => { setFromages(cheeses); setClients(customers); })
      .catch(() => setError("Impossible de charger les listes de filtres."));
    void initialLoad();
  }, []);

  const summary = analysis?.synthese;
  return (
    <section className="mx-auto max-w-7xl space-y-6 pb-8 text-[#3d312a]">
      <header className="relative overflow-hidden rounded-[2rem] border border-[#d8c3a5]/70 bg-[linear-gradient(125deg,#34454c_0%,#455b61_65%,#c96a4a_160%)] px-6 py-8 text-[#fffaf2] shadow-lg md:px-9">
        <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full border border-white/10 bg-white/5" />
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#e8c9a7]">Pilotage économique</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Coûts & rentabilité</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#f3e8da]/80">Marge réelle des lots livrés, calculée à partir des coûts définitifs et des prix de commande.</p>
      </header>

      <Card className="rounded-2xl border-[#d8c3a5]/70 bg-[#fffdf9]">
        <CardContent className="grid gap-4 p-5 md:grid-cols-5">
          <div><Label htmlFor="profit-start">Date de début</Label><Input id="profit-start" type="date" value={dateDebut} onChange={(event) => setDateDebut(event.target.value)} className="mt-1.5 rounded-xl" /></div>
          <div><Label htmlFor="profit-end">Date de fin</Label><Input id="profit-end" type="date" value={dateFin} onChange={(event) => setDateFin(event.target.value)} className="mt-1.5 rounded-xl" /></div>
          <div><Label>Fromage</Label><Select value={fromageId} onValueChange={setFromageId}><SelectTrigger className="mt-1.5 w-full rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tous les fromages</SelectItem>{fromages.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.nom}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Client</Label><Select value={clientId} onValueChange={setClientId}><SelectTrigger className="mt-1.5 w-full rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tous les clients</SelectItem>{clients.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.nom}</SelectItem>)}</SelectContent></Select></div>
          <div className="flex items-end"><Button onClick={() => void load()} disabled={loading || !dateDebut || !dateFin} className="w-full rounded-xl bg-[#c96a4a] hover:bg-[#ad573b]">{loading ? "Calcul en cours..." : "Actualiser"}</Button></div>
        </CardContent>
      </Card>

      {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Chiffre d'affaires" value={money.format(summary?.chiffreAffaires ?? 0)} detail={`${number.format(summary?.quantiteLivree ?? 0)} unités livrées`} icon={CircleDollarSign} />
        <MetricCard title="Coût attribué" value={money.format(summary?.coutAttribue ?? 0)} detail="Coût réel des lots" icon={Layers3} />
        <MetricCard title="Marge brute" value={money.format(summary?.margeBrute ?? 0)} detail="CA moins coût attribué" icon={PackageCheck} />
        <MetricCard title="Rentabilité" value={`${number.format(summary?.tauxRentabilite ?? 0)} %`} detail="Marge rapportée au coût" icon={TrendingUp} />
      </div>

      <Tabs defaultValue="fromages">
        <TabsList><TabsTrigger value="fromages">Fromages</TabsTrigger><TabsTrigger value="clients">Clients</TabsTrigger><TabsTrigger value="croisee">Croisé</TabsTrigger><TabsTrigger value="lots">Lots</TabsTrigger></TabsList>
        <TabsContent value="fromages"><Card className="rounded-2xl"><CardHeader><CardTitle>Rentabilité par fromage</CardTitle></CardHeader><CardContent className="overflow-x-auto"><ProfitabilityTable rows={analysis?.parFromage ?? []} firstHeading="Fromage" showCostPerKg /></CardContent></Card></TabsContent>
        <TabsContent value="clients"><Card className="rounded-2xl"><CardHeader><CardTitle>Rentabilité par client</CardTitle></CardHeader><CardContent className="overflow-x-auto"><ProfitabilityTable rows={analysis?.parClient ?? []} firstHeading="Client" /></CardContent></Card></TabsContent>
        <TabsContent value="croisee"><Card className="rounded-2xl"><CardHeader><CardTitle>Analyse fromage / client</CardTitle></CardHeader><CardContent className="overflow-x-auto"><CrossTable rows={analysis?.croisee ?? []} /></CardContent></Card></TabsContent>
        <TabsContent value="lots"><Card className="rounded-2xl"><CardHeader><CardTitle>Coûts définitifs par lot</CardTitle></CardHeader><CardContent className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Lot</TableHead><TableHead>Fromage</TableHead><TableHead>Total</TableHead><TableHead>Par unité</TableHead><TableHead>Par kg</TableHead><TableHead /></TableRow></TableHeader><TableBody>{lots.map((lot) => <TableRow key={lot.id}><TableCell className="font-mono">{lot.numeroLot}</TableCell><TableCell>{lot.fromageNom}</TableCell><TableCell>{money.format(lot.coutTotal)}</TableCell><TableCell>{money.format(lot.coutParUnite)}</TableCell><TableCell>{money.format(lot.coutParKg)}</TableCell><TableCell><Button variant="outline" className="rounded-full" onClick={() => setSelectedLot(lot)}>Détails</Button></TableCell></TableRow>)}{lots.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-[#8a7565]">Aucun lot finalisé.</TableCell></TableRow>}</TableBody></Table></CardContent></Card></TabsContent>
      </Tabs>

      <Dialog open={selectedLot !== null} onOpenChange={(open) => !open && setSelectedLot(null)}><DialogContent className="rounded-2xl"><DialogHeader><DialogTitle>Coût du lot {selectedLot?.numeroLot}</DialogTitle></DialogHeader>{selectedLot && <div className="grid grid-cols-2 gap-3 text-sm">{[["Lait", selectedLot.coutLait], ["Matières", selectedLot.coutMatieres], ["Emballage", selectedLot.coutEmballage], ["Énergie", selectedLot.coutEnergie], ["Main-d'œuvre", selectedLot.coutMainOeuvre], ["Amortissement", selectedLot.coutAmortissement]].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-[#f7f3ec] p-3"><p className="text-[#8a7565]">{label}</p><p className="mt-1 font-semibold">{money.format(Number(value))}</p></div>)}<div className="col-span-2 rounded-xl bg-[#34454c] p-4 text-[#fffaf2]"><p>Coût total</p><p className="mt-1 text-xl font-semibold">{money.format(selectedLot.coutTotal)}</p></div></div>}</DialogContent></Dialog>
    </section>
  );
}
