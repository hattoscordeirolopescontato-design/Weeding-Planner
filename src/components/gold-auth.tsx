import type { ButtonHTMLAttributes, ReactNode } from "react";

export const serifStyle = { fontFamily: "'Playfair Display', serif" };
export const goldGradient =
  "linear-gradient(135deg,#FCEFC0 0%,#D8B478 35%,#B49054 65%,#9C6C3C 100%)";

export const authInput =
  "w-full rounded-[10px] border-[1.5px] border-[#E4D6BC] bg-white px-4 py-3.5 text-[15px] text-[#2B2620] placeholder:text-[#B7A98C] outline-none transition focus:border-[#B49054] focus:ring-[3px] focus:ring-[#B49054]/20";
export const authLabel = "mb-1.5 block text-[13px] font-bold text-[#6B5F4F]";
export const authLink =
  "text-[13px] font-bold text-[#9C6C3C] hover:text-[#7A521E] hover:underline";

export function GoldButton({
  children,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`w-full rounded-xl py-[15px] text-base font-black text-[#2B2620] shadow-[0_8px_20px_rgba(156,108,60,0.28)] transition hover:-translate-y-px hover:shadow-[0_10px_24px_rgba(156,108,60,0.36)] disabled:opacity-60 ${className}`}
      style={{ background: goldGradient }}
    >
      {children}
    </button>
  );
}

/**
 * Shell da identidade de autenticação: painel escuro com a logo à esquerda
 * e o formulário (children) à direita. Fonte Playfair + Nunito Sans.
 */
export function GoldAuthShell({
  tagline,
  subtitle,
  children,
}: {
  tagline: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main
      className="relative z-10 flex min-h-screen w-full flex-col md:flex-row"
      style={{ background: "#F6F1EC", fontFamily: "'Nunito Sans', sans-serif" }}
    >
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <linearGradient id="loginGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FCEFC0" />
            <stop offset="35%" stopColor="#D8B478" />
            <stop offset="65%" stopColor="#B49054" />
            <stop offset="100%" stopColor="#9C6C3C" />
          </linearGradient>
        </defs>
      </svg>

      {/* Painel da marca */}
      <div
        className="relative hidden flex-col items-center justify-center overflow-hidden p-16 md:flex md:w-[46%]"
        style={{ background: "linear-gradient(165deg,#2B2620 0%,#3A322A 55%,#2B2620 100%)" }}
      >
        <svg width="420" height="420" viewBox="0 0 420 420" fill="none" className="absolute -right-40 -top-36 opacity-[0.12]">
          <circle cx="210" cy="210" r="170" stroke="url(#loginGold)" strokeWidth="14" />
        </svg>
        <svg width="380" height="380" viewBox="0 0 380 380" fill="none" className="absolute -bottom-36 -left-36 opacity-10">
          <circle cx="190" cy="190" r="150" stroke="url(#loginGold)" strokeWidth="14" />
        </svg>

        <div className="relative z-10 flex max-w-[420px] flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/wedding-planner-logo.png" alt="Wedding Planner" className="w-[280px]" />
          <div className="my-7 h-[1.5px] w-10 bg-[#9C6C3C]" />
          <div className="text-[32px] font-bold leading-[1.3] text-[#FBF8F3]" style={serifStyle}>
            {tagline}
          </div>
          <div className="mt-4 text-[15px] leading-[1.7] text-[#C9B89A]">{subtitle}</div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center text-xs tracking-[0.04em] text-[#8A7B63]">
          © 2026 Wedding Planner
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 items-center justify-center p-8 sm:p-14">
        <div className="w-full max-w-[400px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/wedding-planner-symbol.png" alt="" className="mx-auto mb-5 block w-14" />
          {children}
        </div>
      </div>
    </main>
  );
}
