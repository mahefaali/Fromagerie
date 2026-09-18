import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";

export function Field({ label, error, required = false, className = "", htmlFor, children }: {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={htmlFor} className="text-sm text-foreground">
        {label}{required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function NumberField({ id, label, unit, step = "any", min, max, error, registration }: {
  id: string;
  label: string;
  unit?: string;
  step?: string;
  min?: number;
  max?: number;
  error?: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <Field label={label} error={error} required htmlFor={id}>
      <div className="relative">
        <Input
          id={id}
          type="text"
          inputMode={step === "1" ? "numeric" : "decimal"}
          autoComplete="off"
          data-min={min}
          data-max={max}
          className="min-h-12 rounded-2xl border border-[#c8bea9] bg-white px-4 pr-14 text-base text-[#241f18] shadow-sm hover:border-[#8f8168] focus-visible:border-[#28551c] focus-visible:ring-2 focus-visible:ring-[#28551c]/20"
          aria-invalid={Boolean(error)}
          {...registration}
        />
        {unit ? <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-muted-foreground">{unit}</span> : null}
      </div>
    </Field>
  );
}
