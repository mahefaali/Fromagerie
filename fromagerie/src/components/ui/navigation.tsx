import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../features/authentication/hooks/useAuth";
import { mainNavItems } from "./navigationItems";

interface BottomNavigationProps {
  onNavigate?: () => void;
}

export default function BottomNavigation({ onNavigate }: BottomNavigationProps) {
  const location = useLocation();
  const [, refreshDestinations] = useState(0);
  const { user } = useAuth();
  const authorizedNavItems = user
    ? mainNavItems.filter((item) => item.roles.some((role) => role === user.role))
    : [];

  useEffect(() => {
    const activeGroup = mainNavItems.find((item) =>
      item.paths.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`)),
    );
    if (!activeGroup) return;
    window.sessionStorage.setItem(`main-navigation:${activeGroup.label}`, location.pathname);
    refreshDestinations((value) => value + 1);
  }, [location.pathname]);

  return (
    <nav
      className="fixed inset-x-0 bottom-3 z-[9999] flex justify-center px-2 pb-[env(safe-area-inset-bottom)] sm:bottom-5"
      aria-label="Navigation principale"
    >
      <div className="flex w-full max-w-[46rem] items-center justify-evenly gap-1 rounded-[1.75rem] border border-white/10 bg-[#262318] p-1.5 shadow-[0_18px_45px_rgba(35,31,24,0.3)] backdrop-blur-md sm:p-2">
          {authorizedNavItems.map(({ to, paths, label, icon: Icon }) => {
            const isActive = paths.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));
            const rememberedPath = window.sessionStorage.getItem(`main-navigation:${label}`);
            const destination = rememberedPath && paths.some((path) => rememberedPath === path || rememberedPath.startsWith(`${path}/`))
              ? rememberedPath
              : to;

            return (
              <NavLink
                key={label}
                to={destination}
                title={label}
                onClick={onNavigate}
                className={({ isActive: linkActive }) => {
                  const active = isActive || linkActive;
                  return [
                    "flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-[1.35rem] px-2 py-2 text-xs font-semibold transition-all duration-200 sm:px-5 sm:text-sm",
                    active
                      ? "bg-[#444136] text-[#FFFDF9] shadow-sm"
                      : "text-[#E8E0D3] hover:bg-white/10 hover:text-white",
                  ].join(" ");
                }}
              >
                {({ isActive: linkActive }) => {
                  const active = isActive || linkActive;
                  return (
                    <>
                      <Icon className={`size-4 shrink-0 ${active ? "text-[#D84E1F]" : "text-[#E8E0D3]"}`} />
                      <span className="hidden whitespace-nowrap sm:inline">
                        {label}
                      </span>
                    </>
                  );
                }}
              </NavLink>
            );
          })}
      </div>
    </nav>
  );
}
