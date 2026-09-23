import { useEffect, useState } from "react";
import {
  ChartNoAxesCombined,
  ChevronUp,
  SearchCheck,
  Settings,
} from "lucide-react";
import Navigation from "../components/ui/navigation";
import { Button } from "../components/ui/button";
import { WvcLogo } from "../services/wordpress/WvcLogo";
import { PageTabsHostProvider } from "./components/PageTabsPortal";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/authentication/hooks/useAuth";
import { FloatingSubnavigation } from "../components/ui/FloatingSubnavigation";
import UserMenu from "./components/UserMenu";

export function AppLayout() {
  const [pageTabsHost, setPageTabsHost] = useState<HTMLDivElement | null>(null);
  const [subnavigationExpanded, setSubnavigationExpanded] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPilotage =
    location.pathname === "/rentabilite" ||
    location.pathname === "/tracabilite";
  const hasSubnavigation = [
    "/fabrication",
    "/affinage",
    "/stock",
    "/rentabilite",
    "/tracabilite",
  ].some(
    (path) =>
      location.pathname === path || location.pathname.startsWith(`${path}/`),
  );

  useEffect(() => {
    if (!hasSubnavigation) return;
    const collapseOnScroll = () => setSubnavigationExpanded(false);
    window.addEventListener("scroll", collapseOnScroll, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", collapseOnScroll, true);
  }, [hasSubnavigation]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative">
      <header className="sticky top-0 z-50 h-[4.5rem] border-b border-[#D8C3A5]/65 bg-[#FFFDF9]/95 backdrop-blur-xl">
        <div className="container mx-auto flex h-full items-center gap-3 px-4 md:gap-8 md:px-6">
          <Link
            to="/home"
            aria-label="Retour à l’accueil"
            className="group flex shrink-0 items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C96A4A] focus-visible:ring-offset-2"
          >
            <span className="flex size-11 items-center justify-center rounded-full border border-[#D8C3A5]/70 bg-white shadow-sm transition-transform group-hover:scale-105">
              <WvcLogo className="size-8" />
            </span>
            <span className="hidden text-sm font-semibold tracking-wide text-[#3F4A4F] sm:block">
              Fromagerie
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {user?.role === "PROPRIETAIRE" && (
              <Button
                asChild
                variant="outline"
                className="rounded-full border-[#D8C3A5] bg-white/70"
              >
                <Link to="/configuration">
                  <Settings className="size-4" />
                  <span className="hidden sm:inline">Configuration</span>
                </Link>
              </Button>
            )}
            <UserMenu />
          </div>
        </div>
      </header>

      <Navigation onNavigate={() => setSubnavigationExpanded(true)} />

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-[9998] flex flex-col items-center px-3 sm:bottom-[calc(5rem+env(safe-area-inset-bottom))]">
        {hasSubnavigation && !subnavigationExpanded && (
          <button
            type="button"
            aria-label="Afficher la sous-navigation"
            onClick={() => setSubnavigationExpanded(true)}
            className="pointer-events-auto flex size-10 items-center justify-center rounded-full border-2 border-[#355B12]/75 bg-transparent text-[#355B12] transition-colors hover:border-[#355B12] hover:bg-[#355B12]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronUp className="size-5" />
          </button>
        )}
        <div
          ref={setPageTabsHost}
          className={`pointer-events-auto max-w-[calc(100vw-1.5rem)] items-center overflow-x-auto rounded-xl border border-[#DDD3C5] bg-[#FFFDF9]/95 p-1 shadow-[0_12px_28px_rgba(63,53,42,0.18)] backdrop-blur-md empty:hidden no-scrollbar sm:p-1.5 ${subnavigationExpanded ? "flex" : "hidden"}`}
          aria-label="Sous-navigation de la page"
        >
          {isPilotage && (
            <FloatingSubnavigation
              value={
                location.pathname === "/tracabilite"
                  ? "/tracabilite"
                  : "/rentabilite"
              }
              items={[
                ...(user?.role === "PROPRIETAIRE"
                  ? [
                      {
                        value: "/rentabilite" as const,
                        label: "Coûts & rentabilité",
                        icon: ChartNoAxesCombined,
                      },
                    ]
                  : []),
                {
                  value: "/tracabilite" as const,
                  label: "Traçabilité",
                  icon: SearchCheck,
                },
              ]}
              onValueChange={(path) => navigate(path)}
              ariaLabel="Navigation du pilotage"
            />
          )}
        </div>
      </div>

      <main
        onClickCapture={(event) => {
          if (!pageTabsHost?.contains(event.target as Node)) setSubnavigationExpanded(false);
        }}
        className={`w-full flex-1 p-4 md:p-6 ${hasSubnavigation && subnavigationExpanded ? "pb-[calc(8.5rem+env(safe-area-inset-bottom))] sm:pb-[calc(9rem+env(safe-area-inset-bottom))]" : "pb-[calc(7.5rem+env(safe-area-inset-bottom))]"}`}
      >
        <PageTabsHostProvider host={pageTabsHost}>
          <Outlet />
        </PageTabsHostProvider>
      </main>

      {/* <Legal /> */}
    </div>
  );
}
