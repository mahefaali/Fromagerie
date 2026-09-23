import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CreateOrderModal } from "./CreateOrderModal";

afterEach(cleanup);

const props = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  onCreateClient: vi.fn(),
  clients: [{ id: 1, nom: "Épicerie", typeClient: "EPICERIE", telephone: null, adresse: null, actif: true }],
  fromages: [{ id: 42, nom: "Tomme" }],
};

describe("CreateOrderModal", () => {
  it("crée une commande avec une quantité et un prix saisis dans les champs texte numériques", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CreateOrderModal {...props} onSubmit={onSubmit} />);

    expect(screen.getByRole("dialog", { name: "Nouvelle commande" })).toBeInTheDocument();
    await user.selectOptions(screen.getByRole("combobox", { name: "Client" }), "Épicerie");
    await user.selectOptions(screen.getByRole("combobox", { name: "Fromage de la ligne 1" }), "42");
    const quantity = screen.getByRole("textbox", { name: "Quantité de la ligne 1" });
    const price = screen.getByRole("textbox", { name: "Prix unitaire de la ligne 1" });
    expect(quantity).toHaveAttribute("type", "text");
    expect(price).toHaveAttribute("type", "text");
    await user.clear(quantity);
    expect(screen.getByRole("button", { name: "Créer la commande" })).toBeDisabled();
    await user.type(quantity, "3");
    await user.clear(price);
    await user.type(price, "8,50");
    await user.click(screen.getByRole("button", { name: "Créer la commande" }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      clientName: "Épicerie",
      items: [{ id: "42", productName: "Tomme", quantity: 3, unit: "u", pricePerUnit: 8.5 }],
    }));
  });

  it("ferme avec Échap sans créer de commande", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSubmit = vi.fn();
    render(<CreateOrderModal {...props} onClose={onClose} onSubmit={onSubmit} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
