import Link from "next/link";
import { Handshake, MapPin, Users, Mail } from "lucide-react";

const features = [
  { icon: Handshake, title: "Fornecedores", desc: "Buffet, foto, decoração — com valores, parcelas e comprovantes." },
  { icon: MapPin, title: "Local", desc: "Compare opções e calcule o custo total automaticamente." },
  { icon: Users, title: "Convidados", desc: "Lista, grupos e confirmação de presença." },
  { icon: Mail, title: "Votos secretos", desc: "Cifrados com a sua senha. Só você lê." },
];

const WHATSAPP_NUMBER = "5511998360593";
const WHATSAPP_MESSAGE = "Olá! Preciso de ajuda com o Wedding Planner.";

function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o suporte pelo WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_8px_24px_rgba(37,211,102,0.4)] transition hover:scale-105 hover:shadow-[0_10px_28px_rgba(37,211,102,0.5)]"
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="white" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12.004 2c-5.523 0-10 4.477-10 10 0 1.766.462 3.492 1.34 5.008L2 22l5.13-1.326A9.958 9.958 0 0 0 12.004 22c5.523 0 10-4.477 10-10S17.527 2 12.004 2zm0 18.083a8.06 8.06 0 0 1-4.09-1.117l-.293-.174-3.043.787.812-2.968-.19-.304a8.07 8.07 0 0 1-1.24-4.307c0-4.465 3.63-8.096 8.096-8.096s8.096 3.631 8.096 8.096-3.631 8.083-8.148 8.083z" />
      </svg>
    </a>
  );
}

function Orbs() {
  return (
    <>
      <div
        className="pointer-events-none fixed left-[14%] top-[-140px] h-[420px] w-[420px] rounded-full"
        style={{
          background: "radial-gradient(circle at 30% 30%, rgba(252,239,192,0.55), rgba(216,180,120,0) 70%)",
          filter: "blur(10px)",
          animation: "wpFloat1 16s ease-in-out infinite",
          zIndex: 0,
        }}
      />
      <div
        className="pointer-events-none fixed right-[8%] top-[100px] h-[360px] w-[360px] rounded-full"
        style={{
          background: "radial-gradient(circle at 60% 40%, rgba(216,180,120,0.35), rgba(216,180,120,0) 70%)",
          filter: "blur(10px)",
          animation: "wpFloat2 20s ease-in-out infinite",
          zIndex: 0,
        }}
      />
      <div
        className="pointer-events-none fixed bottom-[-120px] left-[42%] h-[320px] w-[320px] rounded-full"
        style={{
          background: "radial-gradient(circle at 40% 60%, rgba(156,108,60,0.2), rgba(156,108,60,0) 70%)",
          filter: "blur(10px)",
          animation: "wpFloat3 24s ease-in-out infinite",
          zIndex: 0,
        }}
      />
    </>
  );
}

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
      <Orbs />
      <WhatsAppButton />

      <div className="relative z-[1] flex flex-1 flex-col">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
          <span className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/wedding-planner-symbol.png"
              alt=""
              className="h-9 w-9 rounded-full"
              style={{ animation: "wpPulseRing 3.5s ease-in-out infinite" }}
            />
            <span className="font-display text-xl font-bold text-[#2B2620]">
              Wedding <span className="text-[#9C6C3C]">Planner</span>
            </span>
          </span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/login" className="font-semibold text-[#6B5F4F] transition hover:text-[#2B2620]">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="btn-gold rounded-xl px-4 py-2 font-black shadow-[0_8px_20px_rgba(156,108,60,0.24)] transition hover:brightness-[1.03]"
            >
              Criar conta
            </Link>
          </nav>
        </header>

        <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/wedding-planner-logo.png" alt="Wedding Planner" className="h-20 w-auto" />
          <h1 className="font-display mt-8 text-5xl font-bold tracking-tight text-[#2B2620] sm:text-6xl">
            O planejamento do seu casamento, sem estresse.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-[#8a7b63]">
            Reúna fornecedores, local, convidados, agenda, checklist e até seus
            votos — tudo organizado e seguro, em um só lugar.
          </p>
          <Link
            href="/cadastro"
            className="btn-gold mt-9 rounded-xl px-7 py-3.5 text-base font-black shadow-[0_12px_28px_rgba(156,108,60,0.28)] transition hover:brightness-[1.03]"
          >
            Começar agora
          </Link>

          <div className="mt-16 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="glass p-6 text-left">
                  <div className="gold-chip flex h-11 w-11 items-center justify-center rounded-[12px]">
                    <Icon size={22} strokeWidth={1.8} className="text-[#9C6C3C]" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-[#2B2620]">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#8a7b63]">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="mx-auto w-full max-w-5xl px-6 py-8 text-center text-sm text-[#b7a98c]">
          Feito com carinho para o grande dia.
        </footer>
      </div>
    </main>
  );
}
