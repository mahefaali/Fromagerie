import type { CommandeApi } from "../api/stockApi";
import type { Order } from "../types/orders";

const statusMap: Record<string, Order['status']> = { BROUILLON: 'draft', CONFIRMEE: 'reserved', EN_PREPARATION: 'reserved', PRETE: 'prepared', LIVREE: 'delivered', ANNULEE: 'cancelled' };
export const paymentMethodMap: Record<string, string> = { VIREMENT: 'Virement', CARTE: 'Carte bancaire', ESPECES: 'Espèces', CHEQUE: 'Chèque', AUTRE: 'Autre' };
export function toOrder(o: CommandeApi): Order {
  const deliveryLines = new Map((o.livraison?.lignes ?? []).map((line) => [line.reservationId, line]));
  return {
    id: String(o.id),
    code: o.numeroCommande,
    clientName: o.client.nom,
    contactInfo: o.client.telephone ?? undefined,
    status: statusMap[o.statut] ?? 'draft',
    orderDate: o.dateCommande,
    expectedDeliveryDate: o.dateLivraisonSouhaitee,
    deliveryDate: o.livraison?.dateLivraison,
    deliveryId: o.livraison?.id,
    deliveryNumber: o.livraison?.numeroLivraison,
    invoicedDate: o.facture?.dateFacture,
    invoiceId: o.facture?.id,
    invoiceNumber: o.facture?.numeroFacture,
    invoicedTotal: o.facture ? Number(o.facture.total) : undefined,
    paymentMethod: o.facture ? (paymentMethodMap[o.facture.modePaiement] ?? o.facture.modePaiement) : undefined,
    note: o.observations ?? undefined,
    totalAmount: o.lignes.reduce((sum, line) => sum + line.quantiteCommandee * Number(line.prixUnitaire), 0),
    items: o.lignes.flatMap((line) => line.reservations.length
      ? line.reservations.map((reservation) => {
          const delivered = deliveryLines.get(reservation.id);
          return {
            id: String(reservation.id),
            reservationId: reservation.id,
            lineId: String(line.id),
            name: line.fromageNom,
            productName: line.fromageNom,
            quantity: reservation.quantiteReservee,
            deliveredQuantity: delivered?.quantiteLivree,
            gap: delivered?.ecart,
            unit: 'u',
            pricePerUnit: Number(line.prixUnitaire),
            stockId: reservation.stockId,
            batchCode: reservation.lot,
            location: reservation.emplacement,
          };
        })
      : [{
          id: String(line.id),
          lineId: String(line.id),
          name: line.fromageNom,
          productName: line.fromageNom,
          quantity: line.quantiteCommandee,
          unit: 'u',
          pricePerUnit: Number(line.prixUnitaire),
        }]),
  };
}
