import { useState } from "react";
import { Link } from "./../../components/common/Link";
import UsersSection from "../../features/configuration/components/Users";
import CostsSection from "../../features/configuration/components/Costs";

export default function Configuration() {
  const [active, setActive] = useState<"users" | "site" | "nav" | "reports" | "costs">("users");

  return (
    <div className="min-h-[calc(100vh-7.5rem)] w-full">
        <section className="min-h-[calc(100vh-7.5rem)] w-full bg-background pb-8 text-foreground">
            <div className="w-full">
                <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="font-mono uppercase tracking-[0.22em] text-sm text-secondary">
                    Gestion — Configuration
                    </p>
                    <h1 className="mt-4 font-default text-4xl font-semibold tracking-tight text-foreground">
                    Centre de configuration
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                    Choisissez une zone de configuration pour ajuster les paramètres de l’application.
                    La gestion des utilisateurs est active ici, et d’autres options seront ajoutées progressivement.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:items-end">
                    <Link
                    to="/home"
                    className="text-sm font-mono uppercase tracking-[0.18em] text-secondary transition hover:text-foreground"
                    >
                    Retour à l’accueil
                    </Link>
                </div>
                </header>

                <div className="mb-10 grid min-w-0 gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)]">
                    <div className="h-fit rounded-3xl border border-border bg-card p-5 shadow-sm xl:p-6">
                    <div className="mb-6">
                        <p className="font-mono text-xs uppercase tracking-[0.22em] text-secondary">
                        Zones de configuration
                        </p>
                        <h2 className="mt-2 text-xl font-semibold text-foreground">
                        Ce que vous pouvez gérer
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {[
                        { id: "users", title: "Gestion des utilisateurs", desc: "Ajoutez, modifiez ou suspendez les comptes autorisés à accéder au système." },
                        { id: "costs", title: "Coûts de production", desc: "Paramétrez le lait, les emballages, l’énergie, la main-d’œuvre et les amortissements." },
                        ].map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setActive(item.id as any)}
                            className={`w-full text-left rounded-2xl border border-border p-4 transition ${active === item.id ? "bg-primary/5 ring-1 ring-primary/30" : "bg-background"}`}
                        >
                            <p className="font-semibold text-foreground">{item.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                        </button>
                        ))}
                    </div>
                    </div>

                    <div className="min-w-0 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6 xl:p-8">
                    {active === "users" && <UsersSection />}
                    {active === "costs" && <CostsSection />}
                    </div>
                </div>
                </div>
        </section>
    </div>
    
  );
}
