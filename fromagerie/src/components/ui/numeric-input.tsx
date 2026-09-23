import { useEffect, useState, type ComponentProps } from "react";

import { cn } from "../../utils/utils";

type NumericInputProps = Omit<ComponentProps<"input">, "type" | "inputMode" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step"> & {
  value: number | null;
  onValueChange: (value: number | null) => void;
  min?: number;
  max?: number;
  precision?: number;
  integer?: boolean;
  signed?: boolean;
};

function formatValue(value: number | null) {
  return value === null ? "" : String(value);
}

export function NumericInput({ value, onValueChange, min, max, precision, integer = false, signed = false, className, onBlur, ...props }: NumericInputProps) {
  const [draft, setDraft] = useState(() => formatValue(value));

  useEffect(() => {
    setDraft(formatValue(value));
  }, [value]);

  const parse = (text: string): number | null | undefined => {
    if (text === "") return null;
    const normalized = text.replace(",", ".");
    const shape = integer ? (signed ? /^-?\d+$/ : /^\d+$/) : (signed ? /^-?\d+(?:\.\d+)?$/ : /^\d+(?:\.\d+)?$/);
    if (!shape.test(normalized)) return undefined;
    const number = Number(normalized);
    if (!Number.isFinite(number) || (min !== undefined && number < min) || (max !== undefined && number > max)) return undefined;
    if (precision !== undefined && normalized.split(".")[1]?.length > precision) return undefined;
    return number;
  };

  return (
    <input
      {...props}
      type="text"
      inputMode={integer ? "numeric" : "decimal"}
      value={draft}
      className={cn("w-full rounded-xl border border-[#e2dacb] bg-white px-3 py-2 text-sm text-[#2c2825] outline-none focus:border-[#2d4a27] focus:ring-2 focus:ring-[#2d4a27]/20", className)}
      onChange={(event) => {
        const next = event.target.value;
        const draftShape = signed ? /^-?\d*(?:[.,]\d*)?$/ : /^\d*(?:[.,]\d*)?$/;
        if (!draftShape.test(next) || (integer && /[.,]/.test(next))) return;
        setDraft(next);
        const parsed = parse(next);
        if (parsed !== undefined) onValueChange(parsed);
      }}
      onBlur={(event) => {
        const parsed = parse(draft);
        if (parsed === undefined || (parsed === null && value !== null) || draft.endsWith(".") || draft.endsWith(",")) setDraft(formatValue(value));
        else setDraft(formatValue(parsed));
        onBlur?.(event);
      }}
    />
  );
}

type NumericTextInputProps = Omit<NumericInputProps, "value" | "onValueChange"> & {
  value: string;
  onValueChange: (value: string) => void;
};

export function NumericTextInput({ value, onValueChange, ...props }: NumericTextInputProps) {
  return <NumericInput {...props} value={value === "" ? null : Number(value)} onValueChange={(next) => onValueChange(next === null ? "" : String(next))} />;
}
