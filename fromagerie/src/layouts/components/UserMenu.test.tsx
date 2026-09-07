import { cleanup, render, screen } from "@testing-library/react";
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
  it("se ferme quand on clique en dehors du menu", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <div>
          <UserMenu />
          <button type="button">Bouton externe</button>
        </div>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /ouvrir le menu de gilles payet démo/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Bouton externe" }));

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
