import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { PageTabsPortal } from "./components/PageTabsPortal";
import { AppLayout } from "./AppLayout";

vi.mock("../features/authentication/hooks/useAuth", () => ({
  useAuth: () => ({ user: { nom: "Alex Démo", username: "alex.demo", role: "FABRICATION" }, logout: vi.fn() }),
}));

afterEach(cleanup);

function RegisterPage() {
  return <>
    <PageTabsPortal><button type="button">Onglet du registre</button></PageTabsPortal>
    <button type="button">Action du registre</button>
  </>;
}

describe("sous-navigation de l'application", () => {
  it("se réduit après un clic dans la page et se rouvre depuis la navigation principale", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/fabrication"]}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/fabrication" element={<RegisterPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    const subnavigation = screen.getByLabelText("Sous-navigation de la page");
    expect(subnavigation).toHaveClass("flex");

    await user.click(screen.getByRole("button", { name: "Action du registre" }));
    expect(subnavigation).toHaveClass("hidden");
    expect(screen.getByRole("button", { name: "Afficher la sous-navigation" })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Production" }));
    expect(subnavigation).toHaveClass("flex");

    await user.click(screen.getByRole("button", { name: "Onglet du registre" }));
    expect(subnavigation).toHaveClass("flex");

    fireEvent.scroll(window);
    expect(subnavigation).toHaveClass("hidden");
    await user.click(screen.getByRole("link", { name: "Production" }));
    expect(subnavigation).toHaveClass("flex");
  });
});
