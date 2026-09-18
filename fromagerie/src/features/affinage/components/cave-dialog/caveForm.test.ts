import { describe, expect, it } from "vitest";

import type { Cave } from "../../domain/cave";
import { buildCaveFromForm, initialCaveForm, normalizedShelves } from "./caveForm";

describe("cave form utilities", () => {
  it("copie la configuration initiale sans partager le tableau d’étagères", () => {
    const cave = existingCave();
    const form = initialCaveForm(cave);

    expect(form.nom).toBe("Cave principale");
    expect(form.etageres).not.toBe(cave.etageres);
    expect(form.etageres[0]).not.toBe(cave.etageres[0]);
  });

  it("normalise les références et les dimensions des étagères", () => {
    expect(normalizedShelves([
      { label: " a ", nbRangees: 0, nbPositions: 3 },
      { label: "  ", nbRangees: 2, nbPositions: 2 },
    ])).toEqual([{ label: "A", nbRangees: 1, nbPositions: 3, rangees: undefined }]);
  });

  it("recalcule la capacité disponible après une modification de structure", () => {
    const cave = existingCave();
    const result = buildCaveFromForm({ ...initialCaveForm(cave), etageres: [{ label: "A", nbRangees: 3, nbPositions: 4 }] }, cave);

    expect(result).toMatchObject({ id: "1", capaciteOccupee: 2, capaciteDisponible: 10 });
    expect(result?.emplacements).toHaveLength(12);
  });

  it("refuse une plage d’âge incohérente", () => {
    const form = { ...initialCaveForm(null), nom: "Test", ageMinJours: 30, ageMaxJours: 10 };
    expect(buildCaveFromForm(form, null)).toBeNull();
  });
});

function existingCave(): Cave {
  return {
    id: "1", nom: "Cave principale", description: "", etageres: [{ label: "A", nbRangees: 2, nbPositions: 4 }],
    temperatureCible: 12, humiditeCible: 90, ageMinJours: 1, ageMaxJours: 30, active: true,
    capaciteOccupee: 2, capaciteDisponible: 6, emplacements: [],
  };
}
