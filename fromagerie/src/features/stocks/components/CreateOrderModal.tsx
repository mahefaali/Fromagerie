import { AppDialogContent } from "../../../components/ui/app-dialog";
import { Dialog } from "../../../components/ui/dialog";

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AppDialogContent
        title="Nouvelle commande"
        description="La commande réserve le stock : elle n'est pas encore livrée."
        className="max-w-2xl"
        footer={
          <>
            <button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold">Annuler</button>
            <button type="submit" form="create-order-form" disabled={!form.clientName.trim() || form.hasItemError} className="min-h-11 rounded-xl bg-[#2d4a27] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Créer la commande</button>
          </>
        }
      >
        <form id="create-order-form" onSubmit={form.submit} className="space-y-5">
          <OrderClientFields clients={clients} clientName={form.clientName} contactInfo={form.contactInfo} showNewClient={form.showNewClient} newClient={form.newClient}
            onClientNameChange={form.setClientName} onContactInfoChange={form.setContactInfo} onToggleNewClient={() => form.setShowNewClient((value) => !value)} onNewClientChange={form.setNewClient} onCreateClient={form.createClient} />

          <div>
            <label htmlFor="expected-delivery-date" className="mb-1.5 block text-xs font-semibold text-gray-700">Date de livraison souhaitée</label>
            <input id="expected-delivery-date" type="date" value={form.expectedDeliveryDate} onChange={(event) => form.setExpectedDeliveryDate(event.target.value)} className={`${mainFieldClass} max-w-xs`} />
          </div>

          <OrderItemsFields items={form.items} fromages={fromages} onAdd={form.addItem} onRemove={form.removeItem} onSelectCheese={form.selectCheese} onUpdate={form.updateItem} />

          <div>
            <label htmlFor="order-note" className="mb-1 block text-xs font-semibold text-gray-700">Note</label>
            <textarea id="order-note" rows={2} value={form.note} onChange={(event) => form.setNote(event.target.value)} className={`${mainFieldClass} resize-none`} />
          </div>
        </form>
      </AppDialogContent>
    </Dialog>
  );
}

const mainFieldClass = "w-full rounded-xl border border-transparent bg-[#f5f2eb] px-4 py-2.5 text-sm outline-none transition-all focus:border-[#2d4a27] focus:bg-white";
