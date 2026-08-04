import { Swords, Heart } from "lucide-react";
import { SERVER } from "../data";

export default function Footer() {
  return (
    <footer className="relative bg-mc-bg border-t border-mc-border px-5 md:px-8 pt-16 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-mc-green2 flex items-center justify-center rounded-sm">
                <Swords className="w-5 h-5 text-mc-bg" strokeWidth={2.5} />
              </div>
              <span className="font-minecraft text-sm text-mc-green">OświęcimCraft</span>
            </div>
            <p className="text-sm text-mc-text/60 leading-relaxed max-w-sm">
              {SERVER.tagline}. Budujemy społeczność graczy, którzy cenią
              dobrą zabawę, uczciwość i współpracę.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-mc-dim mb-4">
              Nawigacja
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                ["#modes", "Tryby gry"],
                ["#join", "Jak dołączyć"],
                ["#shop", "Sklep"],
                ["#terms", "Regulamin"],
                ["#news", "Newsy"],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="text-mc-text/70 hover:text-mc-green transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-mc-dim mb-4">
              Społeczność
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={SERVER.discord}
                  target="_blank"
                  rel="noreferrer"
                  className="text-mc-text/70 hover:text-mc-green transition-colors"
                >
                  Discord
                </a>
              </li>
              <li className="text-mc-text/70">Wersja: {SERVER.version}</li>
              <li className="text-mc-text/70">IP: {SERVER.ip}</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-mc-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-mc-dim">
            © {new Date().getFullYear()} OświęcimCraft. Wszelkie prawa zastrzeżone.
          </p>
          <p className="text-xs text-mc-dim flex items-center gap-1.5">
            Zbudowane z <Heart className="w-3.5 h-3.5 text-mc-green" /> przez graczy dla graczy
          </p>
        </div>

        <p className="text-[10px] text-mc-dim/60 text-center mt-6 max-w-2xl mx-auto leading-relaxed">
          Nie jesteśmy powiązani z Mojang Studios ani Microsoft. Minecraft jest
          znakiem towarowym Mojang Studios.
        </p>
      </div>
    </footer>
  );
}
