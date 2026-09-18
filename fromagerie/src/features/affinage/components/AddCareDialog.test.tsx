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
      onOpenChange={vi.fn()}
      onSubmitCare={onSubmitCare}
    />,
  );
  return onSubmitCare;
}

describe("AddCareDialog", () => {
  it("fixe la date du soin au jour courant", () => {
    renderDialog();

    const dateInput = screen.getByLabelText("Date");
    expect(dateInput).toHaveValue(localDateToday());
    expect(dateInput).toHaveAttribute("min", localDateToday());
    expect(dateInput).toHaveAttribute("max", localDateToday());
    expect(dateInput).toHaveAttribute("readonly");
  });

  it("refuse une date antérieure à aujourd'hui", () => {
    const onSubmitCare = renderDialog();
    const dateInput = screen.getByLabelText("Date");

    fireEvent.change(dateInput, { target: { value: "2025-05-09" } });
    fireEvent.submit(screen.getByRole("button", { name: "Enregistrer" }).closest("form")!);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "La date du soin doit correspondre à la date du jour.",
    );
    expect(onSubmitCare).not.toHaveBeenCalled();
  });

  it("refuse une date postérieure à aujourd'hui", () => {
    const onSubmitCare = renderDialog();
    const dateInput = screen.getByLabelText("Date");

    fireEvent.change(dateInput, { target: { value: tomorrow() } });
    fireEvent.submit(screen.getByRole("button", { name: "Enregistrer" }).closest("form")!);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "La date du soin doit correspondre à la date du jour.",
    );
    expect(onSubmitCare).not.toHaveBeenCalled();
  });
});

function localDateToday(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
