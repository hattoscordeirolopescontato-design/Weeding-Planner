import Link from "next/link";
import { Handshake, MapPin, Users, Mail } from "lucide-react";

const features = [
  { icon: Handshake, title: "Fornecedores", desc: "Buffet, foto, decoração — com valores, parcelas e comprovantes." },
  { icon: MapPin, title: "Local", desc: "Compare opções e calcule o custo total automaticamente." },
  { icon: Users, title: "Convidados", desc: "Lista, grupos e confirmação de presença." },
  { icon: Mail, title: "Votos secretos", desc: "Cifrados com a sua senha. Só você lê." },
];

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
