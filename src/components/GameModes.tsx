import { Trees, Check } from "lucide-react";
import { GAME_MODES, type GameMode } from "../data";
import SectionHeader from "./SectionHeader";

export default function GameModes() {
  const mode = GAME_MODES[0];

  return (
    <section id="modes" className="relative py-24 md:py-32 px-5 md:px-8">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          tag="Tryb gry"
          title="Survival — klasyczna przygoda"
          subtitle="Jeden tryb, zrobiony porządnie. Zbieraj surowce, buduj, handluj i przetrwaj razem z nami. Więcej trybów w drodze!"
        />

        <div className="mt-14">
          <ModeCard mode={mode} />
        </div>
      </div>
    </section>
  );
}

function ModeCard({ mode }: { mode: GameMode }) {
  return (
    <div
      className="card-hover bg-mc-panel border-2 border-mc-border rounded-sm p-8 md:p-10"
      style={{ borderTopColor: mode.accent, borderTopWidth: "4px" }}
    >
      <div className="grid md:grid-cols-[auto_1fr] gap-6 md:gap-8 items-start">
        <div
          className="w-16 h-16 flex items-center justify-center rounded-sm"
          style={{ backgroundColor: `${mode.accent}20`, color: mode.accent }}
        >
          <Trees className="w-8 h-8" />
        </div>

        <div>
          <h3 className="font-minecraft text-lg md:text-xl text-mc-text mb-2">{mode.name}</h3>
          <p className="text-sm font-semibold mb-4" style={{ color: mode.accent }}>
            {mode.tagline}
          </p>
          <p className="text-sm md:text-base text-mc-text/75 leading-relaxed mb-6">
            {mode.description}
          </p>

          <ul className="grid sm:grid-cols-2 gap-2.5">
            {mode.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-mc-text/85">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: mode.accent }} />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
