import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

export const btnPrimary =
  "btn-gold inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black shadow-[0_8px_20px_rgba(156,108,60,0.24)] transition hover:brightness-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B49054] disabled:cursor-not-allowed disabled:opacity-60";
export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-xl border-[1.5px] border-[#E4D6BC] bg-white/70 px-4 py-2.5 text-sm font-bold text-[#2B2620] transition hover:border-[#B49054] hover:bg-[#FBF8F3]";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
}) {
  return (
    <button
      {...rest}
      className={`${variant === "primary" ? btnPrimary : btnGhost} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-bold text-[#6B5F4F]">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-[#8a7b63]">{hint}</p>}
      {error && <p className="text-xs font-medium text-[#9C6C3C]">{error}</p>}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input {...rest} className={`glass-input ${className}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return (
    <textarea {...rest} className={`glass-input min-h-24 resize-y ${className}`} />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", children, ...rest } = props;
  return (
    <select {...rest} className={`glass-input ${className}`}>
      {children}
    </select>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`glass p-6 ${className}`}>{children}</div>;
}

export function Badge({
  children,
  tone = "stone",
}: {
  children: ReactNode;
  tone?: "stone" | "green" | "amber" | "rose" | "blue" | "terracota" | "vinho" | "gold";
}) {
  const tones: Record<string, string> = {
    stone: "bg-[rgba(120,90,50,0.08)] text-[#8a7b63]",
    green: "bg-emerald-500/12 text-emerald-700",
    amber: "bg-amber-500/15 text-amber-800",
    rose: "bg-[rgba(156,108,60,0.12)] text-[#9C6C3C]",
    blue: "bg-sky-500/12 text-sky-700",
    terracota: "bg-[rgba(156,108,60,0.12)] text-[#9C6C3C]",
    vinho: "bg-[rgba(156,108,60,0.12)] text-[#9C6C3C]",
    gold: "bg-[rgba(216,180,120,0.2)] text-[#9C6C3C]",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-6">
      <h1 className="font-display text-3xl font-bold text-[#2B2620]">{title}</h1>
      {subtitle && <p className="mt-1 text-[#8a7b63]">{subtitle}</p>}
    </header>
  );
}
