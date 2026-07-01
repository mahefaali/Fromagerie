"use client";

import { Phone } from "lucide-react";
import { Card } from "./../../../components/ui/card";

export default function Workflow() {
  const steps = [
    {
      number: "1",
      title: "Saisie de la recette",
      description: "Enregistrez les paramètres de votre fabrication : type de lait, ferments, et temps de maturation."
    },
    {
      number: "2",
      title: "Suivi en cave",
      description: "Visualisez l'emplacement de chaque lot dans vos caves d'affinage en temps réel."
    },
    {
      number: "3",
      title: "Contrôle qualité",
      description: "Saisissez vos relevés de pH et de poids pour garantir la conformité de chaque lot."
    },
    {
      number: "4",
      title: "Analyse de rendement",
      description: "Consultez vos indicateurs de rentabilité et optimisez vos coûts de production par lot.",
      badge: true
    }
  ];

  return (
    <section data-section-id="626"
      id="architecture-du-flux"
      className="relative overflow-hidden bg-background py-20 md:py-28 lg:py-32"
    >
      {}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 font-mono text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Processus opérationnel
          </p>
          <h2 className="font-serif text-4xl font-semibold leading-tight text-foreground sm:text-5xl md:text-[56px] md:leading-[1.1]">
            Comment gérer votre production
          </h2>
        </div>

        {}
        <div className="relative mt-16 md:mt-20">
          {}
          <div
            className="pointer-events-none absolute left-0 right-0 top-14 hidden lg:block"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 1200 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-full"
              preserveAspectRatio="none"
            >
              <path
                d="M 60 20 Q 200 -10, 350 20 T 650 20 T 950 20 T 1140 20"
                stroke="hsl(15 54% 53%)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="1 0"
                fill="none"
                opacity="0.7"
              />
            </svg>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-10 lg:grid-cols-4 lg:gap-6">
            {steps.map((step, i) => (
              <div
                key={i}
                data-index={i}
                className="relative flex flex-col items-center text-center"
              >
                {}
                {i < steps.length - 1 && (
                  <div
                    className="absolute left-1/2 top-32 hidden h-12 -translate-x-1/2 sm:block md:hidden"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 20 48"
                      className="h-12 w-5"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M 10 0 Q 0 12, 10 24 T 10 48"
                        stroke="hsl(15 54% 53%)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                        opacity="0.7"
                      />
                    </svg>
                  </div>
                )}

                {}
                <div className="relative">
                  <div className="flex h-28 w-28 items-center justify-center rounded-lg border border-border bg-card shadow-md">
                    <span className="font-serif text-5xl font-semibold text-foreground">
                      {step.number}
                    </span>
                  </div>

                  {}
                  {step.badge && (
                    <div className="absolute -right-4 -top-4 rotate-12 transform">
                      <div className="rounded-lg border border-primary bg-primary px-3 py-1.5 shadow-md">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground">
                          Optimisé
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {}
                <div className="mt-6 px-2">
                  <h3 className="font-serif text-2xl font-semibold leading-tight text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-foreground/70">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {}
        <div className="mt-16 flex justify-center md:mt-20">
          <Card className="flex w-full max-w-2xl flex-row items-center justify-center gap-3 border border-border bg-card px-6 py-5 shadow-md backdrop-blur-sm sm:gap-4 sm:px-8">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Phone className="h-5 w-5 text-primary" strokeWidth={2} />
            </div>
            <p className="text-sm leading-relaxed text-foreground sm:text-base">
              Besoin d'aide ? Contactez notre support technique au{" "}
              <span className="font-semibold text-primary">
                01 23 45 67 89
              </span>{" "}
              <span className="text-foreground/70">— réponse sous 24h.</span>
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}