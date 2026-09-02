import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../features/authentication/hooks/useAuth";
import UserMenu from "../../layouts/components/UserMenu";
import { navItems } from "./navigationItems";

export default function BottomNavigation() {
  const location = useLocation();
  const { user } = useAuth();
  const authorizedNavItems = user
    ? navItems.filter((item) => item.roles.includes(user.role))
    : [];

  return (
    <nav
      className="fixed bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-5xl transform-gpu pb-[env(safe-area-inset-bottom)]"
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex w-full items-center gap-1 rounded-full border border-[#D8C3A5]/80 bg-[#FFFDF9]/95 p-1.5 shadow-[0_18px_45px_rgba(63,74,79,0.18)] backdrop-blur-md sm:w-fit sm:gap-2 md:p-2">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto no-scrollbar sm:flex-none sm:gap-2">
          {authorizedNavItems.map(({ to, label, icon: Icon }) => {
            const isActive =
              location.pathname === to ||
              (to === "/home" && location.pathname === "/");

            return (
              <NavLink
                key={to}
                to={to}
                title={label}
                className={({ isActive: linkActive }) => {
                  const active = isActive || linkActive;
                  return [
                    "flex items-center gap-1.5 md:gap-2 rounded-full px-2.5 sm:px-3 md:px-4 py-2 text-[10px] md:text-[11px] font-mono uppercase transition-all duration-300 shrink-0",
                    active
                      ? "bg-[#C96A4A] text-[#F7F3EC] shadow-sm"
                      : "text-[#3F4A4F] hover:bg-[#F7F3EC] hover:text-[#C96A4A]",
                  ].join(" ");
                }}
              >
                {({ isActive: linkActive }) => {
                  const active = isActive || linkActive;
                  return (
                    <>
                      <span
                        className={[
                          "flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full border shrink-0",
                          active
                            ? "border-[#F7F3EC]/40 bg-[#F7F3EC]/10 text-[#F7F3EC]"
                            : "border-transparent bg-[#F7F3EC] text-[#C96A4A]",
                        ].join(" ")}
                      >
                        <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      </span>
                      <span className="tracking-wider whitespace-nowrap text-[10px] md:text-[11px]">
                        {label}
                      </span>
                    </>
                  );
                }}
              </NavLink>
            );
          })}
        </div>

        <div className="shrink-0 border-l border-[#D8C3A5]/70 pl-1.5 sm:pl-2">
          <UserMenu menuPlacement="top" />
        </div>
      </div>
    </nav>
  );
}
