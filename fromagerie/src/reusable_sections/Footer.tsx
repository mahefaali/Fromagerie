"use client";

import { Link } from "./../components/common/Link";
import { Separator } from "./../components/ui/separator";
import { MenuProvider, useMenu } from "./../integrations/wordpress/WordPressMenuProvider";

function FooterNavConsumer() {
  const { menuItems, loading } = useMenu();

  if (loading) {
    return (
      <ul className="flex flex-col gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <li key={i} data-index={i} className="h-4 w-24 bg-muted/40 animate-pulse rounded-md" />
        ))}
      </ul>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {menuItems.map((item, i) => (
        <li key={item.id} data-index={i}>
          <Link
            to={item.href || "#"}
            className="group relative inline-block text-sm text-foreground transition-colors duration-300 hover:text-primary"
          >
            <span>{item.label}</span>
            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-500 group-hover:w-full" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Legal() {
  const navigateLinks = [
    { label: "Accueil", href: "/HomePage" },
    { label: "Tableau de Bord", href: "/DashboardPage" },
    { label: "Fabrications", href: "/ManufacturingPage" },
    { label: "Traçabilité", href: "/TraceabilityPage" },
  ];

  const socials = [
    { label: "LINKEDIN", href: "#" },
    { label: "TWITTER", href: "#" },
    { label: "GITHUB", href: "#" },
  ];

  return (
    <section data-section-id="4837" id="informations-légales" className="bg-background text-foreground pt-32 pb-12 px-6 md:px-10 lg:px-16 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        {}
        <div className="relative -mb-6 md:-mb-10 lg:-mb-14">
          <h2
            className="font-default font-light text-foreground leading-[0.85] tracking-tight select-none"
            style={{ fontSize: "clamp(80px, 16vw, 240px)" }}
          >
            FROMAGERIE.
          </h2>
        </div>

        {}
        <Separator className="bg-secondary/60 h-px w-full mt-4" />

        {}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pt-16 pb-20">
          {}
          <div className="md:col-span-4 flex flex-col gap-5">
            <span className="text-xs font-mono tracking-[0.25em] text-primary uppercase">
              Atelier
            </span>
            <address className="not-italic font-default text-sm leading-relaxed text-foreground/70 space-y-1">
              <div>Fromagerie Artisanale</div>
              <div>1234 Route des Alpages</div>
              <div>Fromage-sur-Mont, France</div>
            </address>
          </div>

          {}
          <div className="md:col-span-3 flex flex-col gap-5">
            <span className="text-xs font-mono tracking-[0.25em] text-primary uppercase">
              Navigation
            </span>
            <MenuProvider menu_id="4">
              <FooterNavConsumer />
            </MenuProvider>
            {}
            <ul className="hidden">
              {navigateLinks.map((item, i) => (
                <li key={item.label} data-index={i}>
                  <Link to={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {}
          <div className="md:col-span-3 flex flex-col gap-5">
            <span className="text-xs font-mono tracking-[0.25em] text-primary uppercase">
              Contact
            </span>
            <div className="flex flex-col gap-2 text-sm text-foreground/70 font-default">
              <Link
                to="mailto:contact@fromagerie.artisanale"
                className="hover:text-primary transition-colors duration-300"
              >
                contact@fromagerie.artisanale
              </Link>
              <Link
                to="tel:+33123456789"
                className="hover:text-primary transition-colors duration-300"
              >
                +33 1 23 45 67 89
              </Link>
              <Link
                to="mailto:support@fromagerie.artisanale"
                className="hover:text-primary transition-colors duration-300"
              >
                support@fromagerie.artisanale
              </Link>
            </div>
          </div>

          {}
          <div className="md:col-span-2 flex flex-col gap-5">
            <span className="text-xs font-mono tracking-[0.25em] text-primary uppercase">
              Réseaux
            </span>
            <ul className="flex flex-col gap-3">
              {socials.map((s, i) => (
                <li key={s.label} data-index={i}>
                  <Link
                    to={s.href}
                    newTab
                    className="group relative inline-block text-xs font-mono tracking-[0.2em] uppercase text-foreground transition-colors duration-300 hover:text-primary"
                  >
                    <span>{s.label}</span>
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-500 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {}
        <Separator className="bg-secondary/60 h-px w-full" />

        {}
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