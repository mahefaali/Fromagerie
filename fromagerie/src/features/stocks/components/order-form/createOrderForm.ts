import type { CreateOrderItemInput, CreateOrderPayload } from "../../types/orders";

export interface OrderFormItem extends Omit<CreateOrderItemInput, "id" | "quantity" | "pricePerUnit"> {
  rowId: string;
  cheeseId: string;
  quantity: number | null;
  pricePerUnit: number | null;
}

export interface NewClientForm {
  nom: string;
  typeClient: string;
  telephone: string;
  adresse: string;
}

export const emptyNewClient: NewClientForm = {
  nom: "",
  typeClient: "EPICERIE",
  telephone: "",
  adresse: "",
};

export function localDateToday(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export function createOrderItem(rowId: string, pricePerUnit = 0): OrderFormItem {
  return { rowId, cheeseId: "", productName: "", quantity: 1, unit: "u", pricePerUnit };
}

export function hasInvalidOrderItems(items: OrderFormItem[]): boolean {
  return items.some((item) => !item.cheeseId || item.quantity === null || item.quantity <= 0 || item.pricePerUnit === null || item.pricePerUnit < 0 || item.unit !== "u");
}

export function toCreateOrderPayload(values: {
  clientName: string;
  contactInfo: string;
  expectedDeliveryDate: string;
  note: string;
  items: OrderFormItem[];
}): CreateOrderPayload {
  return {
    clientName: values.clientName,
    contactInfo: values.contactInfo,
    expectedDeliveryDate: values.expectedDeliveryDate,
    note: values.note,
    items: values.items.map(({ rowId: _rowId, cheeseId, quantity, pricePerUnit, ...item }) => ({ ...item, id: cheeseId, quantity: quantity ?? 0, pricePerUnit: pricePerUnit ?? 0 })),
  };
}
