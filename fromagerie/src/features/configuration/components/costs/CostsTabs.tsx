import { Tabs, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { DepreciationCostsTab } from "./DepreciationCostsTab";
import { EnergyCostsTab } from "./EnergyCostsTab";
import { LaborCostsTab } from "./LaborCostsTab";
import { MilkCostsTab } from "./MilkCostsTab";
import { PackagingCostsTab } from "./PackagingCostsTab";
import type { CostsConfigurationModel } from "./useCostsConfiguration";

export function CostsTabs({ model }: { model: CostsConfigurationModel }) {
  return (
    <Tabs defaultValue="lait" className="w-full">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
        <TabsTrigger value="lait">Lait</TabsTrigger>
        <TabsTrigger value="emballages">Emballages</TabsTrigger>
        <TabsTrigger value="energie">Énergie</TabsTrigger>
        <TabsTrigger value="main-oeuvre">Main-d'œuvre</TabsTrigger>
        <TabsTrigger value="amortissements">Amortissements</TabsTrigger>
      </TabsList>
      <MilkCostsTab model={model} />
      <PackagingCostsTab model={model} />
      <EnergyCostsTab model={model} />
      <LaborCostsTab model={model} />
      <DepreciationCostsTab model={model} />
    </Tabs>
  );
}
