import styles from "./Manufacturing.module.css"
import Navigation from "./../../reusable_sections/Header"
import Fabrications from "./sections/Fabrications"
import Fabrication from "./sections/Fabrication"
import Legal from "./../../reusable_sections/Footer"
import Monitoring from "./sections/Monitoring"
import RecipeManager from "./sections/RecipeManager"

export default function ManufacturingPage() {

  return (
    <main className={styles.manufacturingPage}>
      <Navigation />

      <section className="bg-card/70 border-b border-border/60 text-foreground">
        <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 lg:px-16">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] lg:grid-cols-[1.7fr_1fr] md:items-center lg:items-center">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Atelier de fabrication</p>
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
                Pilotage des fabrications & traçabilité
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                Suivez vos lots, contrôlez vos paramètres et gérez les recettes avec une vue claire de l'ensemble du processus de production.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[2rem] border border-border bg-background/90 p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Flux de production</p>
                <p className="mt-3 text-2xl font-semibold text-foreground">Fabrication, monitoring, recette</p>
              </div>
              <div className="rounded-[2rem] border border-border bg-background/90 p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Traçabilité</p>
                <p className="mt-3 text-2xl font-semibold text-foreground">Du lait au lot final</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-24">
        <Fabrication />
        <Fabrications />
        <Monitoring />
        <RecipeManager />
      </div>

      <Legal />
    </main>
  )
}