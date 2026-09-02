"use client";

import { useNavigate } from "react-router-dom";
import { useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./../../../components/ui/select";
import { useRevealOnScroll } from "./../../../hooks/useRevealOnScroll";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { cn } from "./../../../utils/utils";
import { WvcLogo } from "./../../../services/wordpress/WvcLogo";
import { useAuth } from "../hooks/useAuth";
import { HttpError } from "../../../services/http/apiClient";

type AccessMode = "Propriétaire" | "Employé";

interface LoginFormValues {
  accessMode: AccessMode | "";
  username: string;
  password: string;
}

interface DemoAccount {
  label: string;
  accessMode: AccessMode;
  username: string;
  credential: string;
  credentialLabel: "Mot de passe" | "PIN";
}

const demoAccounts: readonly DemoAccount[] = import.meta.env.DEV
  ? [
      {
        label: "Propriétaire démo",
        accessMode: "Propriétaire",
        username: "gilles.demo",
        credential: "DemoFromagerie2026!",
        credentialLabel: "Mot de passe",
      },
      {
        label: "Fabrication démo",
        accessMode: "Employé",
        username: "jean.demo",
        credential: "1234",
        credentialLabel: "PIN",
      },
      {
        label: "Vente démo",
        accessMode: "Employé",
        username: "nathalie.demo",
        credential: "5678",
        credentialLabel: "PIN",
      },
    ]
  : [];

const accessLevels = [
  { label: "Propriétaire", sublabel: "Mot de passe", value: "Propriétaire" },
  { label: "Employé", sublabel: "Code PIN", value: "Employé" },
];

export function InnerCircleForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const methods = useForm<LoginFormValues>({
    defaultValues: {
      accessMode: "",
      username: "",
      password: "",
    },
    mode: "onBlur",
  });
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = methods;
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const selectedAccessMode = useWatch({
    control,
    name: "accessMode",
  });

  const submitLogin = async (values: LoginFormValues): Promise<void> => {
    try {
      await login({ username: values.username.trim(), password: values.password });
      navigate("/home", { replace: true });
    } catch (error: unknown) {
      setValue("password", "");
      setError("root", {
        message:
          error instanceof HttpError && (error.status === 400 || error.status === 401)
            ? error.message
            : "Connexion au serveur impossible. Veuillez réessayer.",
      });
    }
  };

  const selectDemoAccount = (account: DemoAccount): void => {
    setValue("accessMode", account.accessMode, { shouldDirty: true, shouldValidate: true });
    setValue("username", account.username, { shouldDirty: true, shouldValidate: true });
    setValue("password", account.credential, { shouldDirty: true, shouldValidate: true });
    clearErrors("root");

    window.requestAnimationFrame(() => {
      if (typeof submitButtonRef.current?.scrollIntoView === "function") {
        submitButtonRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(submitLogin)} className="space-y-10" noValidate>
        {demoAccounts.length > 0 && (
          <aside className="rounded-2xl border border-[#D8C3A5] bg-[#FFFDF9]/70 p-5 shadow-[0_10px_30px_rgba(63,74,79,0.06)]" aria-labelledby="demo-accounts-title">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p
                  id="demo-accounts-title"
                  className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-[#C96A4A]"
                >
                  Compte démo
                </p>
                <p className="mt-1 text-sm text-[#7E9A9A]">
                  Préremplir un accès de démonstration
                </p>
              </div>
              <span className="hidden rounded-full bg-[#C96A4A]/[0.08] px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[#C96A4A] sm:inline-flex">
                Accès rapide
              </span>
            </div>

            <Select onValueChange={(username) => {
              const account = demoAccounts.find((demoAccount) => demoAccount.username === username);
              if (account) selectDemoAccount(account);
            }}>
              <SelectTrigger aria-label="Choisir un compte de démonstration" className="h-auto rounded-xl border-[#D8C3A5] bg-[#F7F3EC]/70 py-3 text-[#3F4A4F]">
                <SelectValue placeholder="Choisir un compte" />
              </SelectTrigger>
              <SelectContent>
                {demoAccounts.map((account) => (
                  <SelectItem key={account.username} value={account.username} className="py-3">
                    <span className="flex w-full items-center justify-between gap-8">
                      <span>
                        <span className="block font-medium">{account.label}</span>
                        <span className="mt-1 block font-mono text-[0.625rem] text-[#7E9A9A]">
                          {account.username}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full border border-[#C96A4A]/30 bg-[#C96A4A]/[0.08] px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[#C96A4A]">
                        {account.accessMode}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </aside>
        )}

        <div className="grid grid-cols-1 gap-x-10 gap-y-10">
        <FormField
          control={control}
          name="accessMode"
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
                        "cursor-pointer p-6 border transition-all duration-300 rounded-2xl",
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
          name="username"
          rules={{ required: "Nom d'utilisateur requis" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono uppercase text-[0.6875rem] tracking-[0.22em] text-[#7E9A9A]">
                Nom d'utilisateur
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  autoComplete="username"
                  placeholder="Votre identifiant"
                  {...field}
                  className="h-auto rounded-2xl border border-[#D8C3A5] bg-[#FFFDF9]/80 px-4 py-3 text-base text-foreground placeholder:text-[#7E9A9A] placeholder:font-mono placeholder:uppercase placeholder:tracking-[0.18em] placeholder:text-xs focus-visible:ring-2 focus-visible:ring-[#C96A4A]/30 focus-visible:border-[#C96A4A]"
                />
              </FormControl>
              <FormMessage className="font-mono uppercase text-[0.6875rem] tracking-[0.18em] mt-2" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="password"
          rules={{
            required: "Identifiant requis",
            minLength: {
              value: selectedAccessMode === "Propriétaire" ? 8 : 4,
              message: selectedAccessMode === "Propriétaire" ? "Min 8 caractères" : "Le PIN contient 4 chiffres",
            },
            validate: (value) =>
              selectedAccessMode !== "Employé" || /^\d{4}$/.test(value) || "Le PIN contient exactement 4 chiffres",
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono uppercase text-[0.6875rem] tracking-[0.22em] text-[#7E9A9A]">
                {selectedAccessMode === "Propriétaire" ? "Mot de passe" : "Code PIN"}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  inputMode={selectedAccessMode === "Employé" ? "numeric" : "text"}
                  placeholder={selectedAccessMode === "Propriétaire" ? "••••••••" : "0000"}
                  {...field}
                  className="h-auto rounded-2xl border border-[#D8C3A5] bg-[#FFFDF9]/80 px-4 py-3 text-base text-foreground placeholder:text-[#7E9A9A] placeholder:font-mono placeholder:uppercase placeholder:tracking-[0.18em] placeholder:text-xs focus-visible:ring-2 focus-visible:ring-[#C96A4A]/30 focus-visible:border-[#C96A4A]"
                />
              </FormControl>
              <FormMessage className="font-mono uppercase text-[0.6875rem] tracking-[0.18em] mt-2" />
            </FormItem>
          )}
        />
        </div>

        {errors.root?.message && (
          <div role="alert" className="border border-[#C96A4A] bg-[#C96A4A]/[0.08] p-5">
            <p className="font-mono uppercase text-xs tracking-[0.18em] text-[#C96A4A]">
              {errors.root.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
          <Button
            ref={submitButtonRef}
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full sm:w-auto rounded-full bg-[#C96A4A] text-[#F7F3EC] border border-[#C96A4A] hover:bg-[#3F4A4F] hover:border-[#3F4A4F] font-mono uppercase text-xs tracking-[0.2em] px-10 py-6 h-auto"
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
    </FormProvider>
  );
}

export default function Authentification() {
  const { ref: headerRef, isVisible: headerVisible } = useRevealOnScroll<HTMLDivElement>();
  const { ref: formRef, isVisible: formVisible } = useRevealOnScroll<HTMLDivElement>();

  return (
    <section data-section-id="1806"
      id="authentification"
      className="relative bg-[#F7F3EC] text-[#3F4A4F] overflow-hidden px-6 pb-32 pt-20 md:px-16 md:pb-44 md:pt-24"
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
          <InnerCircleForm />

          <p className="mt-10 text-center font-mono uppercase text-[0.6875rem] tracking-[0.18em] text-[#7E9A9A]">
            <span className="text-[#C96A4A]">·</span> Accès sécurisé <span className="text-[#C96A4A]">·</span> Gestion opérationnelle
          </p>
        </div>
      </div>
    </section>
  );
}
