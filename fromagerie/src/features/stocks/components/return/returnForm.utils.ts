import type { Order, OrderItem } from "../../types/orders";

export interface ReturnItemFormState {
  cheeseName: string;
  stockId?: number;
  reservationId?: number;
  deliveredQuantity: number;
  returnedQuantity: number;
  previousReturnedQuantity: number;
  actuallySold: number;
}

const cheeseName = (item: OrderItem): string => item.name ?? item.productName ?? "Fromage";

export function createReturnItems(order: Order): ReturnItemFormState[] {
  return order.items.map((item) => {
    const deliveredQuantity = Number(item.deliveredQuantity ?? item.quantity ?? 0);
    const previousReturnedQuantity = Number(item.returnedQuantity ?? 0);
    return {
      cheeseName: cheeseName(item),
      stockId: item.stockId,
      reservationId: item.reservationId,
      deliveredQuantity,
      returnedQuantity: 0,
      previousReturnedQuantity,
      actuallySold: deliveredQuantity - previousReturnedQuantity,
    };
  });
}

export function getOrderCheeseLabel(order: Order): string {
  return [...new Set(order.items.map(cheeseName))].join(", ");
}

export function updateReturnedQuantity(item: ReturnItemFormState, value: string): ReturnItemFormState {
  const requestedQuantity = Math.max(0, Number.parseInt(value, 10) || 0);
  const availableQuantity = Math.max(0, item.deliveredQuantity - item.previousReturnedQuantity);
  const returnedQuantity = Math.min(requestedQuantity, availableQuantity);
  return {
    ...item,
    returnedQuantity,
    actuallySold: availableQuantity - returnedQuantity,
  };
}

export function localDateToday(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}
