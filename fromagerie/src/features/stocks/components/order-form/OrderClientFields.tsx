import type { Dispatch, SetStateAction } from "react";
import { UserPlus } from "lucide-react";

import type { ClientOption } from "../../api/stockApi";
import type { NewClientForm } from "./createOrderForm";

interface OrderClientFieldsProps {
  clients: ClientOption[];
  clientName: string;
  contactInfo: string;
  showNewClient: boolean;
  newClient: NewClientForm;
  onClientNameChange: (value: string) => void;
  onContactInfoChange: (value: string) => void;
  onToggleNewClient: () => void;
  onNewClientChange: Dispatch<SetStateAction<NewClientForm>>;
  onCreateClient: () => Promise<void>;
}

export function OrderClientFields(props: OrderClientFieldsProps) {
  const updateClient = (field: keyof NewClientForm, value: string) => props.onNewClientChange((current) => ({ ...current, [field]: value }));
  return <>
    <div className="flex items-center gap-2">
      <select aria-label="Client" value={props.clientName} onChange={(event) => props.onClientNameChange(event.target.value)} required className={fieldClass}>
        <option value="">Choisir un client</option>{props.clients.filter((client) => client.actif).map((client) => <option key={client.id} value={client.nom}>{client.nom}</option>)}
      </select>
      <button type="button" onClick={props.onToggleNewClient} aria-label="Créer un client" title="Créer un client" className="shrink-0 rounded-xl border border-[#2d4a27] px-3 py-2.5 text-[#2d4a27] hover:bg-[#eef3eb]"><UserPlus className="size-5" /></button>
    </div>
    {props.showNewClient && <div className="space-y-3 rounded-xl border border-[#d9cdbb] bg-[#f8f4ec] p-4">
      <div className="text-sm font-bold text-[#2c2825]">Nouveau client</div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <input autoFocus value={props.newClient.nom} onChange={(event) => updateClient("nom", event.target.value)} placeholder="Nom du client" className={compactFieldClass} />
        <select aria-label="Type du nouveau client" value={props.newClient.typeClient} onChange={(event) => updateClient("typeClient", event.target.value)} className={compactFieldClass}><option value="EPICERIE">Épicerie</option><option value="MARCHE">Marché</option><option value="VENTE_DIRECTE">Vente directe</option></select>
        <input value={props.newClient.telephone} onChange={(event) => updateClient("telephone", event.target.value)} placeholder="Téléphone (optionnel)" className={compactFieldClass} />
        <input value={props.newClient.adresse} onChange={(event) => updateClient("adresse", event.target.value)} placeholder="Adresse (optionnel)" className={compactFieldClass} />
      </div>
      <button type="button" onClick={() => void props.onCreateClient()} disabled={!props.newClient.nom.trim()} className="rounded-lg bg-[#2d4a27] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Ajouter et sélectionner</button>
    </div>}
    <input type="text" aria-label="Coordonnées du client" placeholder="email / téléphone" value={props.contactInfo} onChange={(event) => props.onContactInfoChange(event.target.value)} className={`${fieldClass} md:max-w-[calc(50%-0.375rem)]`} />
  </>;
}

const fieldClass = "w-full rounded-xl border border-transparent bg-[#f5f2eb] px-4 py-2.5 text-sm outline-none transition-all focus:border-[#2d4a27] focus:bg-white";
const compactFieldClass = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#2d4a27]";
