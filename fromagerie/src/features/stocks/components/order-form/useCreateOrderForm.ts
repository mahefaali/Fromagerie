import { useEffect, useState, type FormEvent } from "react";

import type { ClientOption } from "../../api/stockApi";
import type { CreateOrderPayload } from "../../types/orders";
import { createOrderItem, emptyNewClient, hasInvalidOrderItems, localDateToday, toCreateOrderPayload, type NewClientForm, type OrderFormItem } from "./createOrderForm";

interface UseCreateOrderFormOptions {
  isOpen: boolean;
  fromages: Array<{ id: number; nom: string }>;
  onSubmit: (payload: CreateOrderPayload) => void;
  onCreateClient: (client: NewClientForm) => Promise<ClientOption | null>;
}

let nextRowId = 0;
const newRowId = () => `order-row-${++nextRowId}`;

export function useCreateOrderForm({ isOpen, fromages, onSubmit, onCreateClient }: UseCreateOrderFormOptions) {
  const [clientName, setClientName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(localDateToday);
  const [note, setNote] = useState("");
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState<NewClientForm>({ ...emptyNewClient });
  const [items, setItems] = useState<OrderFormItem[]>(() => [createOrderItem(newRowId(), 7.5)]);

  useEffect(() => {
    if (!isOpen) return;
    setClientName("");
    setContactInfo("");
    setExpectedDeliveryDate(localDateToday());
    setNote("");
    setShowNewClient(false);
    setNewClient({ ...emptyNewClient });
    setItems([createOrderItem(newRowId(), 7.5)]);
  }, [isOpen]);

  const addItem = () => setItems((current) => [...current, createOrderItem(newRowId())]);
  const removeItem = (rowId: string) => setItems((current) => current.length === 1 ? current : current.filter((item) => item.rowId !== rowId));
  const updateItem = <K extends keyof OrderFormItem>(rowId: string, field: K, value: OrderFormItem[K]) => {
    setItems((current) => current.map((item) => item.rowId === rowId ? { ...item, [field]: value } : item));
  };
  const selectCheese = (rowId: string, cheeseId: string) => {
    setItems((current) => current.map((item) => item.rowId === rowId ? {
      ...item,
      cheeseId,
      productName: fromages.find((cheese) => String(cheese.id) === cheeseId)?.nom ?? "",
      unit: "u",
    } : item));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!clientName.trim() || hasInvalidOrderItems(items)) return;
    onSubmit(toCreateOrderPayload({ clientName, contactInfo, expectedDeliveryDate, note, items }));
  };

  const createClient = async () => {
    if (!newClient.nom.trim()) return;
    const client = await onCreateClient(newClient);
    if (!client) return;
    setClientName(client.nom);
    setContactInfo(client.telephone ?? "");
    setNewClient({ ...emptyNewClient });
    setShowNewClient(false);
  };

  return {
    clientName, setClientName, contactInfo, setContactInfo, expectedDeliveryDate, setExpectedDeliveryDate,
    note, setNote, showNewClient, setShowNewClient, newClient, setNewClient, items,
    hasItemError: hasInvalidOrderItems(items), addItem, removeItem, updateItem, selectCheese, submit, createClient,
  };
}
