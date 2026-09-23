import { useEffect, useState, type FormEvent } from "react";
import { Download } from "lucide-react";

import { AppDialogContent } from "../../../components/ui/app-dialog";
import { Dialog } from "../../../components/ui/dialog";
import type { Order, OrderItem } from "../types/orders";

interface InvoiceModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onSubmit: (data: { orderId: string; paymentMethod: string }) => void;
  onDownloadPdf?: (order: Order) => void;
}

const PAYMENT_METHODS = ["Virement", "Carte bancaire", "Espèces", "Chèque", "Prélèvement"];

interface GroupedInvoiceItem {
  id: string;
  itemName: string;
  unit: string;
  expectedQty: number;
  effectiveQty: number;
  subtotal: number;
  averageUnitPrice: number;
  hasDeliveryDetails: boolean;
  gap: number;
}

function groupInvoiceItems(items: OrderItem[]): GroupedInvoiceItem[] {
  const groups = new Map<string, Omit<GroupedInvoiceItem, "averageUnitPrice">>();
  items.forEach((item) => {
    const itemName = item.name || item.productName || "Article";
    const key = itemName.trim().toLocaleLowerCase("fr");
    const effectiveQty = item.deliveredQuantity ?? item.quantity;
    const subtotal = effectiveQty * item.pricePerUnit;
    const current = groups.get(key);
    groups.set(key, {
      id: current?.id ?? item.id,
      itemName: current?.itemName ?? itemName,
      unit: current?.unit ?? item.unit ?? "u",
      expectedQty: (current?.expectedQty ?? 0) + item.quantity,
      effectiveQty: (current?.effectiveQty ?? 0) + effectiveQty,
      subtotal: (current?.subtotal ?? 0) + subtotal,
      hasDeliveryDetails: (current?.hasDeliveryDetails ?? false) || item.deliveredQuantity !== undefined,
      gap: (current?.gap ?? 0) + (item.deliveredQuantity !== undefined ? item.deliveredQuantity - item.quantity : 0),
    });
  });
  return [...groups.values()].map((item) => ({
    ...item,
    averageUnitPrice: item.effectiveQty === 0 ? 0 : item.subtotal / item.effectiveQty,
  }));
}

export function InvoiceModal({ isOpen, order, onClose, onSubmit, onDownloadPdf }: InvoiceModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("Virement");

  useEffect(() => {
    if (order) setPaymentMethod(order.paymentMethod || "Virement");
  }, [order]);

  const isAlreadyInvoiced = Boolean(order?.invoicedDate);
  const itemsWithSubtotals = groupInvoiceItems(order?.items ?? []);
  const calculatedTotal = itemsWithSubtotals.reduce((sum, item) => sum + item.subtotal, 0);
  const totalAmount = isAlreadyInvoiced && order?.invoicedTotal !== undefined ? order.invoicedTotal : calculatedTotal;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!order || isAlreadyInvoiced) return;
    onSubmit({ orderId: order.id, paymentMethod });
    onClose();
  };

  return (
    <Dialog open={isOpen && order !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      {order && (
        <AppDialogContent
          title={order.invoiceNumber ? `Facture ${order.invoiceNumber}` : `Facture — ${order.code || order.id}`}
          description={`${order.clientName}${order.invoicedDate ? ` · Facturée le ${order.invoicedDate}` : ""}`}
          footer={
            <>
              {isAlreadyInvoiced && <button type="button" onClick={() => onDownloadPdf?.(order)} className="flex min-h-11 items-center gap-2 rounded-xl border border-[#2d4a27] bg-white px-4 py-2.5 text-xs font-bold text-[#2d4a27] hover:bg-[#edf3eb]"><Download className="size-4" /> Télécharger le PDF</button>}
              <button type="button" onClick={onClose} className="min-h-11 rounded-xl bg-[#f0eae1] px-5 py-2.5 text-xs font-bold text-[#2c2825] hover:bg-[#e4dcce]">Fermer</button>
              {!isAlreadyInvoiced && <button type="submit" form="invoice-form" className="min-h-11 rounded-xl bg-[#2d4a27] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#233a1e]">Valider la facture</button>}
            </>
          }
        >
          <form id="invoice-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              {itemsWithSubtotals.map((item) => (
                <div key={item.id} className="flex flex-wrap items-start justify-between gap-2 text-sm text-[#2c2825]">
                  <div>
                    <div>{item.itemName} · {item.effectiveQty} {item.unit} × {item.averageUnitPrice.toFixed(2)} € <span className="text-xs text-gray-500">(prix moyen)</span></div>
                    {item.hasDeliveryDetails && <div className="mt-0.5 text-xs text-gray-500">Prévu : {item.expectedQty} {item.unit} · livré : {item.effectiveQty} {item.unit}{item.gap !== 0 && <span className="font-semibold text-[#c85a32]"> · écart : {item.gap}</span>}</div>}
                  </div>
                  <span className="font-bold">{item.subtotal.toFixed(2)} €</span>
                </div>
              ))}
            </div>
            <hr className="border-t border-[#e2dacb]" />
            <div className="flex items-center justify-between text-base font-extrabold text-[#2c2825]"><span>Total</span><span className="text-lg">{totalAmount.toFixed(2)} €</span></div>
            <div className="space-y-1.5 pt-2">
              <label htmlFor="invoice-payment-method" className="block text-xs font-bold text-[#2c2825]">Mode de paiement</label>
              <select id="invoice-payment-method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} disabled={isAlreadyInvoiced} className="w-full cursor-pointer rounded-xl border border-[#e2dacb] bg-[#f5f2eb]/70 px-3.5 py-2.5 text-sm font-medium text-[#2c2825] focus:border-[#2d4a27] focus:outline-none">
                {PAYMENT_METHODS.map((method) => <option key={method} value={method}>{method}</option>)}
              </select>
            </div>
          </form>
        </AppDialogContent>
      )}
    </Dialog>
  );
}
