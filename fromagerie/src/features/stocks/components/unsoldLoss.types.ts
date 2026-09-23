import type { Order } from "../types/orders";

export interface ProductionCostItem {
  id: string;
  name: string;
  unitCost: number | string;
}

export interface AverageProductionCost {
  fromageId: number;
  cheeseName: string;
  lotCount: number;
  unitCount: number;
  averageUnitCost: number;
}

export interface LossLogEntry {
  id: string;
  cheeseName: string;
  badgeText: string;
  dateFormatted: string;
  dateIso: string;
  lotNumber: string;
  orderNumber: string;
  clientName: string;
  reason: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface OrderReturnData {
  returnCount: number;
  items: Record<string, number>;
}

export type OrderReturns = Record<string, OrderReturnData>;
export type ReturnOrder = Order;

export interface MonthlyLossRate {
  cheeseName: string;
  month: string;
  monthLabel: string;
  enteredQuantity: number;
  lostQuantity: number;
  lostCost: number;
  lossRate: number;
}

export interface LossCauseSummary {
  name: string;
  badgeText: string;
  totalQty: number;
  totalCost: number;
}
