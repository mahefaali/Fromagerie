import { Archive, Beef, ChartNoAxesCombined, Factory, Home, SearchCheck, Settings } from "lucide-react";

import type { UserRole } from "../../features/authentication/types/auth.types";

export const navItems = [
  { to: "/home", label: "Accueil", icon: Home, roles: ["PROPRIETAIRE", "FABRICATION", "VENTE"] },
  { to: "/fabrication", label: "Fabrication", icon: Factory, roles: ["PROPRIETAIRE", "FABRICATION"] },
  { to: "/affinage", label: "Affinage", icon: Beef, roles: ["PROPRIETAIRE", "FABRICATION"] },
  { to: "/stock", label: "Stockage & Vente", icon: Archive, roles: ["PROPRIETAIRE", "VENTE"] },
  { to: "/tracabilite", label: "Traçabilité", icon: SearchCheck, roles: ["PROPRIETAIRE", "FABRICATION", "VENTE"] },
  { to: "/rentabilite", label: "Rentabilité", icon: ChartNoAxesCombined, roles: ["PROPRIETAIRE"] },
  { to: "/configuration", label: "Configuration", icon: Settings, roles: ["PROPRIETAIRE"] },
] satisfies ReadonlyArray<{
  to: string;
  label: string;
  icon: typeof Home;
  roles: readonly UserRole[];
}>;

export const mainNavItems = [
  {
    to: "/home",
    label: "Accueil",
    icon: Home,
    paths: ["/home"],
    roles: ["PROPRIETAIRE", "FABRICATION", "VENTE"],
  },
  {
    to: "/fabrication",
    label: "Production",
    icon: Factory,
    paths: ["/fabrication"],
    roles: ["PROPRIETAIRE", "FABRICATION"],
  },
  {
    to: "/affinage",
    label: "Affinage",
    icon: Beef,
    paths: ["/affinage"],
    roles: ["PROPRIETAIRE", "FABRICATION"],
  },
  {
    to: "/stock",
    label: "Stock & ventes",
    icon: Archive,
    paths: ["/stock"],
    roles: ["PROPRIETAIRE", "VENTE"],
  },
  {
    to: "/rentabilite",
    label: "Pilotage",
    icon: ChartNoAxesCombined,
    paths: ["/rentabilite", "/tracabilite"],
    roles: ["PROPRIETAIRE"],
  },
] satisfies ReadonlyArray<{
  to: string;
  fallbackTo?: string;
  label: string;
  icon: typeof Home;
  paths: readonly string[];
  roles: readonly UserRole[];
}>;
