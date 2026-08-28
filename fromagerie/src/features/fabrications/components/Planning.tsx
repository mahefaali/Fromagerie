"use client";

import { ArrowRight } from "lucide-react";
import { Link } from "./../../../components/common/Link";
import { Button } from "./../../../components/ui/button";
import { useRevealOnScroll } from "./../../../hooks/useRevealOnScroll";

export default function Planning() {
  const { ref: contentRef, isVisible: contentVisible } = useRevealOnScroll<HTMLDivElement>();
  const { ref: imageRef, isVisible: imageVisible } = useRevealOnScroll<HTMLDivElement>();

  const specs = [
    { label: "DÉLAI DE PRODUCTION", value: "2-4 SEMAINES" },
    { label: "SUIVI TECHNIQUE", value: "INCLUS" },
    { label: "À PARTIR DE", value: "2 400 €" },
  ];

  return (
    <section data-section-id="4969"
      id="planification-hebdomadaire"
      className="relative dark bg-background text-foreground overflow-hidden py-32 md:py-[200px] px-6 md:px-10"
    >
      {}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "80px 80px"
        }} />
      </div>

      {}
      <div className="absolute top-6 left-6 flex items-center gap-2 font-mono text-[10px] text-muted-foreground tracking-widest">
        <span className="block w-3 h-px bg-muted-foreground" />
        <span className="block w-px h-3 bg-muted-foreground" />
        <span>SEC / 07</span>
      </div>
      <div className="absolute top-6 right-6 font-mono text-[10px] text-muted-foreground tracking-widest hidden md:block">
        FROMAGERIE.ARTISANALE / PLANNING
      </div>

      <div className="relative mx-auto max-w-[1400px] grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
        {}
        <div
          ref={contentRef}
          data-index={0}
          className={`lg:col-span-2 transition-all duration-1000 ease-out ${
            contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {}
          <div className="flex items-center gap-3 mb-10">
            <span className="font-mono text-[11px] tracking-[0.2em] text-primary">
              &sect; GESTION / FABRICATION
            </span>
          </div>

          {}
          <h2 className="font-default font-semibold text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight mb-8">
            Optimisez votre
            <br />
            <span className="text-primary">production.</span>
          </h2>

          {}
          <p className="font-default text-base text-muted-foreground leading-relaxed max-w-md mb-10">
            Gérez vos cycles de fabrication avec une traçabilité totale. 
            De la réception du lait au suivi des lots en affinage, 
            notre système vous permet de piloter vos coûts et vos 
            indicateurs de performance en temps réel.
          </p>

          {}
          <div className="border-t border-border mb-10">
            {specs.map((spec, i) => (
              <div
                key={i}
                data-index={i}
                className="flex items-center justify-between py-4 border-b border-border font-mono text-xs tracking-widest"
              >
                <span className="text-muted-foreground">{spec.label}</span>
                <span className="text-foreground">&middot; {spec.value}</span>
              </div>
            ))}
          </div>

          {}
          <div className="flex flex-col gap-3 max-w-sm">
            <Button
              asChild
              size="lg"
              className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-mono text-xs tracking-[0.2em] justify-between"
            >
              <Link to="/fabrication">
                CRÉER UNE FABRICATION
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-6 bg-transparent border border-border text-foreground hover:bg-muted hover:text-foreground rounded-md font-mono text-xs tracking-[0.2em] justify-between"
            >
              <Link to="/DashboardPage">
                VOIR LE TABLEAU DE BORD
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        {}
        <div
          ref={imageRef}
          data-index={1}
          className={`lg:col-span-3 relative transition-all duration-1000 ease-out delay-200 ${
            imageVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
          }`}
        >
          <div className="relative aspect-[4/5] lg:aspect-[5/6] w-full">
            {}
            <div className="absolute -top-3 -left-3 w-8 h-8 border-t border-l border-primary z-20" />
            <div className="absolute -top-3 -right-3 w-8 h-8 border-t border-r border-primary z-20" />
            <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b border-l border-primary z-20" />
            <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b border-r border-primary z-20" />

            {}
            <div className="absolute top-1/2 -left-5 w-3 h-px bg-primary/60 z-20" />
            <div className="absolute top-1/2 -right-5 w-3 h-px bg-primary/60 z-20" />
            <div className="absolute -top-5 left-1/2 w-px h-3 bg-primary/60 z-20" />
            <div className="absolute -bottom-5 left-1/2 w-px h-3 bg-primary/60 z-20" />

            {}
            <img
              src="https://wpvc-images.s3.us-east-1.amazonaws.com/images/1714755/img/fromagerie_production_tracking.png"
              data-wvc-srcset="https://wpvc-images.s3.us-east-1.amazonaws.com/images/1714755/img/fromagerie_production_tracking.png-wvc-srcset"
              data-wvc-sizes="https://wpvc-images.s3.us-east-1.amazonaws.com/images/1714755/img/fromagerie_production_tracking.png-wvc-sizes"
              alt="Suivi de la production fromagère et traçabilité des lots"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover rounded-md"
            />

            {}
            <div className="absolute inset-0 bg-gradient-to-tr from-background/60 via-transparent to-transparent rounded-md pointer-events-none" />

            {}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-background/80 backdrop-blur-sm border border-border rounded-sm z-10">
              <span className="block w-1.5 h-1.5 bg-primary animate-pulse rounded-sm" />
              <span className="font-mono text-[10px] tracking-[0.15em] text-foreground">
                FABRICATION EN COURS &middot; LOT-2024-A
              </span>
            </div>

            {}
            <div className="absolute bottom-4 right-4 px-3 py-2 bg-background/80 backdrop-blur-sm border border-border rounded-sm z-10">
              <div className="font-mono text-[9px] tracking-widest text-muted-foreground mb-0.5">
                RENDEMENT
              </div>
              <div className="font-mono text-[10px] tracking-widest text-primary">
                +98.4% / CIBLE
              </div>
            </div>

            {}
            <div className="absolute top-1/2 -translate-y-1/2 -right-2 hidden md:flex">
              <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground vertical-text" style={{ writingMode: "vertical-rl" }}>
                TRAÇABILITÉ / QUALITÉ / 2024
              </span>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="absolute bottom-6 right-6 font-mono text-[10px] text-muted-foreground tracking-widest hidden md:flex items-center gap-2">
        <span>REC / 0118</span>
        <span className="block w-px h-3 bg-muted-foreground" />
        <span className="block w-3 h-px bg-muted-foreground" />
      </div>
    </section>
  );
}