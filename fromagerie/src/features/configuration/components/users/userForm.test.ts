import { describe, expect, it } from "vitest";

import type { UserAccount } from "../../api/userApi";
import { emptyUserForm, formFromAccount, validateUserForm } from "./userForm";

describe("user form utilities", () => {
  it("prépare un formulaire d’édition sans exposer le credential", () => {
    const account: UserAccount = { id: 1, username: "owner", nom: "Propriétaire", role: "PROPRIETAIRE", actif: true };

    expect(formFromAccount(account)).toEqual({
      username: "owner",
      nom: "Propriétaire",
      role: "PROPRIETAIRE",
      actif: true,
      credential: "",
    });
  });

  it("exige le username et le credential à la création", () => {
    expect(validateUserForm({ ...emptyUserForm, nom: "Opérateur" }, false)).toBe("Le nom et le username sont obligatoires");
    expect(validateUserForm({ ...emptyUserForm, nom: "Opérateur", username: "operator" }, false)).toBe("Le mot de passe ou PIN est obligatoire");
  });

  it("autorise un credential vide pendant une modification", () => {
    expect(validateUserForm({ ...emptyUserForm, nom: "Opérateur" }, true)).toBeNull();
  });
});
