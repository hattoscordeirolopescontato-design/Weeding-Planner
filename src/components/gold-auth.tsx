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

export function OrDivider() {
  return (
    <div className="my-7 flex items-center gap-3.5">
      <div className="h-px flex-1 bg-[#E4D6BC]" />
      <div className="text-xs font-bold text-[#B7A98C]">OU</div>
      <div className="h-px flex-1 bg-[#E4D6BC]" />
    </div>
  );
}

export function GoogleButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2.5 rounded-xl border-[1.5px] border-[#E4D6BC] bg-white py-3.5 text-sm font-bold text-[#2B2620] transition hover:border-[#B49054] hover:bg-[#FBF8F3]"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
        <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.73-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z" />
        <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11Z" />
        <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z" />
      </svg>
      {label}
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
