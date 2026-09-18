import { useFormContext, useWatch } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../../components/ui/form";
import { Input } from "../../../../components/ui/input";
import { cn } from "../../../../utils/utils";
import { ACCESS_LEVELS, validateCredential, type LoginFormValues } from "./loginForm.config";

const labelClass = "font-mono uppercase text-[0.6875rem] tracking-[0.22em] text-[#7E9A9A]";
const messageClass = "mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.18em]";
const inputClass = "h-auto rounded-2xl border border-[#D8C3A5] bg-[#FFFDF9]/80 px-4 py-3 text-base text-foreground placeholder:font-mono placeholder:text-xs placeholder:uppercase placeholder:tracking-[0.18em] placeholder:text-[#7E9A9A] focus-visible:border-[#C96A4A] focus-visible:ring-2 focus-visible:ring-[#C96A4A]/30";

export function LoginFields() {
  const { control } = useFormContext<LoginFormValues>();
  const accessMode = useWatch({ control, name: "accessMode" });

  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-10">
      <FormField control={control} name="accessMode" rules={{ required: "Rôle requis" }} render={({ field }) => (
        <FormItem>
          <FormLabel className={labelClass}>Rôle</FormLabel>
          <FormControl>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {ACCESS_LEVELS.map((level, index) => (
                <div key={level.value} data-index={index} onClick={() => field.onChange(level.value)} className={cn("cursor-pointer rounded-2xl border p-6 transition-all duration-300", field.value === level.value ? "border-[#C96A4A] bg-[#C96A4A]/[0.08]" : "border-[#D8C3A5] bg-transparent hover:border-[#C96A4A]/50")}>
                  <p className="font-default font-medium text-[#3F4A4F]">{level.label}</p>
                  <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-wider text-[#7E9A9A]">{level.sublabel}</p>
                </div>
              ))}
            </div>
          </FormControl>
          <FormMessage className={messageClass} />
        </FormItem>
      )} />
      <FormField control={control} name="username" rules={{ required: "Nom d'utilisateur requis" }} render={({ field }) => (
        <FormItem>
          <FormLabel className={labelClass}>Nom d'utilisateur</FormLabel>
          <FormControl><Input type="text" autoComplete="username" placeholder="Votre identifiant" {...field} className={inputClass} /></FormControl>
          <FormMessage className={messageClass} />
        </FormItem>
      )} />
      <FormField control={control} name="password" rules={{ validate: validateCredential }} render={({ field }) => (
        <FormItem>
          <FormLabel className={labelClass}>{accessMode === "Propriétaire" ? "Mot de passe" : "Code PIN"}</FormLabel>
          <FormControl><Input type="password" autoComplete="current-password" inputMode={accessMode === "Employé" ? "numeric" : "text"} placeholder={accessMode === "Propriétaire" ? "••••••••" : "0000"} {...field} className={inputClass} /></FormControl>
          <FormMessage className={messageClass} />
        </FormItem>
      )} />
    </div>
  );
}
