import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Order } from "../types/orders";
import { RegisterDeliveryModal } from "./RegisterDeliveryModal";

const order: Order = {
  id: "42",
  code: "CMD-42",
  clientName: "Épicerie du village",
  status: "prepared",
  expectedDeliveryDate: "2026-09-30",
  items: [{ id: "item-1", name: "Tomme", quantity: 5, unit: "u", pricePerUnit: 5 }],
};

describe("RegisterDeliveryModal", () => {
  it("transmet la quantité livrée, son écart et la note depuis le pied de fenêtre", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSubmit = vi.fn();
    render(<RegisterDeliveryModal isOpen order={order} onClose={onClose} onSubmit={onSubmit} />);

    expect(screen.getByRole("dialog", { name: "Enregistrer la livraison — CMD-42" })).toBeInTheDocument();
    const quantity = screen.getByRole("textbox", { name: "Livré (u) — Tomme" });
    await user.clear(quantity);
    await user.type(quantity, "3");
    await user.type(screen.getByRole("textbox", { name: "Note de livraison" }), "Deux pièces manquantes");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      orderId: "42",
      deliveryNote: "Deux pièces manquantes",
      deliveredItems: [{ itemId: "item-1", deliveredQuantity: 3, gap: -2 }],
    }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("ferme avec Échap sans enregistrer", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSubmit = vi.fn();
    render(<RegisterDeliveryModal isOpen order={order} onClose={onClose} onSubmit={onSubmit} />);

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
