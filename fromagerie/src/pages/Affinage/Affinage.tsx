import { useState } from "react";
import { Warehouse, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./../../components/ui/tabs";
import { CaveManager } from "./sections/CaveManager";
import AffinageTracker from "./sections/AffinageTracker";

export function AffinagePage() {
  const [activeTab, setActiveTab] = useState<string>("caves");

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 relative pointer-events-auto">
      
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
        onValueChange={setActiveTab} 
        className="w-full space-y-6"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="caves" className="flex items-center gap-2">
            <Warehouse className="size-4" />
            Gestion des Caves
          </TabsTrigger>
          <TabsTrigger value="suivi" className="flex items-center gap-2">
            <Sparkles className="size-4" />
            Suivi de Maturation
          </TabsTrigger>
        </TabsList>

        {/* Vue 1: Gestion physique des caves et plans */}
        <TabsContent value="caves" className="m-0 space-y-4">
          <CaveManager />
        </TabsContent>

        {/* Vue 2: Suivi opérationnel des lots de fromages */}
        <TabsContent value="suivi" className="m-0 space-y-4">
          <AffinageTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AffinagePage;