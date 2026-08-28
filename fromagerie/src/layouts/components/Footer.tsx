"use client";

import { Link } from "./../../components/common/Link";
import { Separator } from "./../../components/ui/separator";

export default function Legal() {
  return (
    <section data-section-id="4837" id="informations-légales" className="bg-background text-foreground pt-32 pb-12 px-6 md:px-10 lg:px-16 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        { }
        <div className="relative -mb-6 md:-mb-10 lg:-mb-14">
          <h2
            className="font-default font-light text-foreground leading-[0.85] tracking-tight select-none"
            style={{ fontSize: "clamp(80px, 16vw, 240px)" }}
          >
            FROMAGERIE.
          </h2>
        </div>

        { }
        <Separator className="bg-secondary/60 h-px w-full mt-4" />

        { }
        

        { }
        <Separator className="bg-secondary/60 h-px w-full" />

        { }
        <div className="pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-[11px] font-mono tracking-[0.2em] text-foreground/50 uppercase">
          <div>© Fromagerie Artisanale MMXXV — Tous droits réservés</div>
          <div className="font-default italic text-foreground/60 normal-case tracking-normal text-xs">
            Conçu pour la précision
          </div>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-primary transition-colors duration-300">
              Confidentialité
            </Link>
            <span>·</span>
            <Link to="#" className="hover:text-primary transition-colors duration-300">
              Conditions
            </Link>
            <span>·</span>
            <Link to="#" className="hover:text-primary transition-colors duration-300">
              Mentions
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
