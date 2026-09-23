import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Order } from "../types/orders";
import { OrderCard } from "./OrderCard";

afterEach(cleanup);

const order: Order = {
  id: "42", code: "CMD-42", clientName: "Épicerie", status: "reserved", expectedDeliveryDate: "2026-09-30", items: [],
};

describe("OrderCard", () => {
  it("annule puis confirme la suppression dans une boîte de dialogue", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<OrderCard order={order} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "Supprimer la commande CMD-42" }));
    expect(screen.getByRole("alertdialog", { name: /Supprimer la commande/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Annuler" }));
    expect(onDelete).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Supprimer la commande CMD-42" }));
    await user.click(screen.getByRole("button", { name: "Confirmer la suppression" }));
    expect(onDelete).toHaveBeenCalledWith("42");
  });
});
