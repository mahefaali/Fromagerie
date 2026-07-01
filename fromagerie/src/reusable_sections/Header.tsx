"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import { Link } from "./../components/common/Link";
import { Button } from "./../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "./../components/ui/sheet";
import {
  MenuProvider,
  useMenu,
} from "./../integrations/wordpress/WordPressMenuProvider";
import { WvcLogo } from "./../integrations/wordpress/WvcLogo";
import UserMenu from "./UserMenu";

function DesktopMenuConsumer() {
  const { menuItems, loading } = useMenu();

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-4 w-20 bg-muted animate-pulse rounded-md" />
        <span className="font-mono text-secondary">/</span>
        <div className="h-4 w-20 bg-muted animate-pulse rounded-md" />
        <span className="font-mono text-secondary">/</span>
        <div className="h-4 w-20 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <ul className="flex items-center gap-2 lg:gap-3">
      {menuItems.map((item, i) => (
        <li
          key={item.id}
          data-index={i}
          className="flex items-center gap-2 lg:gap-3"
        >
          <Link
            to={item.href || "#"}
            className="group relative font-mono uppercase text-[13px] tracking-[0.18em] text-foreground px-2 py-1 transition-colors duration-200 hover:text-primary"
          >
            <span className="relative inline-block">
              {item.label}
              <span
                className="pointer-events-none absolute left-0 -bottom-1 h-[2px] w-0 bg-primary transition-all duration-[220ms] ease-out group-hover:w-full"
                aria-hidden="true"
              />
            </span>
          </Link>
          {i < menuItems.length - 1 && (
            <span className="font-mono text-secondary text-sm select-none">
              /
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function MobileMenuConsumer({ onNavigate }: { onNavigate: () => void }) {
  const { menuItems, loading } = useMenu();

  if (loading) {
    return (
      <div className="flex flex-col gap-4 px-6 mt-8">
        <div className="h-8 w-3/4 bg-muted animate-pulse rounded-md" />
        <div className="h-8 w-2/3 bg-muted animate-pulse rounded-md" />
        <div className="h-8 w-3/5 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <ul className="flex flex-col mt-8 px-6">
      {menuItems.map((item, i) => (
        <li
          key={item.id}
          data-index={i}
          className="border-t border-secondary/40 first:border-t-0"
        >
          <Link
            to={item.href || "#"}
            onClick={onNavigate}
            className="block py-5 font-mono uppercase tracking-[0.18em] text-foreground hover:text-primary transition-colors"
            style={{ fontSize: "clamp(1.25rem, 4vw, 1.75rem)" }}
          >
            <span className="text-primary mr-3 text-sm">
              {String(i + 1).padStart(2, "0")}
            </span>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadAuth = () => {
      const client = (window as any).wvcClient;
      setIsAuthenticated(Boolean(client?.isAuthenticated));
    };

    loadAuth();
    window.addEventListener("WVC_AUTH_CHANGE", loadAuth);
    return () => window.removeEventListener("WVC_AUTH_CHANGE", loadAuth);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;

      if (anchor) {
        const href = anchor.getAttribute("href");
        if (!href) return;

        if (href === "/#") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        let hash = "";
        if (href.startsWith("#")) {
          hash = href;
        } else if (href.startsWith("/") && href.includes("#")) {
          const [path, hashPart] = href.split("#");
          if (hashPart === "") {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }
          if (path === "/" || path === window.location.pathname) {
            hash = "#" + hashPart;
          }
        }

        if (hash && hash !== "#") {
          const element = document.querySelector(hash);
          if (element) {
            e.preventDefault();
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  
  const seamSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='14' viewBox='0 0 28 14'><path d='M0 7 L7 0 L14 7 L7 14 Z M14 7 L21 0 L28 7 L21 14 Z' fill='hsl(198 12% 28%)'/></svg>`;

  return (
    <section data-section-id="1736"
      id="navigation-principale"
      className={`sticky top-0 z-50 w-full bg-background text-foreground transition-all duration-[250ms] ease-out ${
        scrolled
          ? "bg-background/75 backdrop-blur-lg border-b border-border"
          : "bg-background"
      }`}
    >
      <div className="relative">
        <div className="h-20 md:h-24 px-6 md:px-10 lg:px-16 flex items-center">
          <div className="w-full grid grid-cols-12 items-center gap-4">
            {}
            <div className="col-span-6 md:col-span-3 flex items-center">
              <Link
                to="/"
                className="inline-flex items-center"
                aria-label="Fromagerie Artisanale — Accueil"
              >
                <WvcLogo className="h-8 w-auto" />
              </Link>
            </div>

            {}
            <nav
              className="hidden md:flex col-span-6 items-center justify-center"
              aria-label="Principale"
            >
              <MenuProvider menu_id="3">
                <DesktopMenuConsumer />
              </MenuProvider>
            </nav>

            {}
            <div className="col-span-6 md:col-span-3 flex items-center justify-end gap-3">
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <Link to="/login" className="inline-flex">
                  <Button
                    className="group h-12 lg:h-14 px-6 lg:px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-default font-bold uppercase tracking-[0.06em] text-sm rounded-sm"
                    aria-label="Connexion"
                  >
                    <span>Connexion</span>
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-[220ms] ease-out group-hover:translate-x-1.5"
                    >
                      →
                    </span>
                  </Button>
                </Link>
              )}

              {}
              <div className="md:hidden">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Ouvrir le menu"
                      className="text-primary hover:text-primary hover:bg-card h-11 w-11 rounded-sm"
                    >
                      <Menu className="size-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="bg-popover text-popover-foreground border-l border-border w-full sm:max-w-sm p-0"
                  >
                    <SheetTitle className="sr-only">Menu de navigation</SheetTitle>

                    <div className="px-6 pt-6 flex items-center justify-between">
                      <span className="font-mono uppercase tracking-[0.18em] text-xs text-secondary">
                        <span className="text-primary mr-2">■</span>
                        F.A. № 01 / NAVIGATION
                      </span>
                    </div>

                    <div className="mt-6 h-[14px] w-full" aria-hidden="true">
                      <div
                        className="h-full w-full"
                        style={{
                          backgroundImage: `url("${seamSvg}")`,
                          backgroundRepeat: "repeat-x",
                          backgroundSize: "28px 14px",
                          opacity: 0.7,
                        }}
                      />
                    </div>

                    <MenuProvider menu_id="3">
                      <MobileMenuConsumer
                        onNavigate={() => setMobileOpen(false)}
                      />
                    </MenuProvider>

                    <div className="mt-auto px-6 pb-8">
                      {!isAuthenticated && (
                        <Link
                          to="/login"
                          onClick={() => setMobileOpen(false)}
                        >
                          <Button className="group w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-default font-bold uppercase tracking-[0.06em] text-sm rounded-sm">
                            <span>Connexion</span>
                            <span
                              aria-hidden="true"
                              className="inline-block transition-transform duration-[220ms] ease-out group-hover:translate-x-1.5"
                            >
                              →
                            </span>
                          </Button>
                        </Link>
                      )}
                      <p className="mt-4 font-mono text-[11px] tracking-[0.18em] uppercase text-secondary">
                        Fromagerie Artisanale — Gestion
                      </p>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>

        {}
        <div
          aria-hidden="true"
          className="h-[14px] w-full transition-opacity duration-[250ms]"
          style={{
            backgroundImage: `url("${seamSvg}")`,
            backgroundRepeat: "repeat-x",
            backgroundSize: "28px 14px",
            opacity: scrolled ? 0.6 : 1,
          }}
        />
      </div>
    </section>
  );
}