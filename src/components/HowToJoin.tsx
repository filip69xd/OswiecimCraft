import { Download, UserPlus, Gamepad2, Server } from "lucide-react";
import { SERVER } from "../data";
import SectionHeader from "./SectionHeader";
import { useReveal } from "../hooks/useReveal";

const STEPS = [
  {
    icon: <Download className="w-7 h-7" />,
    title: "Pobierz Minecraft",
    text: `Uruchom oficjalnego launchera Minecraft Java Edition. Wspieramy wersję ${SERVER.version}.`,
  },
  {
    icon: <Server className="w-7 h-7" />,
    title: "Dodaj serwer",
    text: "W menu Multiplayer kliknij „Add Server” i wpisz nazwę OświęcimCraft oraz adres IP serwera.",
  },
  {
    icon: <UserPlus className="w-7 h-7" />,
    title: "Dołącz do gry",
    text: "Kliknij „Join Server” i zacznij przygodę. Pierwszy raz? Zgłoś się do nas na Discord po pomoc.",
  },
  {
    icon: <Gamepad2 className="w-7 h-7" />,
    title: "Baw się dobrze",
    text: "Rozpocznij survival, zbieraj surowce, buduj i poznaj społeczność. Powodzenia!",
  },
];

export default function HowToJoin() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section id="join" className="relative py-24 md:py-32 px-5 md:px-8 bg-mc-panel/30 border-y border-mc-border">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <SectionHeader
          tag="Jak dołączyć"
          title="Zacznij grać w 4 krokach"
          subtitle="Dołączenie do OświęcimCraft zajmuje mniej niż 2 minuty. Postępuj zgodnie z instrukcją poniżej."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="relative bg-mc-panel border border-mc-border rounded-sm p-6 card-hover"
              style={{ animation: visible ? `slideUp 0.6s ease-out ${i * 0.1}s both` : undefined }}
            >
              <div className="absolute -top-3 -left-2 font-minecraft text-xs text-mc-bg bg-mc-gold w-7 h-7 flex items-center justify-center rounded-sm">
                {i + 1}
              </div>
              <div className="w-12 h-12 flex items-center justify-center bg-mc-green2/15 text-mc-green rounded-sm mb-4">
                {s.icon}
              </div>
              <h3 className="font-bold text-mc-text mb-2 text-sm">{s.title}</h3>
              <p className="text-sm text-mc-text/70 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-mc-dim text-sm mb-4">Nie masz jeszcze IP? Zgłoś się na naszym Discordzie.</p>
          <a
            href={SERVER.discord}
            target="_blank"
            rel="noreferrer"
            className="inline-block px-8 py-3 bg-mc-green2 text-mc-bg font-bold rounded-sm block-shadow hover:bg-mc-green"
          >
            Dołącz na Discord
          </a>
        </div>
      </div>
    </section>
  );
}
