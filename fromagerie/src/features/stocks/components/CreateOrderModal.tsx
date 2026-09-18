import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, X } from "lucide-react";

import type { ClientOption } from "../api/stockApi";
import type { CreateOrderPayload } from "../types/orders";
import { OrderClientFields } from "./order-form/OrderClientFields";
import { OrderItemsFields } from "./order-form/OrderItemsFields";
import type { NewClientForm } from "./order-form/createOrderForm";
import { useCreateOrderForm } from "./order-form/useCreateOrderForm";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateOrderPayload) => void;
  clients: ClientOption[];
  fromages: Array<{ id: number; nom: string }>;
  onCreateClient: (client: NewClientForm) => Promise<ClientOption | null>;
}

export function CreateOrderModal(props: CreateOrderModalProps) {
  const { isOpen, onClose, clients, fromages } = props;
  const form = useCreateOrderForm(props);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black/50 p-4 backdrop-blur-xs sm:p-6" role="dialog" aria-modal="true" aria-labelledby="create-order-title">
      <div className="flex max-h-[85vh] w-full max-w-2xl animate-in flex-col overflow-hidden rounded-2xl border border-[#e2dacb] bg-[#fcfbfa] shadow-2xl duration-150 fade-in zoom-in-95">
        <header className="flex shrink-0 items-start justify-between border-b border-[#e2dacb]/40 p-5 pb-3 sm:p-6">
          <div><h2 id="create-order-title" className="text-xl font-bold text-[#2c2825]">Nouvelle commande</h2><p className="mt-0.5 text-xs text-gray-500">La commande réserve le stock : elle n'est pas encore livrée.</p></div>
          <button onClick={onClose} type="button" aria-label="Fermer la création de commande" className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:text-gray-700"><X className="size-5" /></button>
        </header>

        <form onSubmit={form.submit} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="space-y-5 p-5 sm:p-6">
            <OrderClientFields clients={clients} clientName={form.clientName} contactInfo={form.contactInfo} showNewClient={form.showNewClient} newClient={form.newClient}
              onClientNameChange={form.setClientName} onContactInfoChange={form.setContactInfo} onToggleNewClient={() => form.setShowNewClient((value) => !value)} onNewClientChange={form.setNewClient} onCreateClient={form.createClient} />

            <div><label htmlFor="expected-delivery-date" className="mb-1.5 block text-xs font-semibold text-gray-700">Date de livraison souhaitée</label>
              <div className="relative max-w-xs"><input id="expected-delivery-date" type="date" value={form.expectedDeliveryDate} onChange={(event) => form.setExpectedDeliveryDate(event.target.value)} className={mainFieldClass} />
                <Calendar className="pointer-events-none absolute right-3 top-3 size-4 text-gray-500" /></div>
            </div>

            <OrderItemsFields items={form.items} fromages={fromages} onAdd={form.addItem} onRemove={form.removeItem} onSelectCheese={form.selectCheese} onUpdate={form.updateItem} />

            <div><label htmlFor="order-note" className="mb-1 block text-xs font-semibold text-gray-700">Note</label>
              <textarea id="order-note" rows={2} value={form.note} onChange={(event) => form.setNote(event.target.value)} className={`${mainFieldClass} resize-none`} />
            </div>
          </div>
          <footer className="flex items-center justify-end gap-3 border-t border-[#e2dacb]/60 bg-[#f5f2eb]/40 p-4 sm:p-5">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold">Annuler</button>
            <button type="submit" disabled={!form.clientName.trim() || form.hasItemError} className="rounded-xl bg-[#2d4a27] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Créer la commande</button>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}

const mainFieldClass = "w-full rounded-xl border border-transparent bg-[#f5f2eb] px-4 py-2.5 text-sm outline-none transition-all focus:border-[#2d4a27] focus:bg-white";
