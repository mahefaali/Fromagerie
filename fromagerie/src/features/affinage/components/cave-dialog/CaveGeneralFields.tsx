import { Input } from "../../../../components/ui/input";
import { NumericInput } from "../../../../components/ui/numeric-input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import type { CaveFormValues } from "./caveForm";

export function CaveIdentityFields({ values, update }: FieldsProps) {
  return <>
    <Field label="Nom" id="cave-nom"><Input id="cave-nom" value={values.nom} onChange={(event) => update("nom", event.target.value)} placeholder="Cave d'affinage principale" required /></Field>
    <Field label="Description" id="cave-desc"><Textarea id="cave-desc" value={values.description} onChange={(event) => update("description", event.target.value)} rows={2} placeholder="Cave voûtée en pierre..." /></Field>
  </>;
}

export function CaveEnvironmentFields({ values, update }: FieldsProps) {
  return <>
    <div className="grid grid-cols-2 gap-3">
      <NumberField id="cave-temp" label="Température (°C)" value={values.temperature} signed precision={2} onChange={(value) => update("temperature", value)} />
      <NumberField id="cave-hum" label="Humidité (%)" value={values.humidite} precision={2} min={0} max={100} onChange={(value) => update("humidite", value)} />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <NumberField id="cave-age-min" label="Âge minimum (jours)" value={values.ageMinJours} min={0} integer onChange={(value) => update("ageMinJours", value)} />
      <NumberField id="cave-age-max" label="Âge maximum (jours)" value={values.ageMaxJours} min={1} integer onChange={(value) => update("ageMaxJours", value)} />
    </div>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={values.active} onChange={(event) => update("active", event.target.checked)} /> Cave active</label>
  </>;
}

interface FieldsProps {
  values: CaveFormValues;
  update: <K extends keyof CaveFormValues>(field: K, value: CaveFormValues[K]) => void;
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return <div className="grid gap-1.5"><Label htmlFor={id}>{label}</Label>{children}</div>;
}

function NumberField({ id, label, value, onChange, ...limits }: { id: string; label: string; value: number; onChange: (value: number) => void; min?: number; max?: number; precision?: number; integer?: boolean; signed?: boolean }) {
  return <Field label={label} id={id}><NumericInput id={id} value={value} onValueChange={(next) => { if (next !== null) onChange(next); }} {...limits} /></Field>;
}
