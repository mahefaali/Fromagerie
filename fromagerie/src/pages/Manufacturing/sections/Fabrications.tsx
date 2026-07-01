"use client";

import { useState } from "react";
import { useRevealOnScroll } from "./../../../hooks/useRevealOnScroll";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./../../../components/ui/tabs";
import { Modal } from "./../../../components/ui/modal";
import { LotDetails, type FabricationLot } from "./../../../components/ui/LotDetails";

export default function Fabrications() {
  const { ref: headRef, isVisible: headVisible } = useRevealOnScroll<HTMLDivElement>({ threshold: 0.15 });
  const [activeLot, setActiveLot] = useState<FabricationLot | null>(null);

  const tastingAutumn = [
    {
      name: "Comté Affinage 12 Mois",
      description: "Pâte pressée cuite, affiné en cave humide avec un contrôle strict de la température.",
      provenance: "LAIT CRU DE MONTAGNE · AFFINAGE 12 MOIS",
      price: "28",
    },
    {
      name: "Tomme de Brebis",
      description: "Fromage à pâte pressée non cuite, texture souple et arômes de noisette.",
      provenance: "LAIT DE BREBIS · TERROIR LOCAL",
      price: "34",
    },
    {
      name: "Bleu de Chèvre",
      description: "Pâte persillée, affinage en cave ventilée pour un développement optimal des ferments.",
      provenance: "LAIT DE CHÈVRE · FERMENTS SÉLECTIONNÉS",
      price: "42",
    },
    {
      name: "Reblochon Fermier",
      description: "Fromage onctueux, croûte lavée, suivi rigoureux du taux d'humidité.",
      provenance: "LAIT ENTIER · AFFINAGE EN CAVE",
      price: "48",
    },
    {
      name: "Crème de Gruyère",
      description: "Préparation artisanale, texture fondante avec une pointe de sel de mer.",
      provenance: "LAIT DE VACHE · SEL DE GUÉRANDE",
      price: "22",
    },
  ];

  const tastingVeg = [
    {
      name: "Yaourt Artisanal",
      description: "Fermentation lente en étuve, texture ferme et onctueuse.",
      provenance: "LAIT ENTIER · FERMENTS NATURELS",
      price: "24",
    },
    {
      name: "Fromage Blanc Battu",
      description: "Égouttage traditionnel en sac, texture légère et aérienne.",
      provenance: "LAIT DE VACHE · ÉGOUTTAGE LENT",
      price: "36",
    },
    {
      name: "Faisselle Fraîche",
      description: "Caillé frais, moulé à la louche, idéal pour les préparations culinaires.",
      provenance: "LAIT CRU · MOULAGE MANUEL",
      price: "22",
    },
    {
      name: "Petit Frais aux Herbes",
      description: "Fromage frais assaisonné aux herbes de Provence, affinage court.",
      provenance: "LAIT DE CHÈVRE · HERBES FRAÎCHES",
      price: "26",
    },
    {
      name: "Dessert Lacté",
      description: "Crème dessert au lait entier, parfumée à la vanille bourbon.",
      provenance: "LAIT DE VACHE · VANILLE NATURELLE",
      price: "20",
    },
  ];

  const alaCarte = [
    {
      name: "Raclette Tradition",
      description: "Fromage à pâte pressée non cuite, idéal pour la fonte, affinage 3 mois.",
      provenance: "LAIT CRU · AFFINAGE 3 MOIS",
      price: "26",
    },
    {
      name: "Brie de Meaux",
      description: "Pâte molle à croûte fleurie, affinage contrôlé pour une texture coulante.",
      provenance: "LAIT CRU · AFFINAGE 6 SEMAINES",
      price: "38",
    },
    {
      name: "Camembert Fermier",
      description: "Fromage à pâte molle, croûte fleurie, moulé à la louche.",
      provenance: "LAIT CRU · MOULAGE À LA LOUCHE",
      price: "44",
    },
    {
      name: "Morbier AOP",
      description: "Pâte pressée non cuite avec sa raie de cendre, affinage 45 jours.",
      provenance: "LAIT DE VACHE · CENDRE VÉGÉTALE",
      price: "46",
    },
    {
      name: "Fromage Blanc Sucré",
      description: "Fromage blanc battu avec une touche de miel de fleurs.",
      provenance: "LAIT DE VACHE · MIEL ARTISANAL",
      price: "18",
    },
  ];

  const winePairings = [
    {
      name: "Vin Blanc Sec",
      description: "Un vin minéral qui accompagne parfaitement les pâtes pressées.",
      provenance: "VIGNOBLE LOCAL · 125ML",
      price: "18",
    },
    {
      name: "Vin Rouge Léger",
      description: "Tanins souples pour sublimer les fromages à croûte fleurie.",
      provenance: "VIGNOBLE RÉGIONAL · 125ML",
      price: "16",
    },
    {
      name: "Vin Blanc Moelleux",
      description: "Notes fruitées pour équilibrer les fromages persillés.",
      provenance: "VIGNOBLE DE COTEAUX · 125ML",
      price: "20",
    },
    {
      name: "Vin Rosé Frais",
      description: "Acidité maîtrisée pour les fromages frais et chèvres.",
      provenance: "VIGNOBLE DU SUD · 125ML",
      price: "24",
    },
    {
      name: "Vin de Dessert",
      description: "Douceur finale pour accompagner les desserts lactés.",
      provenance: "VIGNOBLE DE CAVE · 75ML",
      price: "22",
    },
  ];

  const tabs = [
    { value: "autumn", label: "Fabrications Affinées", data: tastingAutumn },
    { value: "veg", label: "Produits Frais", data: tastingVeg },
    { value: "alacarte", label: "Sélection du Fromager", data: alaCarte },
    { value: "wine", label: "Accords Fromages-Vins", data: winePairings },
  ];

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
                  <ul className="flex flex-col">
                    {tab.data.map((course, i) => (
                      <li
                        data-index={i}
                        key={course.name}
                        className="group relative"
                      >
                        {}
                        <div className="grid grid-cols-12 gap-4 py-6 md:py-7 px-4 transition-all duration-200 hover:bg-card/40 rounded-3xl border border-border/50 bg-card/80">
                          {}
                          <div className="col-span-12 md:col-span-9 transition-transform duration-200 group-hover:translate-x-1">
                            <h3
                              className="font-default font-medium mb-2"
                              style={{
                                fontSize: "clamp(1.5rem, 2.2vw, 2.25rem)",
                                letterSpacing: "-0.02em",
                                lineHeight: 1.1,
                                color: "var(--foreground)",
                              }}
                            >
                              {course.name}
                            </h3>
                            <p
                              className="font-default mb-3"
                              style={{
                                fontSize: "1rem",
                                lineHeight: 1.55,
                                color: "var(--muted-foreground)",
                              }}
                            >
                              {course.description}
                            </p>
                            <p
                              className="font-mono uppercase"
                              style={{
                                fontSize: "0.6875rem",
                                letterSpacing: "0.08em",
                                color: "var(--chart-2)",
                              }}
                            >
                              <span aria-hidden="true"></span> {course.provenance}
                            </p>
                          </div>

                          {}
                          <div className="col-span-12 md:col-span-3 flex md:justify-end md:items-start">
                            <div className="flex items-baseline gap-1">
                              <span
                                className="font-mono text-xs"
                                style={{ color: "var(--muted-foreground)" }}
                              >
                                €
                              </span>
                              <span
                                className="font-default font-medium tabular-nums"
                                style={{
                                  fontSize: "clamp(1.5rem, 2.2vw, 2.25rem)",
                                  letterSpacing: "-0.02em",
                                  lineHeight: 1,
                                  color: "var(--chart-2)",
                                }}
                              >
                                {course.price}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setActiveLot(course)}
                            className="text-sm font-medium text-primary underline-offset-4 transition hover:text-primary/80"
                          >
                            Voir détails
                          </button>
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