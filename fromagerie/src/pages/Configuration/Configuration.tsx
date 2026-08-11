import React, { useState } from "react";
import { Link } from "./../../components/common/Link";
import UsersSection from "./sections/Users";
import SiteSection from "./sections/Site";
import NavigationSection from "./sections/Navigation";
import ReportsSection from "./sections/Reports";

export default function Configuration() {
  const [active, setActive] = useState<"users" | "site" | "nav" | "reports">("users");

  return (
    <div className="pb-24">
        <section className="min-h-screen bg-background text-foreground px-6 py-14 md:px-10 lg:px-16">
            <div className="mx-auto max-w-6xl">
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

                <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_2fr]">
                    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
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
                        { id: "site", title: "Paramètres du site", desc: "Contrôlez les informations globales, l’identité visuelle et les options du site." },
                        { id: "nav", title: "Navigation et menu", desc: "Organisez les pages, les liens de navigation et l’ordre des sections principales." },
                        { id: "reports", title: "Rapports et alertes", desc: "Suivez les indicateurs clés et définissez des notifications pour l’équipe." },
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

                    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                    {active === "users" && <UsersSection />}
                    {active === "site" && <SiteSection />}
                    {active === "nav" && <NavigationSection />}
                    {active === "reports" && <ReportsSection />}
                    </div>
                </div>
                </div>
        </section>
    </div>
    
  );
}
