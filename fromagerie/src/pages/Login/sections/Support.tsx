"use client";

import { FormProvider, useWvcForm } from "./../../../integrations/forms/FormProvider";
import { Button } from "./../../../components/ui/button";
import { Input } from "./../../../components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "./../../../components/ui/form";
import { Loader, ArrowRight, Sparkles, Leaf, SprayCan } from "lucide-react";
import { useRevealOnScroll } from "./../../../hooks/useRevealOnScroll";

function JoinForm() {
  const {
    isSubmitting,
    isSubmitted,
    submitError,
    successMessage,
    handleSubmit,
    resetForm,
    control,
  } = useWvcForm();

  if (isSubmitted && !submitError) {
    return (
      <div className="p-8 rounded-lg border-[3px] border-[#3F4A4F] bg-[#D8C3A5]/20">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="size-6 text-[#3F4A4F]" />
          <p className="font-default text-2xl text-[#3F4A4F]">Demande enregistrée !</p>
        </div>
        <p className="text-[#3F4A4F]/80 mb-6">{successMessage}</p>
        <Button
          onClick={resetForm}
          variant="outline"
          className="border-[3px] border-[#3F4A4F] bg-[#F7F3EC] text-[#3F4A4F] rounded-lg px-6 py-3 font-bold hover:bg-[#F7F3EC]/80"
        >
          Soumettre une autre demande
        </Button>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit} className="space-y-5">
      <FormField
        control={control}
        name="full_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-default text-xs tracking-[0.18em] uppercase text-[#3F4A4F]">
              Nom complet
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Jean Dupont"
                {...field}
                className="bg-[#F7F3EC] border-[3px] border-[#3F4A4F] rounded-lg h-12 px-4 text-[#3F4A4F] placeholder:text-[#3F4A4F]/40 focus-visible:ring-0 focus-visible:border-[#C96A4A] focus-visible:shadow-[4px_4px_0px_0px_#C96A4A]"
              />
            </FormControl>
            <FormDescription className="text-[#3F4A4F]/60 text-xs">
              Optionnel — pour personnaliser nos échanges.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="email"
        rules={{
          required: "L'email est requis",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Veuillez entrer un email valide",
          },
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-default text-xs tracking-[0.18em] uppercase text-[#3F4A4F]">
              Adresse email
            </FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="jean@exemple.com"
                {...field}
                className="bg-[#F7F3EC] border-[3px] border-[#3F4A4F] rounded-lg h-12 px-4 text-[#3F4A4F] placeholder:text-[#3F4A4F]/40 focus-visible:ring-0 focus-visible:border-[#C96A4A] focus-visible:shadow-[4px_4px_0px_0px_#C96A4A]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="zip_code"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-default text-xs tracking-[0.18em] uppercase text-[#3F4A4F]">
              Code postal
            </FormLabel>
            <FormControl>
              <Input
                placeholder="75001"
                {...field}
                className="bg-[#F7F3EC] border-[3px] border-[#3F4A4F] rounded-lg h-12 px-4 text-[#3F4A4F] placeholder:text-[#3F4A4F]/40 focus-visible:ring-0 focus-visible:border-[#C96A4A] focus-visible:shadow-[4px_4px_0px_0px_#C96A4A]"
              />
            </FormControl>
            <FormDescription className="text-[#3F4A4F]/60 text-xs">
              Pour optimiser la logistique de livraison.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {submitError && (
        <div className="p-4 border-[3px] border-[#C96A4A] rounded-lg bg-[#C96A4A]/10">
          <p className="text-[#C96A4A] font-medium text-sm">{submitError}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-14 bg-[#C96A4A] text-[#F7F3EC] border-[3px] border-[#3F4A4F] rounded-lg font-bold text-base hover:bg-[#C96A4A]/90 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[0px_0px_0px_0px_#3F4A4F] transition-all duration-150"
      >
        {isSubmitting ? (
          <>
            <Loader className="animate-spin mr-2 size-4" />
            Envoi...
          </>
        ) : (
          <>
            Envoyer la demande
            <ArrowRight className="ml-1 size-5" />
          </>
        )}
      </Button>
    </Form>
  );
}

export default function SupportTechnique() {
  const { ref: leftRef, isVisible: leftVisible } = useRevealOnScroll<HTMLDivElement>();
  const { ref: rightRef, isVisible: rightVisible } = useRevealOnScroll<HTMLDivElement>();

  const badges = [
    { text: "TRAÇABILITÉ TOTALE", bg: "bg-[#D8C3A5]", rotate: "-rotate-3" },
    { text: "SUIVI DES LOTS", bg: "bg-[#C96A4A] text-[#F7F3EC]", rotate: "rotate-2" },
    { text: "GESTION DES COÛTS", bg: "bg-[#7E9A9A]", rotate: "-rotate-1" },
  ];

  return (
    <section data-section-id="1719"
      id="support-technique"
      className="relative bg-[#F7F3EC] py-28 md:py-40 overflow-hidden border-t-[3px] border-[#3F4A4F]"
    >
      <div
        className="absolute top-0 left-0 right-0 h-4 bg-[#D8C3A5]"
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% 100%, 98% 0, 96% 100%, 94% 0, 92% 100%, 90% 0, 88% 100%, 86% 0, 84% 100%, 82% 0, 80% 100%, 78% 0, 76% 100%, 74% 0, 72% 100%, 70% 0, 68% 100%, 66% 0, 64% 100%, 62% 0, 60% 100%, 58% 0, 56% 100%, 54% 0, 52% 100%, 50% 0, 48% 100%, 46% 0, 44% 100%, 42% 0, 40% 100%, 38% 0, 36% 100%, 34% 0, 32% 100%, 30% 0, 28% 100%, 26% 0, 24% 100%, 22% 0, 20% 100%, 18% 0, 16% 100%, 14% 0, 12% 100%, 10% 0, 8% 100%, 6% 0, 4% 100%, 2% 0, 0 100%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-[1360px] mx-auto px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div
            ref={leftRef}
            data-index={0}
            className={`lg:col-span-5 transition-all duration-700 ease-out ${
              leftVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="font-default text-xs md:text-sm font-medium tracking-[0.18em] uppercase text-[#3F4A4F]">
                § 07 / SUPPORT TECHNIQUE
              </span>
              <span className="h-px bg-[#3F4A4F] w-20" aria-hidden="true" />
            </div>

            <h2 className="font-default text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[0.95] tracking-tight text-[#3F4A4F] mb-8">
              Optimisez votre{" "}
              <span className="relative inline-block">
                <span
                  className="absolute inset-0 bg-[#C96A4A] -rotate-1 -z-0"
                  style={{ top: "10%", bottom: "5%", left: "-4%", right: "-4%" }}
                  aria-hidden="true"
                />
                <span className="relative z-10 text-[#F7F3EC]">production</span>
              </span>
              .
            </h2>

            <p className="text-lg md:text-xl text-[#3F4A4F]/70 max-w-[420px] leading-relaxed mb-10">
              Besoin d'assistance sur la traçabilité, le suivi des stocks ou la planification ? Notre équipe technique est à votre disposition.
            </p>

            <div className="flex flex-col items-start gap-4 mb-10">
              {badges.map((badge, i) => (
                <div
                  key={i}
                  data-index={i}
                  className={`${badge.bg} ${badge.rotate} border-[2px] border-[#3F4A4F] rounded-lg px-4 py-2 font-default text-base md:text-lg shadow-[3px_3px_0px_0px_#3F4A4F]`}
                >
                  {badge.text}
                </div>
              ))}
            </div>

            <div className="relative h-32 -ml-4 hidden md:block" aria-hidden="true">
              <SprayCan
                className="absolute left-2 top-2 size-14 text-[#3F4A4F] -rotate-12"
                strokeWidth={2.5}
              />
              <Leaf
                className="absolute left-24 top-8 size-12 text-[#7E9A9A] rotate-12"
                strokeWidth={2.5}
                fill="#7E9A9A"
              />
              <Sparkles
                className="absolute left-44 top-0 size-10 text-[#C96A4A] rotate-6"
                strokeWidth={2.5}
              />
              <Leaf
                className="absolute left-12 top-16 size-8 text-[#3F4A4F] -rotate-45"
                strokeWidth={2.5}
              />
              <Sparkles
                className="absolute left-56 top-14 size-8 text-[#3F4A4F]"
                strokeWidth={2.5}
              />
            </div>
          </div>

          <div
            ref={rightRef}
            data-index={1}
            className={`lg:col-span-7 transition-all duration-700 ease-out delay-150 ${
              rightVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="relative">
              <div
                className="absolute -top-4 right-8 md:right-16 w-32 h-8 bg-[#D8C3A5]/40 border-y border-[#3F4A4F] rotate-6 z-20"
                aria-hidden="true"
              />

              <div className="relative bg-[#F7F3EC] border-[4px] border-[#3F4A4F] rounded-3xl p-8 md:p-10">
                <div className="mb-8">
                  <p className="font-default text-xs tracking-[0.18em] uppercase text-[#3F4A4F]/60 mb-3">
                    SUPPORT TECHNIQUE
                  </p>
                  <h3 className="font-default text-3xl md:text-4xl text-[#3F4A4F] leading-tight">
                    Contactez nos experts
                  </h3>
                </div>

                <FormProvider formKey="support_form_login" formId="support_form_login"
                  
                  sectionName="support-technique"
                  defaultValues={{
                    full_name: "",
                    email: "",
                    zip_code: "",
                  }}
                  validationRules={{
                    full_name: { required: false },
                    email: { required: true, pattern: "email" },
                    zip_code: { required: false },
                  }}
                  submitText="Envoyer la demande"
                  successMessage="Votre demande a bien été transmise. Un expert vous répondra sous peu."
                  errorMessage="Une erreur est survenue. Veuillez réessayer."
                >
                  <JoinForm />
                </FormProvider>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}