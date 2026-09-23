import { lazy, Suspense, useEffect } from "react";
import { Warehouse, Sparkles } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent } from "./../../components/ui/tabs";
import { LazyContentFallback } from "../../components/common/LazyContentFallback";
import { PageTabsPortal } from "../../layouts/components/PageTabsPortal";
import { usePersistentTab } from "../../hooks/usePersistentTab";
import { FloatingSubnavigation } from "../../components/ui/FloatingSubnavigation";

const CaveManager = lazy(() =>
  import("../../features/affinage/components/CaveManager").then((module) => ({
    default: module.CaveManager,
  })),
);
const AffinageTracker = lazy(() => import("../../features/affinage/components/AffinageTracker"));

export function AffinagePage() {
  const [activeTab, setActiveTab] = usePersistentTab<"caves" | "suivi">("subnavigation:affinage", "caves");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("lot")) {
      setActiveTab("suivi");
    }
  }, [searchParams, setActiveTab]);

  return (
    <div className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-5 py-2 pointer-events-auto sm:px-1 sm:py-3">
      
      {/* En-tête Global de la Section */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Espace Affinage & Caves
          </h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos zones de stockage et suivez la maturation de vos produits en temps réel.
          </p>
        </div>
      </div>

      {/* Navigation par Onglets (Contrôlée explicitement) */}
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as "caves" | "suivi")} 
        className="w-full space-y-5 pl-2 sm:pl-3 lg:pl-4"
      >
        <PageTabsPortal>
          <FloatingSubnavigation
            value={activeTab}
            items={[
              { value: "caves", label: "Gestion des Caves", icon: Warehouse },
              { value: "suivi", label: "Suivi de Maturation", icon: Sparkles },
            ]}
            onValueChange={setActiveTab}
            ariaLabel="Navigation de l'affinage"
          />
        </PageTabsPortal>

        {/* Vue 1: Gestion physique des caves et plans */}
        <TabsContent value="caves" className="m-0 space-y-4">
          <Suspense fallback={<LazyContentFallback />}>
            <CaveManager />
          </Suspense>
        </TabsContent>

        {/* Vue 2: Suivi opérationnel des lots de fromages */}
        <TabsContent value="suivi" className="m-0 space-y-4">
          <Suspense fallback={<LazyContentFallback />}>
            <AffinageTracker />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AffinagePage;
