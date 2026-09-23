import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Order } from "../types/orders";
import { RegisterReturnModal } from "./RegisterReturnModal";

afterEach(cleanup);

const order: Order = {
  id: "42",
  clientName: "Épicerie",
  status: "delivered",
  expectedDeliveryDate: "2026-09-30",
  items: [{ id: "1", name: "Tomme", quantity: 5, deliveredQuantity: 5, unit: "u", pricePerUnit: 10, stockId: 7 }],
};

describe("RegisterReturnModal", () => {
  it("soumet la quantité retournée et recalcule la quantité vendue", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(true);
    const onClose = vi.fn();
    render(<RegisterReturnModal isOpen order={order} onClose={onClose} onSubmit={onSubmit} />);

    const quantity = screen.getByRole("textbox", { name: "Quantité retournée" });
    expect(quantity).toHaveAttribute("type", "text");
    await user.clear(quantity);
    expect(screen.getByRole("button", { name: "Enregistrer le retour" })).toBeDisabled();
    await user.type(quantity, "2");
    expect(screen.getByText("3")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Enregistrer le retour" }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ orderId: "42", items: [expect.objectContaining({ returnedQuantity: 2, actuallySold: 3 })] }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
