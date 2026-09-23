import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import UserMenu from "./UserMenu";

const mocks = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  logoutMock: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mocks.navigateMock,
  };
});

vi.mock("../../features/authentication/hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      id: 1,
      username: "gilles.demo",
      nom: "Gilles Payet Démo",
      role: "PROPRIETAIRE",
    },
    logout: mocks.logoutMock,
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("UserMenu", () => {
  it("affiche l'initiale et ferme le menu quand on clique ailleurs", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <div>
          <UserMenu />
          <button type="button">Bouton externe</button>
        </div>
      </MemoryRouter>,
    );

    const avatar = screen.getByRole("button", { name: "Menu de Gilles Payet Démo" });
    expect(avatar).toHaveTextContent("G");
    await user.click(avatar);
    expect(screen.getByText("gilles.demo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Voir mon profil" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Se déconnecter" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Bouton externe" }));

    expect(screen.queryByRole("button", { name: "Voir mon profil" })).not.toBeInTheDocument();
  });

  it("ouvre la fiche du profil et demande confirmation avant la déconnexion", async () => {
    const user = userEvent.setup();
    mocks.logoutMock.mockResolvedValue(undefined);
    render(<MemoryRouter><UserMenu /></MemoryRouter>);

    await user.click(screen.getByRole("button", { name: "Menu de Gilles Payet Démo" }));
    await user.click(screen.getByRole("button", { name: "Voir mon profil" }));
    expect(screen.getByRole("dialog", { name: "Mon profil" })).toHaveTextContent("Propriétaire");

    await user.click(screen.getByRole("button", { name: "Fermer" }));
    await user.click(screen.getByRole("button", { name: "Menu de Gilles Payet Démo" }));
    await user.click(screen.getByRole("button", { name: "Se déconnecter" }));
    expect(screen.getByRole("alertdialog", { name: "Se déconnecter ?" })).toBeInTheDocument();
    expect(mocks.logoutMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Annuler" }));
    expect(mocks.logoutMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Menu de Gilles Payet Démo" }));
    await user.click(screen.getByRole("button", { name: "Se déconnecter" }));
    await user.click(screen.getByRole("button", { name: "Confirmer la déconnexion" }));
    await waitFor(() => expect(mocks.logoutMock).toHaveBeenCalledOnce());
    await waitFor(() => expect(mocks.navigateMock).toHaveBeenCalledWith("/login", { replace: true }));
  });
});
