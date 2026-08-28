import styles from "./Manufacturing.module.css"
import FabricationManager from "../../features/fabrications/components/FabricationManager"
import Monitoring from "../../features/fabrications/components/Monitoring"
import RecipeManager from "../../features/fabrications/components/RecipeManager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./../../components/ui/tabs"

const sections = [
  { id: "fabrications", title: "Registre des fabrications", Component: FabricationManager },
  { id: "monitoring", title: "Suivi des paramètres", Component: Monitoring },
  { id: "recipe-manager", title: "Recettes", Component: RecipeManager },
]

function ManufacturingTabs() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-16 md:px-10 lg:px-16">
      <Tabs defaultValue={sections[0].id} className="space-y-8 sm:space-y-10">
        {/* Ajout du scroll horizontal sans barre de scroll si les onglets dépassent sur petit écran */}
        <div className="overflow-x-auto no-scrollbar pb-2">
          <TabsList className="inline-flex w-full sm:w-auto items-center justify-start sm:justify-center gap-2 rounded-full bg-muted/50 p-1 shadow-sm ring-1 ring-border/10">
            {sections.map((section) => (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="shrink-0 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-lg"
              >
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="space-y-8 sm:space-y-10">
          {sections.map(({ id, Component }) => (
            <TabsContent key={id} value={id} className="outline-none">
              <Component />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </section>
  )
}

export default function ManufacturingPage() {
  return (
    <main className={`${styles.manufacturingPage} pb-24`}>
      <ManufacturingTabs />
    </main>
  )
}
