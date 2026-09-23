import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { stockApi, type StockFromageFini } from "../api/stockApi";
import { DeclareImproperModal } from "./DeclareImproperModal";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("DeclareImproperModal", () => {
  it("affiche un champ numérique éditable et bloque une quantité vide", async () => {
    vi.spyOn(stockApi, "findStocks").mockResolvedValue([{ id: 7, fromageNom: "Tomme", numeroLotFabrication: "LOT-7", quantitePhysique: 5 }] as StockFromageFini[]);
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(true);
    const onClose = vi.fn();
    render(<DeclareImproperModal isOpen onClose={onClose} onSubmit={onSubmit} />);

    expect(screen.getByRole("combobox", { name: "Lot en stock" })).toBeInTheDocument();
    const quantity = screen.getByRole("textbox", { name: "Quantité perdue" });
    expect(quantity).toHaveAttribute("type", "text");
    await user.clear(quantity);
    expect(screen.getByRole("button", { name: "Déclarer la perte" })).toBeDisabled();
    await user.type(quantity, "3");
    expect(quantity).toHaveValue("3");
    expect(onSubmit).not.toHaveBeenCalled();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });
});
