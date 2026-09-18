import { describe, expect, it } from "vitest";

import { createOrderItem, hasInvalidOrderItems, toCreateOrderPayload } from "./createOrderForm";

describe("create order form utilities", () => {
  it("sépare l’identifiant de ligne de l’identifiant du fromage", () => {
    const item = { ...createOrderItem("row-1", 7.5), cheeseId: "42", productName: "Tomme" };
    const payload = toCreateOrderPayload({ clientName: "Épicerie", contactInfo: "034", expectedDeliveryDate: "2026-09-10", note: "", items: [item] });

    expect(payload.items).toEqual([{ id: "42", productName: "Tomme", quantity: 1, unit: "u", pricePerUnit: 7.5 }]);
    expect(payload.items[0]).not.toHaveProperty("rowId");
  });

  it("refuse les lignes sans fromage ou avec une quantité invalide", () => {
    expect(hasInvalidOrderItems([createOrderItem("row-1")])).toBe(true);
    expect(hasInvalidOrderItems([{ ...createOrderItem("row-2"), cheeseId: "2", quantity: 0 }])).toBe(true);
    expect(hasInvalidOrderItems([{ ...createOrderItem("row-3"), cheeseId: "2", quantity: 3 }])).toBe(false);
  });
});
