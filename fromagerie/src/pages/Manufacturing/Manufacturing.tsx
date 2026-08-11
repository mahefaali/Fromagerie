import styles from "./Manufacturing.module.css"
import FabricationManager from "./sections/FabricationManager"
import Monitoring from "./sections/Monitoring"
import RecipeManager from "./sections/RecipeManager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./../../components/ui/tabs"

const sections = [
  { id: "fabrications", title: "Registre des fabrications", Component: FabricationManager },
  { id: "monitoring", title: "Monitoring", Component: Monitoring },
  { id: "recipe-manager", title: "Recettes", Component: RecipeManager },
]

function ManufacturingHero() {
  return (
    <section className="bg-card/70 border-b border-border/60 text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 md:px-10 lg:px-16">
        {/* Passer en 2 colonnes uniquement à partir de lg (1024px) pour laisser respirer la tablette */}
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="space-y-4 sm:space-y-6 text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Atelier de fabrication</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">
              Pilotage des fabrications et traçabilité
            </h1>
            <p className="max-w-2xl text-sm sm:text-base leading-relaxed sm:leading-7 text-muted-foreground">
              Gérez vos lots, surveillez vos paramètres et pilotez vos recettes dans une interface vraiment intégrée.
            </p>
          </div>

          {/* Cartes : 2 colonnes sur tablette (quand le hero est sur 1 col), 1 ou 2 cols selon la taille sur desktop */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div className="rounded-2xl sm:rounded-[2rem] border border-border bg-background/90 p-4 sm:p-6 shadow-sm">
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-muted-foreground">
                Flux de production
              </p>
              <p className="mt-2 sm:mt-3 text-lg sm:text-xl font-semibold text-foreground leading-snug">
                Fabrication, monitoring, recette
              </p>
            </div>
            <div className="rounded-2xl sm:rounded-[2rem] border border-border bg-background/90 p-4 sm:p-6 shadow-sm">
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-muted-foreground">
                Traçabilité
              </p>
              <p className="mt-2 sm:mt-3 text-lg sm:text-xl font-semibold text-foreground leading-snug">
                Du lait au lot final
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

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
      <ManufacturingHero />
      <ManufacturingTabs />
    </main>
  )
}