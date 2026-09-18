import { CostsTabs } from "./costs/CostsTabs";
import { useCostsConfiguration } from "./costs/useCostsConfiguration";

export default function CostsSection() {
  const model = useCostsConfiguration();

  return (
    <div className="space-y-6 [&_input[data-slot=input]]:h-11 [&_input[data-slot=input]]:border-border/90 [&_input[data-slot=input]]:bg-background [&_input[data-slot=input]]:shadow-sm [&_input[data-slot=input]]:hover:border-primary/50 [&_input[data-slot=input]]:focus-visible:border-primary [&_input[data-slot=input]]:focus-visible:ring-primary/25 [&_select]:h-11 [&_select]:rounded-xl [&_select]:border [&_select]:border-border/90 [&_select]:bg-background [&_select]:px-3 [&_select]:text-foreground [&_select]:shadow-sm [&_select]:outline-none [&_select]:transition-[border-color,box-shadow] [&_select]:hover:border-primary/50 [&_select]:focus:border-primary [&_select]:focus:ring-2 [&_select]:focus:ring-primary/25">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-secondary">Coûts de production</p>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Paramètres configurables</h2>
      </div>
      <CostsTabs model={model} />
    </div>
  );
}
