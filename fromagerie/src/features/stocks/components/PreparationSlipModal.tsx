import { Download, MapPin } from "lucide-react";

import { AppDialogContent } from "../../../components/ui/app-dialog";
import { Dialog } from "../../../components/ui/dialog";
import type { Order } from "../types/orders";

interface PreparationSlipModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onMarkAsPrepared?: (orderId: string) => void;
  onDownloadPdf?: (order: Order) => void;
}

export function PreparationSlipModal({ isOpen, order, onClose, onMarkAsPrepared, onDownloadPdf }: PreparationSlipModalProps) {
  const isAlreadyPrepared = order?.status === "prepared" || order?.status === "delivered";

  const handleConfirmPrepared = () => {
    if (!order) return;
    onMarkAsPrepared?.(order.id);
    onClose();
  };

  return (
    <Dialog open={isOpen && order !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      {order && (
        <AppDialogContent
          title={`Bon de préparation — ${order.code || order.id}`}
          description={`${order.clientName} · livraison le ${order.expectedDeliveryDate}`}
          footer={
            <>
              <button type="button" onClick={() => onDownloadPdf?.(order)} className="flex min-h-11 items-center gap-2 rounded-xl border border-[#2d4a27] bg-white px-4 py-2.5 text-xs font-bold text-[#2d4a27] hover:bg-[#edf3eb]">
                <Download className="size-4" /> Télécharger le PDF
              </button>
              <button type="button" onClick={onClose} className="min-h-11 rounded-xl bg-[#f0eae1] px-5 py-2.5 text-xs font-bold text-[#2c2825] hover:bg-[#e4dcce]">Fermer</button>
              {!isAlreadyPrepared && <button type="button" onClick={handleConfirmPrepared} className="min-h-11 rounded-xl bg-[#2d4a27] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#233a1e]">Marquer préparée</button>}
            </>
          }
        >
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">À préparer</h3>
            <div className="space-y-3">
              {order.items?.map((item) => {
                const itemName = item.name || item.productName || "Article";
                const location = item.location || "Emplacement non attribué";
                const batchCode = item.batchCode || "Lot non attribué";
                return (
                  <div key={item.id} className="space-y-1.5 rounded-2xl border border-[#e2dacb]/80 bg-[#f5f2eb]/80 p-4">
                    <div className="text-sm font-extrabold text-[#2c2825]">{item.quantity} {item.unit} {itemName}</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <MapPin className="size-3.5 shrink-0 text-gray-500" />
                      <span>→ {location} · Lot {batchCode} ({item.quantity})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </AppDialogContent>
      )}
    </Dialog>
  );
}
