import Navigation from "../ui/navigation";
import Legal from "./../../reusable_sections/Footer";
import { Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative">
      {/* La navigation globale fixe en bas */}
      <Navigation />

      {/* pb-24 empêche la barre fixe de masquer le contenu ou le footer */}
      <main className="flex-1 container mx-auto p-4 md:p-6 pb-24 md:pb-28">
        <Outlet />
      </main>
      
      <Legal />
    </div>
  );
}