import { describe, expect, it } from "vitest";

import {
  createValuesFromFabrication,
  calculateCheeseYield,
  cheeseYieldZone,
  toCreateFabricationRequest,
  validatePositiveInteger,
  validatePositiveNumber,
  validateTemperature,
  validateTemperatureRange,
  heatingTemperatureValidation,
  heatingDurationValidation,
  isExceptionallyLowCheeseCount,
  minimumCheeseWarningThreshold,
  toDrainageMinutes,
  validateDrainageDuration,
  type FabricationFormValues,
} from "./fabricationCreateForm.utils";

const values: FabricationFormValues = {
  dateHeureDebut: "2026-09-08T08:30",
  recetteId: "4",
  quantiteLait: "120",
  temperatureLait: "31.5",
  origineLait: "TRAITE_MATIN",
  temperatureChauffage: "38",
  dureeChauffageMinutes: "45",
  typePresure: " Présure animale ",
  quantitePresure: "12.5",
  typeFerments: " Ferments thermophiles ",
  quantiteFerments: "6",
  temperatureMiseEnMoule: "24",
  dureeEgouttageMinutes: "60",
  dureeEgouttageUnite: "MINUTES",
  poidsTotalFromages: "14.2",
  nombreFromages: "20",
  observations: "  Lot conforme  ",
};

describe("fabricationCreateForm.utils", () => {
  it("convertit les valeurs du formulaire vers le contrat API", () => {
    expect(toCreateFabricationRequest(values)).toMatchObject({
      recetteId: 4,
      quantiteLait: 120,
      temperatureLait: 31.5,
      typePresure: "Présure animale",
      observations: "Lot conforme",
    });
  });

  it("convertit une observation vide en null", () => {
    expect(toCreateFabricationRequest({ ...values, observations: "   " }).observations).toBeNull();
  });

  it("valide les nombres selon les contraintes métier", () => {
    expect(validatePositiveNumber("1.5", 2)).toBe(true);
    expect(validatePositiveNumber("0")).toBeTypeOf("string");
    expect(validatePositiveInteger("2", 3)).toBe(true);
    expect(validatePositiveInteger("2.5")).toBeTypeOf("string");
    expect(validateTemperature("38")).toBe(true);
    expect(validateTemperature("201")).toBeTypeOf("string");
    expect(validateTemperatureRange("15", 15, 45)).toBe(true);
    expect(validateTemperatureRange("31.5", 15, 45)).toBe(true);
    expect(validateTemperatureRange("45", 15, 45)).toBe(true);
    expect(validateTemperatureRange("14.9", 15, 45)).toBe("La température doit être comprise entre 15 et 45 °C.");
    expect(validateTemperatureRange("45.1", 15, 45)).toBe("La température doit être comprise entre 15 et 45 °C.");
  });

  it("valide la température de chauffage entre 26 et 48 °C inclus", () => {
    const validate = heatingTemperatureValidation.validate as (value: string) => true | string;
    expect(validate("26")).toBe(true);
    expect(validate("37")).toBe(true);
    expect(validate("42.8")).toBe(true);
    expect(validate("48")).toBe(true);
    expect(validate("25.9")).toBe("La température de chauffage doit être comprise entre 26 °C et 48 °C.");
    expect(validate("48.1")).toBe("La température de chauffage doit être comprise entre 26 °C et 48 °C.");
  });

  it("valide la durée de chauffage entre 10 et 65 minutes inclus", () => {
    const validate = heatingDurationValidation.validate as (value: string) => true | string;
    expect(validate("10")).toBe(true);
    expect(validate("30")).toBe(true);
    expect(validate("60")).toBe(true);
    expect(validate("65")).toBe(true);
    expect(validate("9")).toBe("La durée de chauffage doit être comprise entre 10 et 65 minutes.");
    expect(validate("66")).toBe("La durée de chauffage doit être comprise entre 10 et 65 minutes.");
    expect(validate("10.5")).toBe("La durée de chauffage doit être comprise entre 10 et 65 minutes.");
  });

  it("convertit la saisie d'égouttage en minutes entières", () => {
    expect(toDrainageMinutes("30", "MINUTES")).toBe(30);
    expect(toDrainageMinutes("4", "HEURES")).toBe(240);
    expect(toDrainageMinutes("12", "HEURES")).toBe(720);
    expect(toDrainageMinutes("48", "HEURES")).toBe(2880);
    expect(validateDrainageDuration("50", "HEURES"))
      .toBe("La durée d'égouttage doit être comprise entre 30 minutes et 48 heures.");
    expect(validateDrainageDuration("0.25", "HEURES"))
      .toBe("La durée d'égouttage doit être comprise entre 30 minutes et 48 heures.");
  });

  it("affiche les durées existantes sans perte lors de l'édition", () => {
    const fabrication = {
      id: 1, numeroLot: "FAB-1", dateHeureDebut: "2026-09-08T08:30:00",
      recetteId: 4, recetteNom: "Recette", fromageId: 2, fromageNom: "Tomme",
      operateurId: 1, operateurNom: "Opérateur", quantiteLait: 120,
      poidsTotalFromages: 14.2, nombreFromages: 20, rendement: 11.83,
      temperatureLait: 31.5, origineLait: "TRAITE_MATIN" as const,
      temperatureChauffage: 38, dureeChauffageMinutes: 45,
      typePresure: "Présure animale", quantitePresure: 12.5,
      typeFerments: "Ferments thermophiles", quantiteFerments: 6,
      temperatureMiseEnMoule: 24, dureeEgouttageMinutes: 720, observations: null,
    };
    expect(createValuesFromFabrication(fabrication)).toMatchObject({
      dureeEgouttageMinutes: "12", dureeEgouttageUnite: "HEURES",
    });
    expect(createValuesFromFabrication({ ...fabrication, dureeEgouttageMinutes: 90 })).toMatchObject({
      dureeEgouttageMinutes: "90", dureeEgouttageUnite: "MINUTES",
    });
  });

  it("calcule le seuil d'avertissement bas à un fromage pour vingt litres", () => {
    expect(minimumCheeseWarningThreshold(100)).toBe(5);
    expect(isExceptionallyLowCheeseCount(1, 100)).toBe(true);
    expect(isExceptionallyLowCheeseCount(4, 100)).toBe(true);
    expect(isExceptionallyLowCheeseCount(5, 100)).toBe(false);
    expect(isExceptionallyLowCheeseCount(6, 100)).toBe(false);
    expect(minimumCheeseWarningThreshold(200)).toBe(10);
    expect(isExceptionallyLowCheeseCount(9, 200)).toBe(true);
    expect(isExceptionallyLowCheeseCount(10, 200)).toBe(false);
    expect(isExceptionallyLowCheeseCount(0, 100)).toBe(false);
  });

  it("classe le rendement calculé depuis le poids et le lait réels", () => {
    expect(calculateCheeseYield(10, 100)).toBe(10);
    expect(cheeseYieldZone(0.5, 100)).toBe("INVALID");
    expect(cheeseYieldZone(1, 100)).toBe("LOW");
    expect(cheeseYieldZone(4.99, 100)).toBe("LOW");
    expect(cheeseYieldZone(5, 100)).toBe("NORMAL");
    expect(cheeseYieldZone(30, 100)).toBe("NORMAL");
    expect(cheeseYieldZone(30.1, 100)).toBe("HIGH");
    expect(cheeseYieldZone(70, 100)).toBe("HIGH");
    expect(cheeseYieldZone(70.1, 100)).toBe("INVALID");
  });
});
