"use client";

import { CircleCheck as CheckCircle2, ShieldCheck, FlaskConical } from 'lucide-react';
import { Link } from "./../../../components/common/Link";
import { Button } from "./../../../components/ui/button";
import { useRevealOnScroll } from "./../../../hooks/useRevealOnScroll";

export default function Ecosystem() {
  const { ref: contentRef, isVisible: contentVisible } = useRevealOnScroll<HTMLDivElement>();
  const { ref: imageRef, isVisible: imageVisible } = useRevealOnScroll<HTMLDivElement>();

  const trustSignals = [
    { icon: FlaskConical, label: "Traçabilité totale" },
    { icon: CheckCircle2, label: "Contrôle qualité" },
    { icon: ShieldCheck, label: "Gestion des lots" },
  ];

  return (
    <section data-section-id="5095"
      id="lécosystème-cave-claire"
      className="bg-background text-foreground relative overflow-hidden"
    >
      {}
      <div className="flex items-center justify-center pt-10 px-6 md:px-12">
        <div className="h-px flex-1 bg-primary/30" />
        <div className="mx-3 h-1.5 w-1.5 rounded-lg bg-primary" />
        <div className="h-px flex-1 bg-primary/30" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {}
          <div
            ref={contentRef}
            className={`lg:col-span-3 transition-all duration-1000 ease-out ${
              contentVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            {}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-10 bg-primary" />
              <span className="font-mono text-xs tracking-[0.2em] uppercase text-primary">
                Fromagerie Artisanale &mdash; Maîtrise et Précision
              </span>
            </div>

            {}
            <h1 className="font-default font-medium text-5xl sm:text-6xl lg:text-7xl xl:text-[88px] leading-[1.02] tracking-tight text-foreground mb-8">
              Gestion de production,
              <br />
              <span className="italic font-light text-foreground/95">
                traçabilité absolue.
              </span>
            </h1>

            {}
            <p className="font-default text-lg leading-relaxed text-muted-foreground max-w-[480px] mb-10">
              Optimisez votre planification de production et gérez vos commandes clients avec une précision clinique. De la réception du lait au suivi des lots en affinage, chaque étape est documentée pour garantir la qualité et la rentabilité de votre fromagerie.
            </p>

            {}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
              <Button
                asChild
                size="lg"
                className="rounded-lg px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-default tracking-wide"
              >
                <Link to="/tableau-de-bord">Accéder au tableau</Link>
              </Button>

              <Link
                to="/fabrication"
                className="group inline-flex items-center gap-2 font-default text-sm tracking-wide text-foreground hover:text-primary transition-colors"
              >
                <span className="border-b border-foreground/40 group-hover:border-primary pb-0.5">
                  Voir les fabrications
                </span>
                <span className="transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </Link>
            </div>
          </div>

          {}
          <div
            ref={imageRef}
            className={`lg:col-span-2 transition-all duration-1000 ease-out delay-200 ${
              imageVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative">
              <div
                className="relative overflow-hidden rounded-lg shadow-lg"
                style={{ aspectRatio: "4 / 5" }}
              >
                <img
                  src="https://wpvc-images.s3.us-east-1.amazonaws.com/images/1714755/img/fromagerie_production_flow.png"
                  data-wvc-srcset="https://wpvc-images.s3.us-east-1.amazonaws.com/images/1714755/img/fromagerie_production_flow.png-wvc-srcset"
                  data-wvc-sizes="https://wpvc-images.s3.us-east-1.amazonaws.com/images/1714755/img/fromagerie_production_flow.png-wvc-sizes"
                  alt="Fromagerie Artisanale — suivi de production et traçabilité des lots"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>

              {}
              <div className="absolute -bottom-5 left-4 sm:left-6 bg-card/95 backdrop-blur-sm border border-border rounded-lg px-5 py-3 shadow-md">
                <p className="font-default italic text-sm text-card-foreground">
                  Indicateur:{" "}
                  <span className="not-italic font-default text-xs tracking-wider uppercase text-muted-foreground">
                    Rendement Lot #44-A
                  </span>
                  <span className="mx-2 text-primary">&middot;</span>
                  <span className="not-italic font-mono text-sm text-primary">
                    98.2%
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="mt-20 md:mt-24 pt-10 border-t border-border/60">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
            {trustSignals.map((signal, i) => {
              const Icon = signal.icon;
              return (
                <div
                  key={i}
                  data-index={i}
                  className="flex items-center gap-3"
                >
                  <Icon
                    className="h-4 w-4 text-primary"
                    strokeWidth={1.25}
                  />
                  <span className="font-mono text-xs tracking-[0.18em] uppercase text-muted-foreground">
                    {signal.label}
                  </span>
                  {i < trustSignals.length - 1 && (
                    <span className="hidden sm:inline-block text-muted-foreground/40 ml-9">
                      &middot;
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {}
      <div className="flex items-center justify-center pb-10 px-6 md:px-12">
        <div className="h-px flex-1 bg-primary/30" />
        <div className="mx-3 h-1.5 w-1.5 rounded-lg bg-primary" />
        <div className="h-px flex-1 bg-primary/30" />
      </div>
    </section>
  );
}