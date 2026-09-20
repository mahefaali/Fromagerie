import { useEffect, useRef, useState } from "react";
import { AlertTriangle, MapPin, Package, Users } from "lucide-react";
import { tracabiliteApi } from "./api";
import { TraceabilitySearch } from "./components/TraceabilitySearch";
import type { TracabiliteDescendante } from "./types";

const formatDate = (value: string) => new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(new Date(value));

export default function DescendingTraceability() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<TracabiliteDescendante | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sequence = useRef(0);

  useEffect(() => {
    const numeroLot = query.trim();
    const current = ++sequence.current;
    if (!numeroLot) {
      setData(null); setError(null); setLoading(false); return;
    }
    const timer = window.setTimeout(async () => {
      setLoading(true); setError(null);
      try {
        const result = await tracabiliteApi.rechercherLot(numeroLot);
        if (current === sequence.current) setData(result);
      } catch (cause) {
        if (current === sequence.current) {
          setData(null);
          setError(cause instanceof Error ? cause.message : "Recherche impossible");
        }
      } finally {
        if (current === sequence.current) setLoading(false);
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [query]);

  return <>
    <TraceabilitySearch id="descending-search" label="Numéro du lot de fabrication" placeholder="Ex. 0098 ou FAB-2026"
      value={query} loading={loading} error={error} onChange={setQuery} />
    {!data && !loading && !error && <div className="mt-6 rounded-2xl border border-dashed border-[#d8d0bd] bg-[#f7f3e9] px-5 py-10 text-center"><Package className="mx-auto mb-4 size-9 text-[#756a57]"/><h2 className="text-lg font-semibold">Recherchez un lot pour retrouver ses destinations</h2></div>}
    {data && <div className="mt-6 space-y-5">
      <section className="rounded-2xl border border-[#b8bea2] bg-[#eeecdf] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#756a57]">Lot de fabrication</p><h2 className="mt-1 font-mono text-2xl font-bold">{data.numeroLot}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><div><small>Fromage</small><p className="font-semibold">{data.fromage}</p></div><div><small>Date de fabrication</small><p className="font-semibold">{formatDate(data.dateFabrication)}</p></div></div>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[['Produit',data.quantiteProduite],['Livré',data.quantiteLivree],['Non vendu',data.quantiteNonVendue],['Disponible',data.quantiteDisponible],['Perdu',data.quantitePerdue]].map(([label,value])=><div key={label} className="rounded-2xl border border-[#d8d0bd] bg-[#fffdf8] p-4"><p className="text-sm text-[#756a57]">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>)}
      </section>
      <section className="rounded-2xl border border-[#d8d0bd] bg-[#fffdf8] p-5"><h3 className="flex items-center gap-2 text-lg font-semibold"><Users className="size-5"/>Clients livrés</h3>{data.clientsLivres.length ? <div className="mt-4 space-y-2">{data.clientsLivres.map(client=><div key={client.clientId} className="flex justify-between rounded-xl bg-[#f3eee2] p-3"><span>{client.client}</span><b>{client.quantiteLivree} unités</b></div>)}</div> : <p className="mt-3 text-sm text-[#756a57]">Aucune livraison pour ce lot.</p>}</section>
      <section className="rounded-2xl border border-[#d8d0bd] bg-[#fffdf8] p-5"><h3 className="flex items-center gap-2 text-lg font-semibold"><MapPin className="size-5"/>Localisation ou dernière destination connue</h3>{data.localisationsActuelles.length ? <div className="mt-4 space-y-2">{data.localisationsActuelles.map((location,index)=><div key={`${location.nature}-${index}`} className="rounded-xl bg-[#f3eee2] p-3"><b>{location.libelle}</b><p className="text-sm text-[#756a57]">{location.quantite} unités{location.nature === 'DERNIERE_DESTINATION_CONNUE' ? ` · dernière destination connue${location.numeroLivraison ? ` · ${location.numeroLivraison}` : ''}` : ' · localisation interne'}</p></div>)}</div> : <p className="mt-3 text-sm text-[#756a57]">Aucune localisation détaillée enregistrée.</p>}</section>
      <section className="rounded-2xl border border-[#d8d0bd] bg-[#fffdf8] p-5"><h3 className="flex items-center gap-2 text-lg font-semibold"><AlertTriangle className="size-5"/>Pertes enregistrées</h3>{data.pertes.length ? <div className="mt-4 space-y-2">{data.pertes.map(perte=><div key={perte.id} className="rounded-xl bg-[#f3eee2] p-3"><div className="flex justify-between gap-3"><b>{perte.type.replaceAll('_',' ')}</b><b>{perte.quantite} unités</b></div><p className="text-sm">{perte.motif}</p><small className="text-[#756a57]">{formatDate(perte.date)}</small></div>)}</div> : <p className="mt-3 text-sm text-[#756a57]">Aucune perte enregistrée.</p>}</section>
    </div>}
  </>;
}
