import { useRevealOnScroll } from "../../../hooks/useRevealOnScroll";
import { WvcLogo } from "../../../services/wordpress/WvcLogo";
import { InnerCircleForm } from "./LoginForm";

export { InnerCircleForm } from "./LoginForm";

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
                  <WvcLogo className="size-12" />
                </div>

                <div className="text-left">
                  <p
                    className="text-[1.15rem] font-serif font-semibold leading-none tracking-[0.08em] text-[#3F4A4F] sm:text-[1.35rem]"
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

