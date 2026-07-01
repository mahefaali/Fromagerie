"use client";

import { ArrowRight } from "lucide-react";
import { Link } from "./../../../components/common/Link";
import { Button } from "./../../../components/ui/button";
import { useRevealOnScroll } from "./../../../hooks/useRevealOnScroll";

export default function Production() {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>({ threshold: 0.15 });

  return (
    <section data-section-id="743"
      id="optimisez-votre-production"
      className="dark bg-background text-foreground relative overflow-hidden py-32 md:py-40 px-4 sm:px-6"
    >
      {}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-lg opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
            animation: "meshFloat1 14s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 h-[700px] w-[700px] rounded-lg opacity-25 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--chart-2) 0%, transparent 70%)",
            animation: "meshFloat2 18s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-lg opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
            animation: "meshFloat3 16s ease-in-out infinite",
          }}
        />
      </div>

      {}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {}
      <div className="pointer-events-none absolute inset-6 md:inset-10">
        <div className="absolute top-0 left-0 h-10 w-10 border-t-2 border-l-2" style={{ borderColor: "var(--primary)" }} />
        <div className="absolute top-0 right-0 h-10 w-10 border-t-2 border-r-2" style={{ borderColor: "var(--primary)" }} />
        <div className="absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2" style={{ borderColor: "var(--primary)" }} />
        <div className="absolute bottom-0 right-0 h-10 w-10 border-b-2 border-r-2" style={{ borderColor: "var(--primary)" }} />
      </div>

      {}
      <div
        ref={ref}
        className={`relative mx-auto max-w-[900px] text-center transition-all duration-1000 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {}
        <div className="font-mono text-xs sm:text-sm tracking-widest mb-8 flex items-center justify-center gap-1" style={{ color: "var(--primary)" }}>
          <span>&gt; GESTION.PRODUCTION.OPTIMISÉE</span>
          <span
            className="inline-block w-2 h-4 sm:h-5 ml-1"
            style={{
              backgroundColor: "var(--primary)",
              animation: "blink 1s step-end infinite",
            }}
          />
        </div>

        {}
        <h2 className="font-default font-bold tracking-tight text-5xl sm:text-6xl md:text-7xl lg:text-[88px] leading-[1.05] mb-6">
          Maîtrisez votre{" "}
          <span
            className="italic"
            style={{ color: "var(--primary)" }}
          >
            savoir-faire.
          </span>
        </h2>

        {}
        <p className="font-default text-base sm:text-lg text-muted-foreground max-w-[600px] mx-auto mb-10 leading-relaxed">
          De la réception du lait à l'affinage, Fromagerie Artisanale assure une traçabilité totale, un suivi précis des coûts et une planification rigoureuse de vos fabrications.
        </p>

        {}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-10">
          <Link to="/ManufacturingPage" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="relative h-14 px-8 text-base font-semibold w-full sm:w-auto rounded-lg shadow-lg"
              style={{
                boxShadow: "0 0 32px hsla(15, 45%, 60%, 0.35)",
                animation: "pulseGlow 2.4s ease-in-out infinite",
              }}
            >
              Gérer la production
              <ArrowRight className="ml-1 size-5" />
            </Button>
          </Link>

          <Link to="/TraceabilityPage" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base font-semibold w-full sm:w-auto rounded-lg border-2 bg-transparent hover:bg-primary/10 hover:text-primary"
              style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
            >
              Consulter la traçabilité
              <ArrowRight className="ml-1 size-5" />
            </Button>
          </Link>
        </div>

        {}
        <div className="font-mono text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full rounded-lg opacity-75"
              style={{
                backgroundColor: "var(--primary)",
                animation: "ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite",
              }}
            />
            <span
              className="relative inline-flex rounded-lg h-2 w-2"
              style={{ backgroundColor: "var(--primary)" }}
            />
          </span>
          <span>Système opérationnel en temps réel</span>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes meshFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(80px, 60px) scale(1.15); }
        }
        @keyframes meshFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-100px, -50px) scale(1.1); }
        }
        @keyframes meshFloat3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-45%, -55%) scale(1.2); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 28px hsla(15, 45%, 60%, 0.3); }
          50% { box-shadow: 0 0 44px hsla(15, 45%, 60%, 0.55); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>
    </section>
  );
}