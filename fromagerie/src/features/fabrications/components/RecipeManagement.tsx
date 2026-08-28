"use client";

import { ArrowRight, Layers, Palette, Sofa } from "lucide-react";

import { Link } from "./../../../components/common/Link";
import { Button } from "./../../../components/ui/button";
import { Card } from "./../../../components/ui/card";
import { useRevealOnScroll } from "./../../../hooks/useRevealOnScroll";

export default function RecipeManagement() {
  const header = useRevealOnScroll<HTMLDivElement>({ threshold: 0.2 });
  const cardsReveal = useRevealOnScroll<HTMLDivElement>({ threshold: 0.1 });

  const pillars = [
    {
      number: "01",
      title: "TRAÇABILITÉ",
      Icon: Palette,
      body: "Assurez une transparence totale de la traite à l'affinage. Chaque lot est documenté avec précision, incluant l'origine du lait, les dates de production et les paramètres techniques.",
      italic: "La rigueur au service de la qualité.",
      offset: "md:translate-y-0",
    },
    {
      number: "02",
      title: "GESTION DES STOCKS",
      Icon: Layers,
      body: "Visualisez en temps réel l'état de vos caves d'affinage. Optimisez le roulement des stocks et anticipez les besoins de production pour répondre aux commandes clients.",
      italic: "Maîtrisez chaque étape de l'affinage.",
      offset: "md:-translate-y-12",
    },
    {
      number: "03",
      title: "PERFORMANCE",
      Icon: Sofa,
      body: "Analysez vos coûts de production, vos rendements et vos marges. Des indicateurs clés pour piloter votre fromagerie avec efficacité et rentabilité.",
      italic: "Des décisions basées sur des données.",
      offset: "md:translate-y-12",
    },
  ];

  return (
    <section data-section-id="3504"
      id="recipemanagement"
      className="bg-background text-foreground py-24 md:py-36 px-6 md:px-12 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {}
        <div
          ref={header.ref}
          className={`text-center mb-16 md:mb-24 transition-all duration-1000 ease-out ${
            header.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p
            className="font-default font-bold tracking-[0.3em] uppercase mb-6"
            style={{ color: "var(--primary)", fontSize: "11px" }}
          >
            Notre Expertise
          </p>
          <h2 className="font-default font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tight text-foreground leading-[0.95] mb-6">
            PILOTAGE OPÉRATIONNEL
            <span style={{ color: "var(--primary)" }}>.</span>
          </h2>
          <p className="font-default italic text-lg text-muted-foreground max-w-xl mx-auto">
            Une gestion précise pour une fromagerie d'excellence.
          </p>
        </div>

        {}
        <div
          ref={cardsReveal.ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8"
        >
          {pillars.map((pillar, i) => {
            const Icon = pillar.Icon;
            return (
              <div
                key={i}
                data-index={i}
                className={`group transition-all duration-1000 ease-out ${pillar.offset} ${
                  cardsReveal.isVisible
                    ? "opacity-100"
                    : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <Card
                  className="relative h-full min-h-[520px] p-10 flex flex-col rounded-lg border backdrop-blur-sm transition-all duration-500 ease-out group-hover:-translate-y-2"
                  style={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                >
                  {}
                  <div
                    className="absolute inset-0 rounded-lg border opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ borderColor: "var(--primary)" }}
                  />

                  {}
                  <div className="flex items-center justify-between mb-10">
                    <span
                      className="font-default font-bold tracking-widest uppercase"
                      style={{ color: "var(--primary)", fontSize: "13px" }}
                    >
                      {pillar.number}
                    </span>
                  </div>

                  {}
                  <div className="mb-10">
                    <Icon
                      className="w-16 h-16 transition-transform duration-500 group-hover:scale-110"
                      strokeWidth={1.5}
                      style={{ color: "var(--primary)" }}
                    />
                  </div>

                  {}
                  <h3 className="font-default font-extrabold text-3xl md:text-4xl text-foreground mb-5 tracking-tight leading-tight">
                    {pillar.title}
                  </h3>

                  {}
                  <div
                    className="h-[2px] w-6 mb-6"
                    style={{ backgroundColor: "var(--primary)" }}
                  />

                  {}
                  <p className="font-default font-light text-[17px] leading-relaxed text-foreground/90 mb-2">
                    {pillar.body}
                  </p>
                  <p className="font-default italic text-[17px] leading-relaxed text-foreground/70 mb-10">
                    {pillar.italic}
                  </p>

                  {}
                  <div className="mt-auto pt-6">
                    <Button
                      asChild
                      variant="ghost"
                      className="h-auto p-0 font-default font-bold tracking-widest uppercase text-xs hover:bg-transparent group/btn"
                      style={{ color: "var(--primary)" }}
                    >
                      <Link to="/ManufacturingPage">
                        En savoir plus
                        <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}