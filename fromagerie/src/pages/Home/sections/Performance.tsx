"use client";

import { useEffect, useRef, useState } from "react";

type Stat = {
  label: string;
  value: number;
  suffix: string;
  prefix: string;
  highlightIndex: number;
  description: string;
};

const stats: Stat[] = [
  {
    label: "ANNÉES D'EXPERTISE",
    value: 10,
    suffix: "",
    prefix: "",
    highlightIndex: 1,
    description: "Maîtrise artisanale de la transformation laitière et de l'affinage depuis 2014.",
  },
  {
    label: "TEMPÉRATURE CAVE",
    value: 12,
    suffix: "°C",
    prefix: "",
    highlightIndex: 1,
    description: "Contrôle rigoureux des conditions d'affinage pour garantir le développement optimal des arômes.",
  },
  {
    label: "LOTS PRODUITS",
    value: 850,
    suffix: "",
    prefix: "",
    highlightIndex: 2,
    description: "Gestion précise de chaque lot, assurant une traçabilité totale du lait jusqu'à l'expédition.",
  },
  {
    label: "TAUX DE RENDEMENT",
    value: 98,
    suffix: "%",
    prefix: "",
    highlightIndex: 1,
    description: "Optimisation constante des processus de fabrication pour minimiser les pertes et maximiser la qualité.",
  },
];

function useCountUp(target: number, start: boolean, duration: number = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let frame: number;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setCount(target);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, start, duration]);

  return count;
}

function StatItem({ stat, index, start }: { stat: Stat; index: number; start: boolean }) {
  const count = useCountUp(stat.value, start);
  const display = `${stat.prefix}${count}${stat.suffix}`;
  const chars = display.split("");

  return (
    <div
      data-index={index}
      className="relative flex flex-col px-6 lg:px-8 py-8 lg:py-0"
    >
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[color:var(--muted-foreground)] mb-8">
        {`0${index + 1} / ${stat.label}`}
      </span>

      <div
        className="font-default font-medium leading-[0.9] text-[color:var(--foreground)] tracking-tight"
        style={{ fontSize: "clamp(5rem, 9vw, 8rem)" }}
      >
        {chars.map((ch, i) => {
          const numericIndex = stat.prefix.length + stat.highlightIndex;
          const isHighlight = i === numericIndex;
          return (
            <span
              key={i}
              className={isHighlight ? "text-[color:var(--primary)]" : ""}
            >
              {ch}
            </span>
          );
        })}
      </div>

      <div className="mt-6 h-px w-[60px] bg-[color:var(--primary)]" />

      <p className="mt-6 font-default text-base leading-snug text-[color:var(--muted-foreground)] max-w-[16rem]">
        {stat.description}
      </p>
    </div>
  );
}

export default function Performance() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section data-section-id="2881"
      id="indicateurs-de-performance"
      className="dark bg-background text-foreground py-32 px-6 lg:px-12"
    >
      <div ref={sectionRef} className="max-w-7xl mx-auto">
        <div className="mb-20 lg:mb-28">
          <span className="font-mono text-xs tracking-[0.3em] uppercase text-[color:var(--primary)]">
            05 / INDICATEURS DE PERFORMANCE
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 lg:gap-y-0 relative">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              data-index={i}
              className={`relative ${
                i > 0 ? "lg:border-l lg:border-[color:var(--border)]" : ""
              } ${i % 2 === 1 ? "border-l border-[color:var(--border)] lg:border-l" : ""}`}
            >
              <StatItem stat={stat} index={i} start={started} />
            </div>
          ))}
        </div>

        <div className="mt-24 lg:mt-32">
          <div className="h-px w-full bg-[color:var(--primary)]" />
          <p className="mt-10 font-mono text-xs tracking-[0.3em] uppercase text-center text-[color:var(--muted-foreground)]">
            FROMAGERIE ARTISANALE &nbsp;/&nbsp; TRAÇABILITÉ TOTALE &nbsp;/&nbsp; QUALITÉ CERTIFIÉE
          </p>
        </div>
      </div>
    </section>
  );
}