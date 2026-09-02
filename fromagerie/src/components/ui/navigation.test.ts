import { describe, expect, it } from "vitest";

import { navItems } from "./navigationItems";

describe("navigation rentabilité", () => {
  it("affiche la page au propriétaire uniquement", () => {
    const profitability = navItems.find((item) => item.to === "/rentabilite");

    expect(profitability?.label).toBe("Rentabilité");
    expect(profitability?.roles).toEqual(["PROPRIETAIRE"]);
    expect(profitability?.roles).not.toContain("FABRICATION");
    expect(profitability?.roles).not.toContain("VENTE");
  });
});
