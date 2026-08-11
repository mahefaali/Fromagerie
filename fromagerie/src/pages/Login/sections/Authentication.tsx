"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { Button } from "./../../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./../../../components/ui/form";
import { Input } from "./../../../components/ui/input";
import { FormProvider, useWvcForm } from "./../../../integrations/forms/FormProvider";
import { useRevealOnScroll } from "./../../../hooks/useRevealOnScroll";
import { useWatch } from "react-hook-form";
import { cn } from "./../../../lib/utils";
import { WvcLogo } from "./../../../integrations/wordpress/WvcLogo";

const accessLevels = [
  { label: "Propriétaire", sublabel: "Mot de passe", value: "Propriétaire" },
  { label: "Employé", sublabel: "Code PIN", value: "Employé" },
];

function InnerCircleForm() {
  const navigate = useNavigate();
  const {
    isSubmitting,
    isSubmitted,
    submitError,
    successMessage,
    handleSubmit,
    resetForm,
    control,
  } = useWvcForm();

  useEffect(() => {
    if (isSubmitted && !submitError) {
      navigate("/home", { replace: true });
    }
  }, [isSubmitted, submitError, navigate]);

  const selectedRole = useWatch({
    control,
    name: "role",
  });

  if (isSubmitted && !submitError) {
    return (
      <div className="relative mx-auto max-w-xl text-center py-12">
        <div className="mx-auto mb-6 h-1.5 w-1.5 rounded-lg bg-[#C96A4A]" />
        <div className="mx-auto mb-8 h-px w-60 bg-gradient-to-r from-transparent via-[#C96A4A] to-transparent" />
        <p
          className="font-default font-light italic text-foreground"
          style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", lineHeight: 1.1, letterSpacing: "-0.02em" }}
        >
          Accès <span className="text-[#C96A4A]">autorisé</span>
        </p>
        <p className="mt-6 font-mono uppercase text-xs tracking-[0.18em] text-muted-foreground">
          {successMessage}
        </p>
        <Button
          onClick={resetForm}
          variant="outline"
          className="mt-10 border border-[#3F4A4F] bg-transparent text-foreground hover:bg-transparent hover:text-[#C96A4A] hover:border-[#C96A4A] rounded-md font-mono uppercase text-xs tracking-[0.2em] px-8 py-5"
        >
          Nouvelle connexion
        </Button>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit} className="space-y-10">
      <div className="grid grid-cols-1 gap-x-10 gap-y-10">
        <FormField
          control={control}
          name="role"
          rules={{ required: "Rôle requis" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono uppercase text-[0.6875rem] tracking-[0.22em] text-[#7E9A9A]">
                Rôle
              </FormLabel>
              <FormControl>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {accessLevels.map((level, i) => (
                    <div
                      key={level.value}
                      data-index={i}
                      onClick={() => field.onChange(level.value)}
                      className={cn(
                        "cursor-pointer p-6 border transition-all duration-300 rounded-md",
                        field.value === level.value
                          ? "border-[#C96A4A] bg-[#C96A4A]/[0.08]"
                          : "border-[#D8C3A5] bg-transparent hover:border-[#C96A4A]/50"
                      )}
                    >
                      <p className="font-default font-medium text-[#3F4A4F]">
                        {level.label}
                      </p>
                      <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-wider text-[#7E9A9A]">
                        {level.sublabel}
                      </p>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormMessage className="font-mono uppercase text-[0.6875rem] tracking-[0.18em] mt-2" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="credentials"
          rules={{
            required: "Identifiant requis",
            minLength: {
              value: selectedRole === "Propriétaire" ? 8 : 4,
              message: selectedRole === "Propriétaire" ? "Min 8 caractères" : "Min 4 chiffres",
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono uppercase text-[0.6875rem] tracking-[0.22em] text-[#7E9A9A]">
                {selectedRole === "Propriétaire" ? "Mot de passe" : "Code PIN"}
              </FormLabel>
              <FormControl>
                <Input
                  type={selectedRole === "Propriétaire" ? "password" : "text"}
                  inputMode={selectedRole === "Employé" ? "numeric" : "text"}
                  placeholder={selectedRole === "Propriétaire" ? "••••••••" : "0000"}
                  {...field}
                  className="h-auto border-0 border-b border-[#3F4A4F] bg-transparent px-0 pb-3 pt-1 text-base text-foreground placeholder:text-[#7E9A9A] placeholder:font-mono placeholder:uppercase placeholder:tracking-[0.18em] placeholder:text-xs focus-visible:ring-0 focus-visible:border-[#C96A4A]"
                />
              </FormControl>
              <FormMessage className="font-mono uppercase text-[0.6875rem] tracking-[0.18em] mt-2" />
            </FormItem>
          )}
        />
      </div>

      {submitError && (
        <div className="border border-[#C96A4A] bg-[#C96A4A]/[0.08] p-5">
          <p className="font-mono uppercase text-xs tracking-[0.18em] text-[#C96A4A]">
            {submitError}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full sm:w-auto rounded-md bg-[#C96A4A] text-[#F7F3EC] border border-[#C96A4A] hover:bg-[#3F4A4F] hover:border-[#3F4A4F] font-mono uppercase text-xs tracking-[0.2em] px-10 py-6 h-auto"
        >
          {isSubmitting ? (
            <>
              <Loader className="animate-spin mr-3 size-4" />
              Connexion...
            </>
          ) : (
            "Se connecter"
          )}
        </Button>
      </div>
    </Form>
  );
}

export default function Authentification() {
  const { ref: headerRef, isVisible: headerVisible } = useRevealOnScroll<HTMLDivElement>();
  const { ref: formRef, isVisible: formVisible } = useRevealOnScroll<HTMLDivElement>();

  return (
    <section data-section-id="1806"
      id="authentification"
      className="relative bg-[#F7F3EC] text-[#3F4A4F] overflow-hidden py-32 md:py-44 px-6 md:px-16"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, hsla(15, 54%, 53%, 0.08) 0%, transparent 65%)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-serif italic font-light select-none"
        style={{
          fontSize: "clamp(12rem, 22vw, 21rem)",
          color: "hsl(198 12% 28% / 0.02)",
          lineHeight: 1,
        }}
      >
        01
      </div>

      <div className="relative mx-auto max-w-[720px]">
        <div
          ref={headerRef}
          className="text-center transition-all duration-[900ms]"
          style={{
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateY(0)" : "translateY(16px)",
          }}
        >
          <div className="mb-8 flex items-center justify-center">
            <div className="rounded-[1.75rem] border border-[#D8C3A5]/80 bg-[#FFFDF9]/95 px-6 py-4 shadow-[0_18px_45px_rgba(63,74,79,0.12)] backdrop-blur-sm sm:px-8 sm:py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#C96A4A]/20 bg-[#F7F3EC] text-[#C96A4A] shadow-inner">
                  <WvcLogo className="h-8 w-auto sm:h-9" />
                </div>

                <div className="text-left">
                  <p
                    className="text-[1.15rem] font-semibold leading-none tracking-[0.08em] text-[#3F4A4F] sm:text-[1.35rem]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Fromagerie
                  </p>
                  <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.34em] text-[#7E9A9A] sm:text-[0.7rem]">
                    Artisanale
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="font-mono uppercase text-[0.75rem] tracking-[0.22em] text-[#C96A4A]">
            § 01 / Accès — Fromagerie Artisanale
          </p>

          <div className="mt-6 flex items-center justify-center">
            <div
              className="h-px w-60"
              style={{
                background:
                  "linear-gradient(to right, transparent, #C96A4A)",
              }}
            />
            <span className="ml-2 h-1.5 w-1.5 rounded-lg bg-[#C96A4A]" />
          </div>

        </div>

        <div
          ref={formRef}
          className="mt-20 transition-all duration-[900ms]"
          style={{
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            transitionDelay: "160ms",
            opacity: formVisible ? 1 : 0,
            transform: formVisible ? "translateY(0)" : "translateY(16px)",
          }}
        >
          <FormProvider formKey="auth_form_login" formId="auth_form_login"
            
            sectionName="authentification"
            defaultValues={{
              role: "",
              credentials: "",
            }}
            validationRules={{
              role: { required: true },
              credentials: { required: true },
            }}
            submitText="Se connecter"
            successMessage="Accès sécurisé. Redirection vers la fabrication."
            errorMessage="Identifiants incorrects. Veuillez réessayer."
          >
            <InnerCircleForm />
          </FormProvider>

          <p className="mt-10 text-center font-mono uppercase text-[0.6875rem] tracking-[0.18em] text-[#7E9A9A]">
            <span className="text-[#C96A4A]">·</span> Accès sécurisé <span className="text-[#C96A4A]">·</span> Gestion opérationnelle
          </p>
        </div>
      </div>
    </section>
  );
}