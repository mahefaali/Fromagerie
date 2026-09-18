import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  costsApi,
  type ConfigurationEmballage,
  type Emballage,
  type Equipement,
  type RegleAmortissement,
  type RegleMainOeuvre,
  type RegleCoutEnergie,
  type TarifLait,
} from "../../api/costsApi";
import {
  EMPTY_AMORTISSEMENT,
  EMPTY_CONFIGURATION_EMBALLAGE,
  EMPTY_EMBALLAGE,
  EMPTY_ENERGIE,
  EMPTY_EQUIPEMENT,
  EMPTY_MAIN_OEUVRE,
  EMPTY_TARIF,
} from "./costForm.config";

export function useCostsConfiguration() {
  const [tarifs, setTarifs] = useState<TarifLait[]>([]);
  const [emballages, setEmballages] = useState<Emballage[]>([]);
  const [configurationsEmballages, setConfigurationsEmballages] = useState<ConfigurationEmballage[]>([]);
  const [fromages, setFromages] = useState<{ id: number; nom: string }[]>([]);
  const [energie, setEnergie] = useState<RegleCoutEnergie[]>([]);
  const [mainOeuvre, setMainOeuvre] = useState<RegleMainOeuvre[]>([]);
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [amortissements, setAmortissements] = useState<RegleAmortissement[]>([]);

  const [tarifForm, setTarifForm] = useState(EMPTY_TARIF);
  const [emballageForm, setEmballageForm] = useState(EMPTY_EMBALLAGE);
  const [configurationEmballageForm, setConfigurationEmballageForm] = useState(EMPTY_CONFIGURATION_EMBALLAGE);
  const [energieForm, setEnergieForm] = useState(EMPTY_ENERGIE);
  const [mainOeuvreForm, setMainOeuvreForm] = useState(EMPTY_MAIN_OEUVRE);
  const [equipementForm, setEquipementForm] = useState(EMPTY_EQUIPEMENT);
  const [amortissementForm, setAmortissementForm] = useState(EMPTY_AMORTISSEMENT);
  const [editingMainOeuvreId, setEditingMainOeuvreId] = useState<number | null>(null);
  const [editingEquipementId, setEditingEquipementId] = useState<number | null>(null);
  const [editingAmortissementId, setEditingAmortissementId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [lait, pack, packagingConfigurations, cheeses, regles, labor, equipment, depreciation] = await Promise.all([
        costsApi.listTarifsLait(),
        costsApi.listEmballages(),
        costsApi.listConfigurationsEmballages(),
        costsApi.listFromages(),
        costsApi.listEnergie(),
        costsApi.listMainOeuvre(),
        costsApi.listEquipements(),
        costsApi.listAmortissements(),
      ]);
      setTarifs(lait);
      setEmballages(pack);
      setConfigurationsEmballages(packagingConfigurations);
      setFromages(cheeses);
      setEnergie(regles);
      setMainOeuvre(labor);
      setEquipements(equipment);
      setAmortissements(depreciation);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Chargement impossible");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const runSubmission = async (submission: () => Promise<void>) => {
    try {
      await submission();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Enregistrement impossible");
    }
  };

  const submitTarif = async () => {
    await costsApi.createTarifLait({
      saison: tarifForm.saison,
      prixParLitre: Number(tarifForm.prixParLitre),
      dateDebutValidite: tarifForm.dateDebutValidite,
      dateFinValidite: tarifForm.dateFinValidite || null,
      actif: tarifForm.actif,
    });
    toast.success("Tarif lait ajouté");
    setTarifForm(EMPTY_TARIF);
    await load();
  };

  const submitEmballage = async () => {
    await costsApi.createEmballage({
      nom: emballageForm.nom,
      coutUnitaire: Number(emballageForm.coutUnitaire),
      unite: emballageForm.unite,
      actif: emballageForm.actif,
    });
    toast.success("Emballage ajouté");
    setEmballageForm(EMPTY_EMBALLAGE);
    await load();
  };

  const submitConfigurationEmballage = async () => {
    await costsApi.createConfigurationEmballage({
      fromageId: Number(configurationEmballageForm.fromageId),
      emballageId: Number(configurationEmballageForm.emballageId),
      quantiteParUnite: Number(configurationEmballageForm.quantiteParUnite),
      actif: true,
    });
    toast.success("Emballage associé au fromage");
    setConfigurationEmballageForm(EMPTY_CONFIGURATION_EMBALLAGE);
    await load();
  };

  const submitEnergie = async () => {
    await costsApi.createEnergie({
      typeOperation: energieForm.typeOperation,
      coutStandard: Number(energieForm.coutStandard),
      uniteCalcul: energieForm.uniteCalcul,
      dateDebutValidite: energieForm.dateDebutValidite,
      dateFinValidite: energieForm.dateFinValidite || null,
      actif: energieForm.actif,
    });
    toast.success("Règle énergie ajoutée");
    setEnergieForm(EMPTY_ENERGIE);
    await load();
  };

  const submitMainOeuvre = async () => {
    const request = {
      typeOperation: mainOeuvreForm.typeOperation,
      dureeStandardMinutes: Number(mainOeuvreForm.dureeStandardMinutes),
      coutHoraire: Number(mainOeuvreForm.coutHoraire),
      dateDebutValidite: mainOeuvreForm.dateDebutValidite,
      dateFinValidite: mainOeuvreForm.dateFinValidite || null,
      actif: mainOeuvreForm.actif,
    };
    if (editingMainOeuvreId === null) await costsApi.createMainOeuvre(request);
    else await costsApi.updateMainOeuvre(editingMainOeuvreId, request);
    toast.success(editingMainOeuvreId === null ? "Règle de main-d'œuvre ajoutée" : "Règle de main-d'œuvre modifiée");
    setMainOeuvreForm(EMPTY_MAIN_OEUVRE);
    setEditingMainOeuvreId(null);
    await load();
  };

  const submitEquipement = async () => {
    const request = { nom: equipementForm.nom, description: equipementForm.description || null, actif: equipementForm.actif };
    if (editingEquipementId === null) await costsApi.createEquipement(request);
    else await costsApi.updateEquipement(editingEquipementId, request);
    toast.success(editingEquipementId === null ? "Équipement ajouté" : "Équipement modifié");
    setEquipementForm(EMPTY_EQUIPEMENT);
    setEditingEquipementId(null);
    await load();
  };

  const submitAmortissement = async () => {
    const request = {
      equipementId: Number(amortissementForm.equipementId),
      coutParFabrication: Number(amortissementForm.coutParFabrication),
      dateDebutValidite: amortissementForm.dateDebutValidite,
      dateFinValidite: amortissementForm.dateFinValidite || null,
      actif: amortissementForm.actif,
    };
    if (editingAmortissementId === null) await costsApi.createAmortissement(request);
    else await costsApi.updateAmortissement(editingAmortissementId, request);
    toast.success(editingAmortissementId === null ? "Règle d'amortissement ajoutée" : "Règle d'amortissement modifiée");
    setAmortissementForm(EMPTY_AMORTISSEMENT);
    setEditingAmortissementId(null);
    await load();
  };


  return {
    tarifs, emballages, configurationsEmballages, fromages, energie, mainOeuvre, equipements, amortissements,
    tarifForm, setTarifForm, emballageForm, setEmballageForm, configurationEmballageForm, setConfigurationEmballageForm,
    energieForm, setEnergieForm, mainOeuvreForm, setMainOeuvreForm, equipementForm, setEquipementForm,
    amortissementForm, setAmortissementForm, editingMainOeuvreId, setEditingMainOeuvreId,
    editingEquipementId, setEditingEquipementId, editingAmortissementId, setEditingAmortissementId,
    runSubmission, submitTarif, submitEmballage, submitConfigurationEmballage, submitEnergie,
    submitMainOeuvre, submitEquipement, submitAmortissement,
  };
}

export type CostsConfigurationModel = ReturnType<typeof useCostsConfiguration>;
