import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AddCareDialog } from "./AddCareDialog";

afterEach(cleanup);

function tomorrow(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function renderDialog(onSubmitCare = vi.fn()) {
  render(
    <AddCareDialog
      open
      minimumDate="2025-05-10"
      onOpenChange={vi.fn()}
      onSubmitCare={onSubmitCare}
    />,
  );
  return onSubmitCare;
}

describe("AddCareDialog", () => {
  it("expose les dates de mise en affinage et du jour comme bornes", () => {
    renderDialog();

    const dateInput = screen.getByLabelText("Date");
    expect(dateInput).toHaveAttribute("min", "2025-05-10");
    expect(dateInput).toHaveAttribute("max");
  });

  it("refuse une date antérieure à la mise en affinage", () => {
    const onSubmitCare = renderDialog();
    const dateInput = screen.getByLabelText("Date");

    fireEvent.change(dateInput, { target: { value: "2025-05-09" } });
    fireEvent.submit(screen.getByRole("button", { name: "Enregistrer" }).closest("form")!);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "La date du soin ne peut pas être antérieure à la mise en affinage.",
    );
    expect(onSubmitCare).not.toHaveBeenCalled();
  });

  it("refuse une date postérieure à aujourd'hui", () => {
    const onSubmitCare = renderDialog();
    const dateInput = screen.getByLabelText("Date");

    fireEvent.change(dateInput, { target: { value: tomorrow() } });
    fireEvent.submit(screen.getByRole("button", { name: "Enregistrer" }).closest("form")!);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "La date du soin ne peut pas être postérieure à aujourd’hui.",
    );
    expect(onSubmitCare).not.toHaveBeenCalled();
  });
});
