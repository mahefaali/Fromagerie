import { describe, expect, it } from "vitest";

import type { Order } from "../../types/orders";
import {
  createReturnItems,
  getOrderCheeseLabel,
  updateReturnedQuantity,
  type ReturnItemFormState,
} from "./returnForm.utils";

describe("return form utilities", () => {
  it("prépare les articles à partir des quantités livrées et déjà retournées", () => {
    const items = createReturnItems(order());

    expect(items).toEqual([
      {
        cheeseName: "Tomme",
        stockId: 10,
        reservationId: 20,
        deliveredQuantity: 8,
        returnedQuantity: 0,
        previousReturnedQuantity: 2,
        actuallySold: 6,
      },
      {
        cheeseName: "Bleu",
        stockId: undefined,
        reservationId: undefined,
        deliveredQuantity: 3,
        returnedQuantity: 0,
        previousReturnedQuantity: 0,
        actuallySold: 3,
      },
    ]);
  });

  it("regroupe les noms de fromage sans doublon", () => {
    const source = order();
    source.items.push({ ...source.items[0], id: "3" });

    expect(getOrderCheeseLabel(source)).toBe("Tomme, Bleu");
  });

  it("borne le retour à la quantité encore disponible", () => {
    const item = returnItem();

    expect(updateReturnedQuantity(item, "20")).toMatchObject({
      returnedQuantity: 6,
      actuallySold: 0,
    });
    expect(updateReturnedQuantity(item, "-2")).toMatchObject({
      returnedQuantity: 0,
      actuallySold: 6,
    });
  });
});

function order(): Order {
  return {
    id: "order-1",
    clientName: "Épicerie",
    status: "delivered",
    expectedDeliveryDate: "2026-08-20",
    items: [
      {
        id: "1",
        name: "Tomme",
        quantity: 10,
        deliveredQuantity: 8,
        returnedQuantity: 2,
        unit: "u",
        pricePerUnit: 12,
        stockId: 10,
        reservationId: 20,
      },
      {
        id: "2",
        productName: "Bleu",
        quantity: 3,
        unit: "u",
        pricePerUnit: 15,
      },
    ],
  };
}

function returnItem(): ReturnItemFormState {
  return {
    cheeseName: "Tomme",
    deliveredQuantity: 8,
    returnedQuantity: 0,
    previousReturnedQuantity: 2,
    actuallySold: 6,
  };
}
