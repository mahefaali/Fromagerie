"use client";

import { useRevealOnScroll } from "./../../../hooks/useRevealOnScroll";

export default function Traceability() {
  const { ref: headerRef, isVisible: headerVisible } = useRevealOnScroll<HTMLDivElement>();

  const values = [
    {
      numeral: "I",
      title: "Traçabilité Totale",
      description:
        "Chaque lot est documenté de la réception du lait jusqu'à l'affinage final. Nous enregistrons chaque paramètre critique pour garantir une transparence absolue sur l'origine et la transformation.",
    },
    {
      numeral: "II",
      title: "Suivi des Stocks",
      description:
        "Visualisez en temps réel l'emplacement de vos fromages dans les caves. Gérez vos stocks avec précision pour optimiser la rotation et garantir une qualité constante à chaque étape.",
    },
    {
      numeral: "III",
      title: "Maîtrise des Coûts",
      description:
        "Analysez les coûts de production par type de fromage et par lot. Identifiez les marges, suivez les rendements et ajustez vos processus pour une rentabilité optimale.",
    },
    {
      numeral: "IV",
      title: "Indicateurs de Performance",
      description:
        "Pilotez votre fromagerie grâce à des indicateurs clés : taux de perte, rendement matière et rentabilité. Des données précises pour des décisions de production éclairées.",
    },
  ];

  return (
    <section data-section-id="3603"
      id="maîtrise-de-la-traçabilité"
      className="bg-background text-foreground py-[200px] px-6 md:px-10 lg:px-16 relative overflow-hidden"
    >
      {}
      <div
        ref={headerRef}
        className={`max-w-7xl mx-auto mb-20 md:mb-28 transition-all duration-1000 ease-out ${
          headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="grid grid-cols-12 gap-4 items-end">
          <div className="col-span-12 md:col-span-3">
            <span
              className="font-mono text-xs tracking-widest uppercase"
              style={{ color: "var(--chart-1)" }}
            >
              03 / PRINCIPES
            </span>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h2
              className="font-default font-bold leading-[0.95] tracking-tight"
              style={{ fontSize: "clamp(3rem, 8vw, 8rem)" }}
            >
              <span className="block text-foreground">NOTRE</span>
              <span
                className="block font-serif italic font-light"
                style={{ color: "var(--chart-1)" }}
              >
                maîtrise
              </span>
            </h2>
          </div>
        </div>
        <div className="mt-12 h-px w-full bg-border" />
      </div>

      {}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {values.map((value, i) => {
          const isFourth = i === 3;
          return (
            <ValueCard
              key={i}
              data-index={i}
              numeral={value.numeral}
              title={value.title}
              description={value.description}
              spanTwo={isFourth}
            />
          );
        })}
      </div>
    </section>
  );
}

function ValueCard({
  numeral,
  title,
  description,
  spanTwo,
  ...rest
}: {
  numeral: string;
  title: string;
  description: string;
  spanTwo?: boolean;
  [key: string]: unknown;
}) {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>();

  return (
    <div
      ref={ref}
      {...rest}
      className={`group relative p-8 md:p-10 lg:p-12 border border-border backdrop-blur-sm shadow-md transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-lg ${
        spanTwo ? "lg:col-span-2" : ""
      } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      style={{
        backgroundColor: "var(--card)",
      }}
    >
      {}
      <div
        className="font-mono font-light leading-none mb-6 transition-all duration-500"
        style={{
          fontSize: "4rem",
          color: "var(--chart-1)",
        }}
      >
        {numeral}
      </div>

      {}
      <div className="h-px w-full bg-border mb-6" />

      {}
      <h3
        className="font-default font-bold text-foreground mb-4 leading-tight"
        style={{ fontSize: "1.75rem" }}
      >
        {title}
      </h3>

      {}
      <p
        className="font-default text-base leading-relaxed"
        style={{ color: "var(--foreground)" }}
      >
        {description}
      </p>

      {}
      <div
        className="absolute top-0 right-0 w-px h-12 transition-all duration-500 group-hover:h-20"
        style={{ backgroundColor: "var(--chart-1)" }}
      />
    </div>
  );
}