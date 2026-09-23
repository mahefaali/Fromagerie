import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Order } from "../types/orders";
import { PreparationSlipModal } from "./PreparationSlipModal";

const order: Order = {
  id: "42",
  code: "CMD-42",
  clientName: "Épicerie du village",
  status: "reserved",
  expectedDeliveryDate: "2026-09-30",
  items: [{ id: "1", name: "Tomme", quantity: 2, unit: "u", pricePerUnit: 5 }],
};

describe("PreparationSlipModal", () => {
  it("affiche la commande et valide sa préparation", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onMarkAsPrepared = vi.fn();
    render(<PreparationSlipModal isOpen order={order} onClose={onClose} onMarkAsPrepared={onMarkAsPrepared} />);

    expect(screen.getByRole("dialog", { name: "Bon de préparation — CMD-42" })).toBeInTheDocument();
    expect(screen.getByText("2 u Tomme")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Marquer préparée" }));
    expect(onMarkAsPrepared).toHaveBeenCalledWith("42");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("ferme avec Échap sans valider", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onMarkAsPrepared = vi.fn();
    render(<PreparationSlipModal isOpen order={order} onClose={onClose} onMarkAsPrepared={onMarkAsPrepared} />);

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
    expect(onMarkAsPrepared).not.toHaveBeenCalled();
  });
});
