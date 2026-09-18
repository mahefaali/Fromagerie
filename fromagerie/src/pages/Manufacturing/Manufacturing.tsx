import { lazy, Suspense } from "react"
import { Activity, BookOpen, ClipboardList, Milk } from "lucide-react"
import styles from "./Manufacturing.module.css"
import { Tabs, TabsContent } from "./../../components/ui/tabs"
import { LazyContentFallback } from "../../components/common/LazyContentFallback"
import { PageTabsPortal } from "../../layouts/components/PageTabsPortal"
import { usePersistentTab } from "../../hooks/usePersistentTab"
import { FloatingSubnavigation } from "../../components/ui/FloatingSubnavigation"

const FabricationManager = lazy(() => import("../../features/fabrications/components/FabricationManager"))
const Monitoring = lazy(() => import("../../features/fabrications/components/Monitoring"))
const RecipeManager = lazy(() => import("../../features/fabrications/components/RecipeManager"))
const LotMilkManager = lazy(() => import("../../features/tracabilite/LotMilkManager"))

const sections = [
  { id: "fabrications", title: "Registre des fabrications", icon: ClipboardList, Component: FabricationManager },
  { id: "monitoring", title: "Suivi des paramètres", icon: Activity, Component: Monitoring },
  { id: "recipe-manager", title: "Recettes", icon: BookOpen, Component: RecipeManager },
  { id: "milk-lots", title: "Lots de lait", icon: Milk, Component: LotMilkManager },
]

function ManufacturingTabs() {
  const [activeTab, setActiveTab] = usePersistentTab("subnavigation:production", sections[0].id)

  return (
    <section className="min-h-[calc(100vh-7.5rem)] w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <PageTabsPortal>
          <FloatingSubnavigation
            value={activeTab}
            items={sections.map((section) => ({
              value: section.id,
              label: section.title,
              icon: section.icon,
            }))}
            onValueChange={setActiveTab}
            ariaLabel="Navigation de la production"
          />
        </PageTabsPortal>

        <div className="w-full">
          {sections.map(({ id, Component }) => (
            <TabsContent key={id} value={id} className="m-0 min-h-[calc(100vh-7.5rem)] w-full outline-none">
              <Suspense fallback={<LazyContentFallback />}>
                <Component />
              </Suspense>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </section>
  )
}

export default function ManufacturingPage() {
  return (
    <main className={`${styles.manufacturingPage} min-h-[calc(100vh-7.5rem)] w-full`}>
      <ManufacturingTabs />
    </main>
  )
}
