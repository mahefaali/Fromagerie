import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { PublicOnlyRoute } from "./PublicOnlyRoute";

const useAuthMock = vi.hoisted(() => vi.fn());

vi.mock("../features/authentication/hooks/useAuth", () => ({
  useAuth: useAuthMock,
}));

function renderLoginRoute() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<p>Page de connexion</p>} />
        </Route>
        <Route path="/home" element={<p>Page d'accueil</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  useAuthMock.mockReset();
});

describe("PublicOnlyRoute", () => {
  it("attend la vérification de session avant de rendre la route", () => {
    useAuthMock.mockReturnValue({ status: "loading" });

    renderLoginRoute();

    expect(screen.getByRole("status")).toHaveTextContent("Vérification de la session...");
    expect(screen.queryByText("Page de connexion")).not.toBeInTheDocument();
  });

  it("affiche la connexion à un utilisateur anonyme", () => {
    useAuthMock.mockReturnValue({ status: "anonymous" });

    renderLoginRoute();

    expect(screen.getByText("Page de connexion")).toBeInTheDocument();
  });

  it("redirige un utilisateur authentifié vers l'accueil", () => {
    useAuthMock.mockReturnValue({ status: "authenticated" });

    renderLoginRoute();

    expect(screen.getByText("Page d'accueil")).toBeInTheDocument();
    expect(screen.queryByText("Page de connexion")).not.toBeInTheDocument();
  });
});
