import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { NumericInput, NumericTextInput } from "./numeric-input";

afterEach(cleanup);

function Example() {
  const [value, setValue] = useState<number | null>(5);
  return <NumericInput aria-label="Quantité" value={value} onValueChange={setValue} min={0} precision={2} />;
}

function TextExample() {
  const [value, setValue] = useState("");
  return <NumericTextInput aria-label="Coût" value={value} onValueChange={setValue} min={0.01} precision={2} />;
}

describe("NumericInput", () => {
  it("reste éditable après effacement et accepte une décimale avec virgule", async () => {
    const user = userEvent.setup();
    render(<Example />);
    const input = screen.getByRole("textbox", { name: "Quantité" });

    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("inputmode", "decimal");
    await user.clear(input);
    expect(input).toHaveValue("");
    await user.type(input, "3,25");
    expect(input).toHaveValue("3.25");
  });

  it("rejette les caractères non numériques", async () => {
    const user = userEvent.setup();
    render(<Example />);
    const input = screen.getByRole("textbox", { name: "Quantité" });

    await user.clear(input);
    await user.type(input, "-4a");
    expect(input).toHaveValue("4");
  });

  it("permet de saisir progressivement une décimale avec minimum dans un formulaire texte", async () => {
    const user = userEvent.setup();
    render(<TextExample />);
    const input = screen.getByRole("textbox", { name: "Coût" });

    await user.type(input, "0,25");
    expect(input).toHaveValue("0.25");
  });

  it("accepte une température négative lorsque le champ est signé", async () => {
    const user = userEvent.setup();
    render(<NumericInput aria-label="Température" value={null} onValueChange={() => {}} signed precision={2} />);
    const input = screen.getByRole("textbox", { name: "Température" });

    await user.type(input, "-2,5");
    expect(input).toHaveValue("-2,5");
  });
});
