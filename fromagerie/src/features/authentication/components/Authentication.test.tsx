import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { InnerCircleForm } from "./Authentication";

const { loginMock } = vi.hoisted(() => ({
  loginMock: vi.fn<() => Promise<void>>(),
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ login: loginMock }),
}));

function renderForm() {
  return render(
    <MemoryRouter>
      <InnerCircleForm />
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  loginMock.mockReset();
  loginMock.mockResolvedValue(undefined);
});

describe("comptes de démonstration", () => {
  it("affiche les comptes uniquement dans l'environnement de développement des tests", () => {
    renderForm();

    expect(screen.getByText("Comptes de démonstration")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Propriétaire démo/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Employé démo/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Vente démo/ })).toBeInTheDocument();
  });

  it("préremplit le propriétaire sans lancer la connexion", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: /Propriétaire démo/ }));

    expect(screen.getByLabelText("Nom d'utilisateur")).toHaveValue("gilles.demo");
    expect(screen.getByLabelText("Mot de passe")).toHaveValue("DemoFromagerie2026!");
    expect(loginMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        username: "gilles.demo",
        password: "DemoFromagerie2026!",
      });
    });
  });

  it("préremplit l'employé sans lancer la connexion", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: /Employé démo/ }));

    expect(screen.getByLabelText("Nom d'utilisateur")).toHaveValue("jean.demo");
    expect(screen.getByLabelText("Code PIN")).toHaveValue("1234");
    expect(loginMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({ username: "jean.demo", password: "1234" });
    });
  });

  it("préremplit le compte vente sans lancer la connexion", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: /Vente démo/ }));

    expect(screen.getByLabelText("Nom d'utilisateur")).toHaveValue("nathalie.demo");
    expect(screen.getByLabelText("Code PIN")).toHaveValue("5678");
    expect(loginMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({ username: "nathalie.demo", password: "5678" });
    });
  });
});
