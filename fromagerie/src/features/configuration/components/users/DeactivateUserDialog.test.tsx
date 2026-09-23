import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { UserAccount } from "../../api/userApi";
import { DeactivateUserDialog } from "./DeactivateUserDialog";

afterEach(cleanup);

const account: UserAccount = { id: 3, username: "seller", nom: "Marie", role: "VENTE", actif: true };

describe("DeactivateUserDialog", () => {
  it("annule sans désactiver le compte", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(<DeactivateUserDialog account={account} onCancel={onCancel} onConfirm={onConfirm} />);

    expect(screen.getByRole("alertdialog", { name: "Confirmer la désactivation" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Annuler" }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("garde la confirmation ouverte pendant la désactivation", async () => {
    const user = userEvent.setup();
    let finish: () => void = () => {};
    const onConfirm = vi.fn().mockImplementation(() => new Promise<void>((resolve) => { finish = resolve; }));
    render(<DeactivateUserDialog account={account} onCancel={vi.fn()} onConfirm={onConfirm} />);

    await user.click(screen.getByRole("button", { name: "Désactiver" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(screen.getByRole("alertdialog", { name: "Confirmer la désactivation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Désactivation..." })).toBeDisabled();
    finish();
  });
});
