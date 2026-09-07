import type { StockFromageFini, StockLossApi } from "../api/stockApi";
import type { Order, OrderItem } from "../types/orders";
import type { LossCauseSummary, LossLogEntry, MonthlyLossRate, OrderReturns } from "./unsoldLoss.types";

export function orderItemKey(item: OrderItem): string {
  return String(item.reservationId ?? item.id ?? item.name ?? item.productName ?? "Fromage");
}

export function mapLossToLogEntry(loss: StockLossApi): LossLogEntry {
  return {
    id: String(loss.id),
    cheeseName: loss.fromageNom,
    badgeText: loss.typePerte === "RETOUR_CLIENT" ? "Invendu retourné" : loss.typePerte,
    dateFormatted: new Date(loss.dateHeure).toLocaleDateString("fr-FR"),
    dateIso: loss.dateHeure,
    lotNumber: loss.numeroLot,
    orderNumber: "Interne",
    clientName: "Stock",
    reason: loss.motif,
    quantity: loss.quantite,
    unitCost: Number(loss.coutUnitaireReference),
    totalCost: Number(loss.coutTotal),
  };
}

export function rebuildPersistedReturns(orders: Order[], losses: StockLossApi[]): OrderReturns {
  const returnedByStock = sumReturns(losses, (loss) => loss.stockId);
  const returnedByReservation = sumReturns(losses.filter((loss) => loss.reservationId != null), (loss) => loss.reservationId!);
  const returnedByLot = sumReturns(losses.filter((loss) => loss.reservationId == null), (loss) => loss.numeroLot);
  const remainingByStock = { ...returnedByStock };
  const remainingByLot = { ...returnedByLot };

  return [...orders].reverse().reduce<OrderReturns>((result, order) => {
    const items = order.items.reduce<Record<string, number>>((quantities, item) => {
      const delivered = Number(item.deliveredQuantity ?? item.quantity ?? 0);
      const available = item.stockId ? remainingByStock[item.stockId] ?? 0 : 0;
      const lotAvailable = item.batchCode ? remainingByLot[item.batchCode] ?? 0 : 0;
      const quantity = item.reservationId != null
        ? Math.min(delivered, returnedByReservation[item.reservationId] ?? 0)
        : item.batchCode && lotAvailable > 0
          ? Math.min(delivered, lotAvailable)
          : Math.min(delivered, available);

      if (item.reservationId == null && item.batchCode && lotAvailable > 0) {
        remainingByLot[item.batchCode] = lotAvailable - quantity;
      } else if (item.stockId && item.reservationId == null) {
        remainingByStock[item.stockId] = available - quantity;
      }
      if (quantity > 0) quantities[orderItemKey(item)] = quantity;
      return quantities;
    }, {});
    if (Object.keys(items).length > 0) result[order.id] = { returnCount: 1, items };
    return result;
  }, {});
}

export function calculateMonthlyLossRates(stocks: StockFromageFini[], losses: LossLogEntry[]): MonthlyLossRate[] {
  const rows = new Map<string, Omit<MonthlyLossRate, "monthLabel" | "lossRate">>();
  stocks.forEach((stock) => updateMonthlyRow(rows, stock.fromageNom, stock.dateEntreeStock?.slice(0, 7), Number(stock.quantiteInitiale ?? 0), 0, 0));
  losses.forEach((loss) => updateMonthlyRow(rows, loss.cheeseName, loss.dateIso?.slice(0, 7), 0, loss.quantity, loss.totalCost));
  return [...rows.values()].map((row) => ({
    ...row,
    lossRate: row.enteredQuantity > 0 ? row.lostQuantity / row.enteredQuantity * 100 : 0,
    monthLabel: new Date(`${row.month}-01T00:00:00`).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
  })).sort((a, b) => b.month.localeCompare(a.month) || a.cheeseName.localeCompare(b.cheeseName, "fr"));
}

export function summarizeLossCauses(losses: LossLogEntry[]): LossCauseSummary[] {
  const rows = losses.reduce<Record<string, LossCauseSummary>>((result, loss) => {
    const key = `${loss.cheeseName}-${loss.badgeText}`;
    const row = result[key] ?? { name: loss.cheeseName, badgeText: loss.badgeText, totalQty: 0, totalCost: 0 };
    row.totalQty += loss.quantity;
    row.totalCost += loss.totalCost;
    result[key] = row;
    return result;
  }, {});
  return Object.values(rows);
}

function sumReturns<K extends string | number>(losses: StockLossApi[], keyOf: (loss: StockLossApi) => K): Record<K, number> {
  return losses.reduce((result, loss) => {
    if (loss.typePerte === "RETOUR_CLIENT") {
      const key = keyOf(loss);
      result[key] = (result[key] ?? 0) + loss.quantite;
    }
    return result;
  }, {} as Record<K, number>);
}

function updateMonthlyRow(rows: Map<string, Omit<MonthlyLossRate, "monthLabel" | "lossRate">>, cheeseName: string, month: string | undefined, entered: number, lost: number, cost: number) {
  if (!month) return;
  const key = `${cheeseName.trim().toLowerCase()}::${month}`;
  const row = rows.get(key) ?? { cheeseName, month, enteredQuantity: 0, lostQuantity: 0, lostCost: 0 };
  row.enteredQuantity += entered;
  row.lostQuantity += lost;
  row.lostCost += cost;
  rows.set(key, row);
}
