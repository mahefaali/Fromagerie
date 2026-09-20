import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MilkLotCreateDialog } from "./MilkLotCreateDialog";

describe("MilkLotCreateDialog", () => {
  it("affiche et transmet le coût unitaire en €/L", async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    render(<MilkLotCreateDialog open onOpenChange={vi.fn()} onCreate={onCreate} />);
    expect(screen.getByLabelText("Coût unitaire du lait (€/L)")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Numéro du lot"), { target: { value: "LAIT-1" } });
    fireEvent.change(screen.getByLabelText("Quantité collectée (L)"), { target: { value: "120" } });
    fireEvent.change(screen.getByLabelText("Coût unitaire du lait (€/L)"), { target: { value: "1.25" } });
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer le lot" }));
    await waitFor(() => expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ coutUnitaire: 1.25 })));
  });
});
