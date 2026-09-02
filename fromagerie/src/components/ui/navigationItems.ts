import { Archive, Beef, ChartNoAxesCombined, Factory, Home, Settings } from "lucide-react";

import type { UserRole } from "../../features/authentication/types/auth.types";

export const navItems = [
  { to: "/home", label: "Accueil", icon: Home, roles: ["PROPRIETAIRE", "FABRICATION", "VENTE"] },
  { to: "/fabrication", label: "Fabrication", icon: Factory, roles: ["PROPRIETAIRE", "FABRICATION"] },
  { to: "/affinage", label: "Affinage", icon: Beef, roles: ["PROPRIETAIRE", "FABRICATION"] },
  { to: "/stock", label: "Stockage & Vente", icon: Archive, roles: ["PROPRIETAIRE", "VENTE"] },
  { to: "/rentabilite", label: "Rentabilité", icon: ChartNoAxesCombined, roles: ["PROPRIETAIRE"] },
  { to: "/configuration", label: "Configuration", icon: Settings, roles: ["PROPRIETAIRE"] },
] satisfies ReadonlyArray<{
  to: string;
  label: string;
  icon: typeof Home;
  roles: readonly UserRole[];
}>;
