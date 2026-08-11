"use client";

import { useState } from "react";
import { useRevealOnScroll } from "./../../../hooks/useRevealOnScroll";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./../../../components/ui/tabs";
import { Modal } from "./../../../components/ui/modal";
import { LotDetails, type FabricationLot } from "./../../../components/ui/LotDetails";

export default function Fabrications() {
  const { ref: headRef, isVisible: headVisible } = useRevealOnScroll<HTMLDivElement>({ threshold: 0.15 });
  const [activeLot, setActiveLot] = useState<FabricationLot | null>(null);

  const tastingAutumn: FabricationLot[] = [
    {
      id: "autumn-1",
      name: "Comté Affinage 12 Mois",
      description: "Pâte pressée cuite, affiné en cave humide avec un contrôle strict de la température.",
      provenance: "LAIT CRU DE MONTAGNE · AFFINAGE 12 MOIS",
      price: "28",
      productType: "Comté",
      operator: "M. Payet",
      lotCode: "LOT-20260424-0915-01",
      startAt: "2026-04-24T08:00",
      createdAt: "24/04/2026 09:15",
      status: "validé",
      stage: "Affinage",
      cheeseCount: 24,
      milkType: "Vache",
      milkQuantityL: "1200",
      milkTemperature: 18,
      milkOrigin: "traite du matin",
      temperature: 38,
      cookingTime: 55,
      coagulationTime: 40,
      curdCut: "Fin",
      rennetType: "Présure standard",
      rennetAmount: "18 ml",
      cultureType: "Ferments thermophiles",
      cultureAmount: "30 g",
      moldingType: "Moule traditionnel",
      moldingTemperature: 14,
      drainageTime: 25,
      saltUsed: true,
      humidity: 78,
      observations: "Affinage long prévu, surveiller l'humidité.",
      useStarter: true,
    },
    {
      id: "autumn-2",
      name: "Tomme de Brebis",
      description: "Fromage à pâte pressée non cuite, texture souple et arômes de noisette.",
      provenance: "LAIT DE BREBIS · TERROIR LOCAL",
      price: "34",
      productType: "Tomme de Brebis",
      operator: "Employé",
      lotCode: "LOT-20260423-1430-02",
      startAt: "2026-04-23T14:30",
      createdAt: "23/04/2026 14:30",
      status: "validé",
      stage: "Affinage",
      cheeseCount: 40,
      milkType: "Brebis",
      milkQuantityL: "950",
      milkTemperature: 16,
      milkOrigin: "traite du soir",
      temperature: 34,
      cookingTime: 50,
      coagulationTime: 38,
      curdCut: "Moyen",
      rennetType: "Présure douce",
      rennetAmount: "16 ml",
      cultureType: "Ferments lactiques",
      cultureAmount: "28 g",
      moldingType: "Moule perforé",
      moldingTemperature: 12,
      drainageTime: 22,
      saltUsed: true,
      humidity: 80,
      observations: "Suivi du pH à chaque étape.",
      useStarter: true,
    },
    {
      id: "autumn-3",
      name: "Bleu de Chèvre",
      description: "Pâte persillée, affinage en cave ventilée pour un développement optimal des ferments.",
      provenance: "LAIT DE CHÈVRE · FERMENTS SÉLECTIONNÉS",
      price: "42",
      productType: "Bleu de Chèvre",
      operator: "M. Payet",
      lotCode: "LOT-20260422-1020-03",
      startAt: "2026-04-22T10:20",
      createdAt: "22/04/2026 10:20",
      status: "validé",
      stage: "Affinage",
      cheeseCount: 18,
      milkType: "Chèvre",
      milkQuantityL: "780",
      milkTemperature: 15,
      milkOrigin: "mélange",
      temperature: 36,
      cookingTime: 48,
      coagulationTime: 36,
      curdCut: "Grossier",
      rennetType: "Présure forte",
      rennetAmount: "12 ml",
      cultureType: "Ferments à bleu",
      cultureAmount: "35 g",
      moldingType: "Éprouvette",
      moldingTemperature: 10,
      drainageTime: 18,
      saltUsed: true,
      humidity: 85,
      observations: "Veiller au perçage régulier du caillé.",
      useStarter: true,
    },
    {
      id: "autumn-4",
      name: "Reblochon Fermier",
      description: "Fromage onctueux, croûte lavée, suivi rigoureux du taux d'humidité.",
      provenance: "LAIT ENTIER · AFFINAGE EN CAVE",
      price: "48",
      productType: "Reblochon",
      operator: "Employé",
      lotCode: "LOT-20260421-0730-04",
      startAt: "2026-04-21T07:30",
      createdAt: "21/04/2026 07:30",
      status: "validé",
      stage: "En caillage",
      cheeseCount: 22,
      milkType: "Vache",
      milkQuantityL: "1100",
      milkTemperature: 17,
      milkOrigin: "traite du matin",
      temperature: 35,
      cookingTime: 52,
      coagulationTime: 39,
      curdCut: "Moyen",
      rennetType: "Présure standard",
      rennetAmount: "17 ml",
      cultureType: "Ferments lavés",
      cultureAmount: "26 g",
      moldingType: "Moule traditionnel",
      moldingTemperature: 13,
      drainageTime: 24,
      saltUsed: true,
      humidity: 82,
      observations: "Lavage de croûte toutes les 48h.",
      useStarter: true,
    },
    {
      id: "autumn-5",
      name: "Crème de Gruyère",
      description: "Préparation artisanale, texture fondante avec une pointe de sel de mer.",
      provenance: "LAIT DE VACHE · SEL DE GUÉRANDE",
      price: "22",
      productType: "Gruyère",
      operator: "M. Payet",
      lotCode: "LOT-20260420-1200-05",
      startAt: "2026-04-20T12:00",
      createdAt: "20/04/2026 12:00",
      status: "validé",
      stage: "Terminée",
      cheeseCount: 30,
      milkType: "Vache",
      milkQuantityL: "1250",
      milkTemperature: 19,
      milkOrigin: "traite du soir",
      temperature: 37,
      cookingTime: 50,
      coagulationTime: 37,
      curdCut: "Fin",
      rennetType: "Présure standard",
      rennetAmount: "20 ml",
      cultureType: "Ferments neutres",
      cultureAmount: "24 g",
      moldingType: "Moule traditionnel",
      moldingTemperature: 14,
      drainageTime: 23,
      saltUsed: true,
      humidity: 79,
      observations: "Contrôle de l'humidité toutes les 6 heures.",
      useStarter: false,
    },
  ];

  const tastingVeg: FabricationLot[] = [
    {
      id: "veg-1",
      name: "Yaourt Artisanal",
      description: "Fermentation lente en étuve, texture ferme et onctueuse.",
      provenance: "LAIT ENTIER · FERMENTS NATURELS",
      price: "24",
      productType: "Yaourt",
      operator: "Employé",
      lotCode: "LOT-20260424-0830-06",
      startAt: "2026-04-24T08:30",
      createdAt: "24/04/2026 08:30",
      status: "validé",
      stage: "Terminée",
      cheeseCount: 12,
      milkType: "Vache",
      milkQuantityL: "600",
      milkTemperature: 22,
      milkOrigin: "traite du matin",
      temperature: 42,
      cookingTime: 30,
      coagulationTime: 25,
      curdCut: "Fin",
      rennetType: "Aucune",
      rennetAmount: "0 ml",
      cultureType: "Ferments lactiques",
      cultureAmount: "20 g",
      moldingType: "Moule traditionnel",
      moldingTemperature: 6,
      drainageTime: 12,
      saltUsed: false,
      humidity: 88,
      observations: "Fermentation douce et constante.",
      useStarter: true,
    },
    {
      id: "veg-2",
      name: "Fromage Blanc Battu",
      description: "Égouttage traditionnel en sac, texture légère et aérienne.",
      provenance: "LAIT DE VACHE · ÉGOUTTAGE LENT",
      price: "36",
      productType: "Fromage Blanc",
      operator: "M. Payet",
      lotCode: "LOT-20260423-0910-07",
      startAt: "2026-04-23T09:10",
      createdAt: "23/04/2026 09:10",
      status: "validé",
      stage: "Terminée",
      cheeseCount: 15,
      milkType: "Vache",
      milkQuantityL: "820",
      milkTemperature: 14,
      milkOrigin: "mélange",
      temperature: 36,
      cookingTime: 28,
      coagulationTime: 30,
      curdCut: "Moyen",
      rennetType: "Aucune",
      rennetAmount: "0 ml",
      cultureType: "Ferments doux",
      cultureAmount: "22 g",
      moldingType: "Moule traditionnel",
      moldingTemperature: 8,
      drainageTime: 15,
      saltUsed: false,
      humidity: 90,
      observations: "Égouttage contrôlé pour texture légère.",
      useStarter: true,
    },
    {
      id: "veg-3",
      name: "Faisselle Fraîche",
      description: "Caillé frais, moulé à la louche, idéal pour les préparations culinaires.",
      provenance: "LAIT CRU · MOULAGE MANUEL",
      price: "22",
      productType: "Faisselle",
      operator: "Employé",
      lotCode: "LOT-20260422-1015-08",
      startAt: "2026-04-22T10:15",
      createdAt: "22/04/2026 10:15",
      status: "validé",
      stage: "Planifiée",
      cheeseCount: 20,
      milkType: "Vache",
      milkQuantityL: "680",
      milkTemperature: 18,
      milkOrigin: "traite du soir",
      temperature: 35,
      cookingTime: 26,
      coagulationTime: 29,
      curdCut: "Moyen",
      rennetType: "Aucune",
      rennetAmount: "0 ml",
      cultureType: "Ferments doux",
      cultureAmount: "18 g",
      moldingType: "Moule perforé",
      moldingTemperature: 7,
      drainageTime: 14,
      saltUsed: false,
      humidity: 92,
      observations: "Moulage à la louche pour une texture fine.",
      useStarter: true,
    },
    {
      id: "veg-4",
      name: "Petit Frais aux Herbes",
      description: "Fromage frais assaisonné aux herbes de Provence, affinage court.",
      provenance: "LAIT DE CHÈVRE · HERBES FRAÎCHES",
      price: "26",
      productType: "Petit Frais",
      operator: "M. Payet",
      lotCode: "LOT-20260421-0820-09",
      startAt: "2026-04-21T08:20",
      createdAt: "21/04/2026 08:20",
      status: "validé",
      stage: "Planifiée",
      cheeseCount: 18,
      milkType: "Chèvre",
      milkQuantityL: "520",
      milkTemperature: 16,
      milkOrigin: "traite du matin",
      temperature: 37,
      cookingTime: 24,
      coagulationTime: 28,
      curdCut: "Fin",
      rennetType: "Aucune",
      rennetAmount: "0 ml",
      cultureType: "Ferments aromatiques",
      cultureAmount: "18 g",
      moldingType: "Moule traditionnel",
      moldingTemperature: 9,
      drainageTime: 13,
      saltUsed: false,
      humidity: 89,
      observations: "Ajout d'herbes fraîches après moulage.",
      useStarter: true,
    },
    {
      id: "veg-5",
      name: "Dessert Lacté",
      description: "Crème dessert au lait entier, parfumée à la vanille bourbon.",
      provenance: "LAIT DE VACHE · VANILLE NATURELLE",
      price: "20",
      productType: "Dessert Lacté",
      operator: "Employé",
      lotCode: "LOT-20260420-1130-10",
      startAt: "2026-04-20T11:30",
      createdAt: "20/04/2026 11:30",
      status: "validé",
      stage: "Planifiée",
      cheeseCount: 14,
      milkType: "Vache",
      milkQuantityL: "950",
      milkTemperature: 20,
      milkOrigin: "traite du soir",
      temperature: 40,
      cookingTime: 22,
      coagulationTime: 0,
      curdCut: "N/A",
      rennetType: "Aucune",
      rennetAmount: "0 ml",
      cultureType: "Ferments sucrés",
      cultureAmount: "15 g",
      moldingType: "Moule traditionnel",
      moldingTemperature: 5,
      drainageTime: 10,
      saltUsed: false,
      humidity: 91,
      observations: "Refroidissement rapide en cellule.",
      useStarter: true,
    },
  ];

  const alaCarte: FabricationLot[] = [
    {
      id: "alacarte-1",
      name: "Raclette Tradition",
      description: "Fromage à pâte pressée non cuite, idéal pour la fonte, affinage 3 mois.",
      provenance: "LAIT CRU · AFFINAGE 3 MOIS",
      price: "26",
      productType: "Raclette",
      operator: "M. Payet",
      lotCode: "LOT-20260424-1005-11",
      startAt: "2026-04-24T10:05",
      createdAt: "24/04/2026 10:05",
      status: "validé",
      stage: "Planifiée",
      cheeseCount: 28,
      milkType: "Vache",
      milkQuantityL: "1300",
      milkTemperature: 18,
      milkOrigin: "traite du matin",
      temperature: 36,
      cookingTime: 50,
      coagulationTime: 42,
      curdCut: "Moyen",
      rennetType: "Présure standard",
      rennetAmount: "19 ml",
      cultureType: "Ferments doux",
      cultureAmount: "26 g",
      moldingType: "Moule traditionnel",
      moldingTemperature: 13,
      drainageTime: 23,
      saltUsed: true,
      humidity: 81,
      observations: "Affinage avec brassage régulier.",
      useStarter: true,
    },
    {
      id: "alacarte-2",
      name: "Brie de Meaux",
      description: "Pâte molle à croûte fleurie, affinage contrôlé pour une texture coulante.",
      provenance: "LAIT CRU · AFFINAGE 6 SEMAINES",
      price: "38",
      productType: "Brie",
      operator: "Employé",
      lotCode: "LOT-20260423-0915-12",
      startAt: "2026-04-23T09:15",
      createdAt: "23/04/2026 09:15",
      status: "validé",
      stage: "En caillage",
      cheeseCount: 22,
      milkType: "Vache",
      milkQuantityL: "980",
      milkTemperature: 16,
      milkOrigin: "mélange",
      temperature: 33,
      cookingTime: 45,
      coagulationTime: 34,
      curdCut: "Fin",
      rennetType: "Présure douce",
      rennetAmount: "17 ml",
      cultureType: "Ferments blancs",
      cultureAmount: "25 g",
      moldingType: "Moule traditionnel",
      moldingTemperature: 11,
      drainageTime: 20,
      saltUsed: true,
      humidity: 84,
      observations: "Brossage de croûte régulier pendant affinage.",
      useStarter: true,
    },
    {
      id: "alacarte-3",
      name: "Camembert Fermier",
      description: "Fromage à pâte molle, croûte fleurie, moulé à la louche.",
      provenance: "LAIT CRU · MOULAGE À LA LOUCHE",
      price: "44",
      productType: "Camembert",
      operator: "M. Payet",
      lotCode: "LOT-20260422-1000-13",
      startAt: "2026-04-22T10:00",
      createdAt: "22/04/2026 10:00",
      status: "validé",
      stage: "En caillage",
      cheeseCount: 26,
      milkType: "Vache",
      milkQuantityL: "890",
      milkTemperature: 17,
      milkOrigin: "traite du soir",
      temperature: 34,
      cookingTime: 46,
      coagulationTime: 33,
      curdCut: "Fin",
      rennetType: "Présure standard",
      rennetAmount: "18 ml",
      cultureType: "Ferments camembert",
      cultureAmount: "27 g",
      moldingType: "Moule traditionnel",
      moldingTemperature: 10,
      drainageTime: 18,
      saltUsed: true,
      humidity: 86,
      observations: "Brassage doux et affinage en cave humide.",
      useStarter: true,
    },
    {
      id: "alacarte-4",
      name: "Morbier AOP",
      description: "Pâte pressée non cuite avec sa raie de cendre, affinage 45 jours.",
      provenance: "LAIT DE VACHE · CENDRE VÉGÉTALE",
      price: "46",
      productType: "Morbier",
      operator: "Employé",
      lotCode: "LOT-20260421-0830-14",
      startAt: "2026-04-21T08:30",
      createdAt: "21/04/2026 08:30",
      status: "validé",
      stage: "Affinage",
      cheeseCount: 24,
      milkType: "Vache",
      milkQuantityL: "1050",
      milkTemperature: 18,
      milkOrigin: "traite du matin",
      temperature: 35,
      cookingTime: 51,
      coagulationTime: 39,
      curdCut: "Moyen",
      rennetType: "Présure standard",
      rennetAmount: "19 ml",
      cultureType: "Ferments doux",
      cultureAmount: "26 g",
      moldingType: "Moule traditionnel",
      moldingTemperature: 12,
      drainageTime: 22,
      saltUsed: true,
      humidity: 83,
      observations: "Cendre appliquée au moulage.",
      useStarter: true,
    },
    {
      id: "alacarte-5",
      name: "Fromage Blanc Sucré",
      description: "Fromage blanc battu avec une touche de miel de fleurs.",
      provenance: "LAIT DE VACHE · MIEL ARTISANAL",
      price: "18",
      productType: "Fromage Blanc",
      operator: "M. Payet",
      lotCode: "LOT-20260420-1115-15",
      startAt: "2026-04-20T11:15",
      createdAt: "20/04/2026 11:15",
      status: "validé",
      stage: "Affinage",
      cheeseCount: 18,
      milkType: "Vache",
      milkQuantityL: "720",
      milkTemperature: 19,
      milkOrigin: "traite du soir",
      temperature: 36,
      cookingTime: 27,
      coagulationTime: 29,
      curdCut: "Fin",
      rennetType: "Aucune",
      rennetAmount: "0 ml",
      cultureType: "Ferments doux",
      cultureAmount: "24 g",
      moldingType: "Moule traditionnel",
      moldingTemperature: 9,
      drainageTime: 15,
      saltUsed: false,
      humidity: 90,
      observations: "Assaisonnement miel après moulage.",
      useStarter: true,
    },
  ];

  const winePairings: FabricationLot[] = [
    {
      id: "wine-1",
      name: "Vin Blanc Sec",
      description: "Un vin minéral qui accompagne parfaitement les pâtes pressées.",
      provenance: "VIGNOBLE LOCAL · 125ML",
      price: "18",
      productType: "Vin Blanc",
      operator: "Employé",
      lotCode: "LOT-20260424-0955-16",
      startAt: "2026-04-24T09:55",
      createdAt: "24/04/2026 09:55",
      status: "validé",
      stage: "Terminée",
      cheeseCount: 0,
      milkType: "N/A",
      milkQuantityL: "0",
      milkTemperature: 0,
      milkOrigin: "N/A",
      temperature: 0,
      cookingTime: 0,
      coagulationTime: 0,
      curdCut: "N/A",
      rennetType: "N/A",
      rennetAmount: "0 ml",
      cultureType: "N/A",
      cultureAmount: "0 g",
      moldingType: "N/A",
      moldingTemperature: 0,
      drainageTime: 0,
      saltUsed: false,
      humidity: 0,
      observations: "Accord de vin sec pour fromages pressés.",
      useStarter: false,
    },
    {
      id: "wine-2",
      name: "Vin Rouge Léger",
      description: "Tanins souples pour sublimer les fromages à croûte fleurie.",
      provenance: "VIGNOBLE RÉGIONAL · 125ML",
      price: "16",
      productType: "Vin Rouge",
      operator: "M. Payet",
      lotCode: "LOT-20260423-0930-17",
      startAt: "2026-04-23T09:30",
      createdAt: "23/04/2026 09:30",
      status: "validé",
      stage: "Terminée",
      cheeseCount: 0,
      milkType: "N/A",
      milkQuantityL: "0",
      milkTemperature: 0,
      milkOrigin: "N/A",
      temperature: 0,
      cookingTime: 0,
      coagulationTime: 0,
      curdCut: "N/A",
      rennetType: "N/A",
      rennetAmount: "0 ml",
      cultureType: "N/A",
      cultureAmount: "0 g",
      moldingType: "N/A",
      moldingTemperature: 0,
      drainageTime: 0,
      saltUsed: false,
      humidity: 0,
      observations: "Accord léger pour fromages à pâte molle.",
      useStarter: false,
    },
    {
      id: "wine-3",
      name: "Vin Blanc Moelleux",
      description: "Notes fruitées pour équilibrer les fromages persillés.",
      provenance: "VIGNOBLE DE COTEAUX · 125ML",
      price: "20",
      productType: "Vin Blanc",
      operator: "Employé",
      lotCode: "LOT-20260422-1045-18",
      startAt: "2026-04-22T10:45",
      createdAt: "22/04/2026 10:45",
      status: "validé",
      stage: "Terminée",
      cheeseCount: 0,
      milkType: "N/A",
      milkQuantityL: "0",
      milkTemperature: 0,
      milkOrigin: "N/A",
      temperature: 0,
      cookingTime: 0,
      coagulationTime: 0,
      curdCut: "N/A",
      rennetType: "N/A",
      rennetAmount: "0 ml",
      cultureType: "N/A",
      cultureAmount: "0 g",
      moldingType: "N/A",
      moldingTemperature: 0,
      drainageTime: 0,
      saltUsed: false,
      humidity: 0,
      observations: "Accord moelleux pour fromages bleus.",
      useStarter: false,
    },
    {
      id: "wine-4",
      name: "Vin Rosé Frais",
      description: "Acidité maîtrisée pour les fromages frais et chèvres.",
      provenance: "VIGNOBLE DU SUD · 125ML",
      price: "24",
      productType: "Vin Rosé",
      operator: "M. Payet",
      lotCode: "LOT-20260421-0845-19",
      startAt: "2026-04-21T08:45",
      createdAt: "21/04/2026 08:45",
      status: "validé",
      stage: "Terminée",
      cheeseCount: 0,
      milkType: "N/A",
      milkQuantityL: "0",
      milkTemperature: 0,
      milkOrigin: "N/A",
      temperature: 0,
      cookingTime: 0,
      coagulationTime: 0,
      curdCut: "N/A",
      rennetType: "N/A",
      rennetAmount: "0 ml",
      cultureType: "N/A",
      cultureAmount: "0 g",
      moldingType: "N/A",
      moldingTemperature: 0,
      drainageTime: 0,
      saltUsed: false,
      humidity: 0,
      observations: "Accord frais pour fromages frais.",
      useStarter: false,
    },
    {
      id: "wine-5",
      name: "Vin de Dessert",
      description: "Douceur finale pour accompagner les desserts lactés.",
      provenance: "VIGNOBLE DE CAVE · 75ML",
      price: "22",
      productType: "Vin de Dessert",
      operator: "Employé",
      lotCode: "LOT-20260420-1145-20",
      startAt: "2026-04-20T11:45",
      createdAt: "20/04/2026 11:45",
      status: "validé",
      stage: "Terminée",
      cheeseCount: 0,
      milkType: "N/A",
      milkQuantityL: "0",
      milkTemperature: 0,
      milkOrigin: "N/A",
      temperature: 0,
      cookingTime: 0,
      coagulationTime: 0,
      curdCut: "N/A",
      rennetType: "N/A",
      rennetAmount: "0 ml",
      cultureType: "N/A",
      cultureAmount: "0 g",
      moldingType: "N/A",
      moldingTemperature: 0,
      drainageTime: 0,
      saltUsed: false,
      humidity: 0,
      observations: "Accord sucré pour fromages de dessert.",
      useStarter: false,
    },
  ];

  const tabs = [
    { value: "autumn", label: "Fabrications Affinées", data: tastingAutumn },
    { value: "veg", label: "Produits Frais", data: tastingVeg },
    { value: "alacarte", label: "Sélection du Fromager", data: alaCarte },
    { value: "wine", label: "Accords Fromages-Vins", data: winePairings },
  ];

  const allLots = tabs.flatMap((tab) => tab.data);
  const totals = allLots.reduce(
    (acc, lot) => ({
      totalMilk: acc.totalMilk + Number(lot.milkQuantityL || 0),
      totalCheese: acc.totalCheese + lot.cheeseCount,
      planned: acc.planned + (lot.stage === "Planifiée" ? 1 : 0),
      inRennet: acc.inRennet + (lot.stage === "En caillage" ? 1 : 0),
      affinage: acc.affinage + (lot.stage === "Affinage" ? 1 : 0),
      completed: acc.completed + (lot.stage === "Terminée" ? 1 : 0),
    }),
    { totalMilk: 0, totalCheese: 0, planned: 0, inRennet: 0, affinage: 0, completed: 0 }
  );

  const stageLabelClass = (stage: string) => {
    switch (stage) {
      case "Planifiée":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "En caillage":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Affinage":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "Terminée":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-muted/70 text-muted-foreground border-border";
    }
  };

  return (
    <>
    <section data-section-id="1425"
      id="registre-des-fabrications"
      className="bg-background text-foreground py-32 md:py-44 px-5 md:px-8 lg:px-14 overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto">
        <div
          ref={headRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-10 lg:gap-6"
        >
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <div
                className={`transition-all duration-700 ease-out ${
                  headVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
              >
                <p
                  className="font-mono uppercase tracking-[0.18em] text-xs mb-8"
                  style={{ color: "var(--chart-2)" }}
                >
                  <span style={{ color: "var(--chart-2)" }}>§</span> 01 — Registre des Fabrications
                </p>

                <h2
                  className="font-default font-medium leading-[0.96] mb-8"
                  style={{
                    fontSize: "clamp(2.5rem, 5.2vw, 5.5rem)",
                    letterSpacing: "-0.03em",
                    color: "var(--foreground)",
                  }}
                >
                  Traçabilité{" "}
                  <span className="block sm:inline">
                    et{" "}
                    <span
                      className="font-serif italic font-normal"
                      style={{
                        color: "var(--chart-2)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Excellence
                    </span>
                  </span>
                </h2>

                <div className="flex items-center mb-8">
                  <span
                    className="block h-px w-[120px]"
                    style={{ backgroundColor: "var(--chart-2)" }}
                  />
                  <span
                    className="block w-1.5 h-1.5 rounded-lg ml-0"
                    style={{ backgroundColor: "var(--chart-3)" }}
                  />
                </div>

                <p
                  className="font-default max-w-md"
                  style={{
                    fontSize: "clamp(1.0625rem, 1.18vw, 1.25rem)",
                    lineHeight: 1.55,
                    color: "var(--muted-foreground)",
                  }}
                >
                  Chaque lot est suivi avec précision, de la réception du lait à l'affinage final, garantissant une qualité constante et une traçabilité totale pour nos clients.
                </p>

              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <Tabs defaultValue="autumn" className="gap-0">
              <TabsList className="flex flex-wrap items-center gap-3 mb-8 lg:mb-12">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="bg-transparent border border-border/30 rounded-full px-4 py-2 text-base sm:text-lg text-muted-foreground data-[state=active]:bg-foreground data-[state=active]:text-background transition-colors duration-300"
                  >
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <Modal
                open={Boolean(activeLot)}
                onOpenChange={(open) => {
                  if (!open) setActiveLot(null);
                }}
                title={activeLot?.name}
                description={activeLot ? activeLot.description : undefined}
                footer={
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveLot(null)}
                      className="rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent"
                    >
                      Fermer
                    </button>
                  </div>
                }
              >
                {activeLot ? <LotDetails lot={activeLot} /> : null}
              </Modal>

              {tabs.map((tab, ti) => (
                <TabsContent
                  key={tab.value}
                  value={tab.value}
                  data-index={ti}
                  className="mt-0"
                >
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-10">
                    {[
                      { label: "Planifiée", value: totals.planned },
                      { label: "En caillage", value: totals.inRennet },
                      { label: "Affinage", value: totals.affinage },
                      { label: "Terminée", value: totals.completed },
                      { label: "Lait total", value: `${totals.totalMilk} L` },
                      { label: "Pièces produites", value: totals.totalCheese },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm"
                      >
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="mt-3 text-3xl font-semibold text-foreground">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <ul className="flex flex-col gap-6">
                    {tab.data.map((course, i) => (
                      <li
                        data-index={i}
                        key={course.name}
                        className="group relative"
                      >
                        <div className="rounded-[2rem] border border-border/50 bg-card/80 p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-3">
                                <p className="text-xl font-semibold text-foreground">{course.name}</p>
                                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${stageLabelClass(course.stage)}`}>
                                  {course.stage}
                                </span>
                              </div>
                              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{course.description}</p>
                              <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                                <span>{course.lotCode}</span>
                                <span>{course.createdAt}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-3xl border border-border/70 bg-background/90 px-4 py-3 text-sm font-semibold text-foreground">
                              <span className="text-primary">€</span>
                              <span className="tabular-nums text-2xl">{course.price}</span>
                            </div>
                          </div>

                          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-3xl border border-border/70 bg-background/90 p-4">
                              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Lait</p>
                              <p className="mt-2 text-sm font-semibold text-foreground">{course.milkQuantityL} L</p>
                            </div>
                            <div className="rounded-3xl border border-border/70 bg-background/90 p-4">
                              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pièces</p>
                              <p className="mt-2 text-sm font-semibold text-foreground">{course.cheeseCount}</p>
                            </div>
                            <div className="rounded-3xl border border-border/70 bg-background/90 p-4">
                              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Temp.</p>
                              <p className="mt-2 text-sm font-semibold text-foreground">{course.temperature}°C</p>
                            </div>
                            <div className="rounded-3xl border border-border/70 bg-background/90 p-4">
                              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Opérateur</p>
                              <p className="mt-2 text-sm font-semibold text-foreground">{course.operator}</p>
                            </div>
                          </div>

                          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="rounded-3xl border border-border/70 bg-background/90 px-4 py-3 text-sm text-muted-foreground">
                              {course.provenance}
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveLot(course)}
                              className="inline-flex h-11 items-center justify-center rounded-full border border-primary bg-primary/10 px-5 text-sm font-medium text-primary transition hover:bg-primary/20"
                            >
                              Voir détails
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}