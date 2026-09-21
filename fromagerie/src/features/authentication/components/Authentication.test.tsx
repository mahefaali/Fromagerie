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

    expect(screen.getByText("Compte démo")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Choisir un compte de démonstration" })).toBeInTheDocument();
  });

  it("sélectionne le propriétaire sans dévoiler son mot de passe", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("combobox", { name: "Choisir un compte de démonstration" }));
    await user.click(screen.getByRole("option", { name: /Propriétaire démo/ }));

    expect(screen.getByLabelText("Nom d'utilisateur")).toHaveValue("gilles.demo");
    expect(screen.getByLabelText("Mot de passe")).toHaveValue("");
    expect(loginMock).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Mot de passe"), "mot-de-passe-local");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        username: "gilles.demo",
        password: "mot-de-passe-local",
      });
    });
  });

  it("sélectionne l'employé sans dévoiler son PIN", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("combobox", { name: "Choisir un compte de démonstration" }));
    await user.click(screen.getByRole("option", { name: /Fabrication démo/ }));

    expect(screen.getByLabelText("Nom d'utilisateur")).toHaveValue("jean.demo");
    expect(screen.getByLabelText("Code PIN")).toHaveValue("");
    expect(loginMock).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Code PIN"), "2468");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({ username: "jean.demo", password: "2468" });
    });
  });

  it("sélectionne le compte vente sans dévoiler son PIN", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("combobox", { name: "Choisir un compte de démonstration" }));
    await user.click(screen.getByRole("option", { name: /Vente démo/ }));

    expect(screen.getByLabelText("Nom d'utilisateur")).toHaveValue("nathalie.demo");
    expect(screen.getByLabelText("Code PIN")).toHaveValue("");
    expect(loginMock).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Code PIN"), "1357");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({ username: "nathalie.demo", password: "1357" });
    });
  });

  it("applique la bonne validation lors du passage d'un employé au propriétaire", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("combobox", { name: "Choisir un compte de démonstration" }));
    await user.click(screen.getByRole("option", { name: /Fabrication démo/ }));
    await user.type(screen.getByLabelText("Code PIN"), "2468");
    await user.click(screen.getByRole("combobox", { name: "Choisir un compte de démonstration" }));
    await user.click(screen.getByRole("option", { name: /Propriétaire démo/ }));
    expect(screen.getByLabelText("Mot de passe")).toHaveValue("");
    await user.type(screen.getByLabelText("Mot de passe"), "mot-de-passe-local");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        username: "gilles.demo",
        password: "mot-de-passe-local",
      });
    });
  });

  it("applique la bonne validation lors du passage du propriétaire à un employé", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("combobox", { name: "Choisir un compte de démonstration" }));
    await user.click(screen.getByRole("option", { name: /Propriétaire démo/ }));
    await user.type(screen.getByLabelText("Mot de passe"), "mot-de-passe-local");
    await user.click(screen.getByRole("combobox", { name: "Choisir un compte de démonstration" }));
    await user.click(screen.getByRole("option", { name: /Fabrication démo/ }));
    expect(screen.getByLabelText("Code PIN")).toHaveValue("");
    await user.type(screen.getByLabelText("Code PIN"), "2468");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({ username: "jean.demo", password: "2468" });
    });
  });

  it("affiche une règle explicite pour un mot de passe trop court", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("combobox", { name: "Choisir un compte de démonstration" }));
    await user.click(screen.getByRole("option", { name: /Propriétaire démo/ }));
    const passwordInput = screen.getByLabelText("Mot de passe");
    await user.clear(passwordInput);
    await user.type(passwordInput, "court");
    await user.tab();

    expect(await screen.findByText("Le mot de passe doit contenir au moins 8 caractères")).toBeInTheDocument();
  });

  it("affiche une règle explicite pour un code PIN invalide", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("combobox", { name: "Choisir un compte de démonstration" }));
    await user.click(screen.getByRole("option", { name: /Fabrication démo/ }));
    const pinInput = screen.getByLabelText("Code PIN");
    await user.clear(pinInput);
    await user.type(pinInput, "12ab");
    await user.tab();

    expect(await screen.findByText("Le code PIN doit contenir exactement 4 chiffres")).toBeInTheDocument();
  });
});
