import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { DEMO_ACCOUNTS, type DemoAccount } from "./loginForm.config";

export function DemoAccountSelector({ onSelect }: { onSelect: (account: DemoAccount) => void }) {
  if (DEMO_ACCOUNTS.length === 0) return null;

  return (
    <aside className="rounded-2xl border border-[#D8C3A5] bg-[#FFFDF9]/70 p-5 shadow-[0_10px_30px_rgba(63,74,79,0.06)]" aria-labelledby="demo-accounts-title">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p id="demo-accounts-title" className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-[#C96A4A]">Compte démo</p>
          <p className="mt-1 text-sm text-[#7E9A9A]">Préremplir un accès de démonstration</p>
        </div>
        <span className="hidden rounded-full bg-[#C96A4A]/[0.08] px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[#C96A4A] sm:inline-flex">Accès rapide</span>
      </div>
      <Select onValueChange={(username) => {
        const account = DEMO_ACCOUNTS.find((candidate) => candidate.username === username);
        if (account) onSelect(account);
      }}>
        <SelectTrigger aria-label="Choisir un compte de démonstration" className="h-auto rounded-xl border-[#D8C3A5] bg-[#F7F3EC]/70 py-3 text-[#3F4A4F]"><SelectValue placeholder="Choisir un compte" /></SelectTrigger>
        <SelectContent>
          {DEMO_ACCOUNTS.map((account) => (
            <SelectItem key={account.username} value={account.username} className="py-3">
              <span className="flex w-full items-center justify-between gap-8">
                <span><span className="block font-medium">{account.label}</span><span className="mt-1 block font-mono text-[0.625rem] text-[#7E9A9A]">{account.username}</span></span>
                <span className="shrink-0 rounded-full border border-[#C96A4A]/30 bg-[#C96A4A]/[0.08] px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[#C96A4A]">{account.accessMode}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </aside>
  );
}
