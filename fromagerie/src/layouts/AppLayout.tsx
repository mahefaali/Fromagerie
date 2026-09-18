import { useState } from "react";
import {
  ChartNoAxesCombined,
  LogOut,
  SearchCheck,
  Settings,
} from "lucide-react";
import Navigation from "../components/ui/navigation";
import { Button } from "../components/ui/button";
import { WvcLogo } from "../services/wordpress/WvcLogo";
import { PageTabsHostProvider } from "./components/PageTabsPortal";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../features/authentication/hooks/useAuth";
import { toast } from "sonner";
import { FloatingSubnavigation } from "../components/ui/FloatingSubnavigation";

export function AppLayout() {
  const [pageTabsHost, setPageTabsHost] = useState<HTMLDivElement | null>(null);
  const [isSubnavigationOpen, setIsSubnavigationOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPilotage =
    location.pathname === "/rentabilite" ||
    location.pathname === "/tracabilite";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Déconnexion impossible.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

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
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="rounded-full border-[#D8C3A5] bg-white/70 hover:border-destructive/40 hover:text-destructive"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">
                {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
              </span>
            </Button>
          </div>
        </div>
      </header>

      <Navigation onNavigate={() => setIsSubnavigationOpen(true)} />

      <div
        className={`pointer-events-none fixed inset-x-0 bottom-[5.35rem] z-[9998] flex origin-bottom justify-center px-3 transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:bottom-[6.35rem] ${isSubnavigationOpen ? "translate-y-0 scale-100 opacity-100 blur-0" : "translate-y-5 scale-95 opacity-0 blur-[2px]"}`}
        aria-hidden={!isSubnavigationOpen}
        inert={!isSubnavigationOpen}
      >
        <div
          ref={setPageTabsHost}
          className={`${isSubnavigationOpen ? "pointer-events-auto" : "pointer-events-none"} flex max-w-[calc(100vw-1.5rem)] items-center overflow-x-auto rounded-2xl border border-[#DDD3C5] bg-[#FFFDF9]/95 p-2 shadow-[0_12px_28px_rgba(63,53,42,0.18)] backdrop-blur-md empty:hidden no-scrollbar`}
          aria-label="Sous-navigation de la page"
        >
          {isPilotage && (
            <FloatingSubnavigation
              value={location.pathname === "/tracabilite" ? "/tracabilite" : "/rentabilite"}
              items={[
                ...(user?.role === "PROPRIETAIRE"
                  ? [{ value: "/rentabilite" as const, label: "Coûts & rentabilité", icon: ChartNoAxesCombined }]
                  : []),
                { value: "/tracabilite" as const, label: "Traçabilité", icon: SearchCheck },
              ]}
              onValueChange={(path) => navigate(path)}
              ariaLabel="Navigation du pilotage"
            />
          )}
        </div>
      </div>

      <main
        className="w-full flex-1 p-4 pb-24 md:p-6 md:pb-28"
        onClick={(event) => {
          if (event.currentTarget.contains(event.target as Node)) {
            setIsSubnavigationOpen(false);
          }
        }}
      >
        <PageTabsHostProvider host={pageTabsHost}>
          <Outlet />
        </PageTabsHostProvider>
      </main>

      {/* <Legal /> */}
    </div>
  );
}
