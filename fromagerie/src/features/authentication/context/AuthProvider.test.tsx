import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuth } from "../hooks/useAuth";
import { AuthProvider } from "./AuthProvider";

const mocks = vi.hoisted(() => ({
  me: vi.fn(),
}));

vi.mock("../api/authApi", () => ({
  authApi: {
    me: mocks.me,
  },
}));

vi.mock("../../../services/http/sessionEvents", () => ({
  onUnauthorized: vi.fn(() => () => undefined),
}));

function AuthStatusProbe() {
  const { status } = useAuth();
  return <p>{status}</p>;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AuthProvider", () => {
  it("quitte l'état de chargement lorsque la restauration de session échoue", async () => {
    mocks.me.mockRejectedValueOnce(new TypeError("Network error"));

    render(
      <AuthProvider>
        <AuthStatusProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText("anonymous")).toBeInTheDocument());
    expect(mocks.me).toHaveBeenCalledOnce();
  });
});
