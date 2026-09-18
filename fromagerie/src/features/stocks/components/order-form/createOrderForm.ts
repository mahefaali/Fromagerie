import type { CreateOrderItemInput, CreateOrderPayload } from "../../types/orders";

export interface OrderFormItem extends Omit<CreateOrderItemInput, "id"> {
  rowId: string;
  cheeseId: string;
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
  return items.some((item) => !item.cheeseId || item.quantity <= 0 || item.unit !== "u");
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
    items: values.items.map(({ rowId: _rowId, cheeseId, ...item }) => ({ ...item, id: cheeseId })),
  };
}
