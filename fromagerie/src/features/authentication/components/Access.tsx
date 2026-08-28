"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "./../../../components/ui/button";
import { useRevealOnScroll } from "./../../../hooks/useRevealOnScroll";

export default function Access() {
  const [activeChip, setActiveChip] = useState("Employé");

  const skinTypes = [
    { label: "Employé" },
    { label: "Propriétaire" },
  ];

  const collageImages = [
    {
      src: "https://wpvc-images.s3.us-east-1.amazonaws.com/images/1714755/img/fromagerie_production_line.png",
      srcset: "https://wpvc-images.s3.us-east-1.amazonaws.com/images/1714755/img/fromagerie_production_line.png-wvc-srcset",
      sizes: "https://wpvc-images.s3.us-east-1.amazonaws.com/images/1714755/img/fromagerie_production_line.png-wvc-sizes",
      alt: "Ligne de production artisanale avec suivi de lots",
      rotation: "-rotate-3",
      offset: "translate-y-8",
      width: "w-full md:w-[28%]",
    },
    {
      src: "https://wpvc-images.s3.us-east-1.amazonaws.com/images/1714755/img/fromagerie_aging_cave.png",
      srcset: "https://wpvc-images.s3.us-east-1.amazonaws.com/images/1714755/img/fromagerie_aging_cave.png-wvc-srcset",
      sizes: "https://wpvc-images.s3.us-east-1.amazonaws.com/images/1714755/img/fromagerie_aging_cave.png-wvc-sizes",
      alt: "Vue intérieure de la cave d'affinage avec fromages étiquetés",
      rotation: "rotate-0",
      offset: "translate-y-0",
      width: "w-full md:w-[40%]",
    },
    {
      src: "https://wpvc-images.s3.us-east-1.amazonaws.com/images/1714755/img/fromagerie_quality_control.webp",
      srcset: "https://wpvc-images.s3.us-east-1.amazonaws.com/images/1714755/img/fromagerie_quality_control.webp-wvc-srcset",
      sizes: "https://wpvc-images.s3.us-east-1.amazonaws.com/images/1714755/img/fromagerie_quality_control.webp-wvc-sizes",
      alt: "Contrôle qualité et traçabilité des paramètres de fabrication",
      rotation: "rotate-3",
      offset: "translate-y-12",
      width: "w-full md:w-[28%]",
    },
  ];

  const intro = useRevealOnScroll<HTMLDivElement>({ once: true, threshold: 0.15 });
  const chipsReveal = useRevealOnScroll<HTMLDivElement>({ once: true, threshold: 0.15 });
  const collageReveal = useRevealOnScroll<HTMLDivElement>({ once: true, threshold: 0.1 });

  return (
    <section data-section-id="438"
      id="accès-plateforme"
      className="relative w-full bg-background py-24 md:py-32 overflow-hidden dark bg-background text-foreground"
    >
      {}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-border" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-6 md:px-10">
        {}
        <div
          ref={intro.ref}
          className={`mx-auto max-w-4xl text-center transition-all duration-1000 ease-out ${
            intro.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <p className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-primary mb-8">
            — Accès Opérationnel —
          </p>

          <h1 className="font-default text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-foreground">
            Gestion précise de{" "}
            <span className="italic font-light text-primary">votre production.</span>
          </h1>

          <p className="mt-8 md:mt-10 font-default text-base md:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            Accédez à vos outils de traçabilité, de suivi des lots et de planification. 
            Une interface dédiée pour optimiser vos coûts et garantir la qualité de chaque fromage.
            <br className="hidden md:block" />
            Connectez-vous pour piloter votre fromagerie.
          </p>
        </div>

        {}
        <div
          ref={chipsReveal.ref}
          className={`mt-12 md:mt-16 transition-all duration-1000 delay-150 ease-out ${
            chipsReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="flex md:justify-center gap-3 md:gap-4 overflow-x-auto pb-2 md:pb-0 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {skinTypes.map((skin, i) => {
              const isActive = activeChip === skin.label;
              return (
                <Button
                  key={skin.label}
                  data-index={i}
                  onClick={() => setActiveChip(skin.label)}
                  variant="outline"
                  size="lg"
                  className={`shrink-0 rounded-lg px-6 md:px-7 h-11 font-mono text-xs uppercase tracking-[0.2em] transition-all duration-300 ${
                    isActive
                      ? "bg-primary border-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-md"
                      : "bg-transparent border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  }`}
                >
                  {skin.label}
                </Button>
              );
            })}
          </div>
        </div>

        {}
        <div
          ref={collageReveal.ref}
          className={`mt-16 md:mt-24 transition-all duration-1200 delay-300 ease-out ${
            collageReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {}
          <div className="md:hidden">
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <img
                src={collageImages[1].src}
                data-wvc-srcset={collageImages[1].srcset}
                data-wvc-sizes={collageImages[1].sizes}
                alt={collageImages[1].alt}
                loading="lazy"
                decoding="async"
                className="w-full h-[420px] object-cover"
              />
            </div>
          </div>

          {}
          <div className="hidden md:flex items-center justify-center gap-[-4%] relative">
            {collageImages.map((image, i) => (
              <div
                key={i}
                data-index={i}
                className={`relative ${image.width} ${image.rotation} ${image.offset} transition-transform duration-700 hover:rotate-0 hover:scale-[1.02] hover:z-20 ${
                  i === 1 ? "z-10 -mx-6 lg:-mx-10" : "z-0"
                }`}
              >
                <div className="relative overflow-hidden rounded-lg shadow-xl bg-card">
                  <img
                    src={image.src}
                    data-wvc-srcset={image.srcset}
                    data-wvc-sizes={image.sizes}
                    alt={image.alt}
                    loading="lazy"
                    decoding="async"
                    className={`w-full object-cover ${
                      i === 1 ? "h-[520px] lg:h-[600px]" : "h-[400px] lg:h-[460px]"
                    }`}
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-foreground/5 pointer-events-none rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {}
        <div className="mt-16 md:mt-24 flex flex-col items-center gap-3">
          <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-muted-foreground">
            Accéder au tableau de bord
          </span>
          <ChevronDown
            className="size-5 text-primary animate-bounce"
            aria-hidden="true"
            strokeWidth={1.5}
          />
        </div>
      </div>
    </section>
  );
}