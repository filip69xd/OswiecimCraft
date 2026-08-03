import { useState, useEffect, useCallback } from "react";
import { Copy, Check, Users, Signal, Swords, Loader2 } from "lucide-react";
import { SERVER } from "../data";
import { supabase } from "../lib/supabase";
import { useCountUp } from "../hooks/useCountUp";

interface ServerStatus {
  online: boolean;
  playersOnline: number;
  playersMax: number;
  version: string | null;
}

export default function Hero() {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke("server-status", {
      method: "GET",
    });
    if (!error && data) {
      setStatus(data as ServerStatus);
    }
    setStatusLoading(false);
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const animatedCount = useCountUp(status?.playersOnline ?? 0, 1200, !!status && status.online);

  const copyIp = () => {
    navigator.clipboard.writeText(SERVER.ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isOnline = status?.online ?? false;
  const playersText = statusLoading
    ? "..."
    : isOnline
      ? String(animatedCount)
      : "Offline";

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pixel-grid"
    >
      {/* Ambient glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-mc-green2/20 rounded-full blur-3xl animate-glow" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-mc-gold2/15 rounded-full blur-3xl animate-glow" />

      <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 text-center pt-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-mc-panel/60 border border-mc-border rounded-full backdrop-blur-sm animate-slideUp">
          <span
            className={`w-2 h-2 rounded-full ${isOnline ? "bg-mc-green animate-glow" : "bg-red-500"} ${statusLoading ? "bg-mc-gold animate-pulse" : ""}`}
          />
          <span className="text-xs font-semibold text-mc-dim tracking-wider uppercase">
            {statusLoading
              ? "Sprawdzanie statusu serwera..."
              : isOnline
                ? `Serwer online · ${status?.version ?? SERVER.version}`
                : "Serwer offline · Wkrótce start"}
          </span>
        </div>

        <h1 className="font-minecraft text-3xl md:text-6xl lg:text-7xl text-mc-green leading-tight mb-6 animate-slideUp" style={{ animationDelay: "0.1s", opacity: 0 }}>
          Oświęcim<span className="text-mc-gold">Craft</span>
        </h1>

        <p className="text-base md:text-xl text-mc-text/80 max-w-2xl mx-auto mb-10 animate-slideUp" style={{ animationDelay: "0.2s", opacity: 0 }}>
          {SERVER.tagline}. Czysty survival, ekonomia i społeczność, która
          trzyma się razem. Dołącz i zbuduj z nami coś wielkiego.
        </p>

        {/* IP card */}
        <div className="max-w-md mx-auto mb-8 animate-slideUp" style={{ animationDelay: "0.3s", opacity: 0 }}>
          <div className="bg-mc-panel/70 border border-mc-border rounded-sm p-5 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-widest text-mc-dim mb-2 font-semibold">
              IP Serwera
            </p>
            <button
              onClick={copyIp}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-mc-bg border border-mc-border hover:border-mc-green rounded-sm transition-colors group"
            >
              <span className="font-minecraft text-sm md:text-base text-mc-green">
                {SERVER.ip}
              </span>
              {copied ? (
                  <Check className="w-5 h-5 text-mc-green" />
                ) : (
                  <Copy className="w-5 h-5 text-mc-dim group-hover:text-mc-green transition-colors" />
                )
              }
            </button>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slideUp" style={{ animationDelay: "0.4s", opacity: 0 }}>
          <a
            href={SERVER.discord}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-8 py-4 bg-mc-green2 text-mc-bg font-bold rounded-sm block-shadow hover:bg-mc-green text-center"
          >
            Dołącz na Discord
          </a>
          <a
            href="#shop"
            className="w-full sm:w-auto px-8 py-4 bg-mc-panel border-2 border-mc-gold2 text-mc-gold font-bold rounded-sm block-shadow hover:bg-mc-gold2 hover:text-mc-bg text-center transition-colors"
          >
            Wesprzyj serwer
          </a>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-16 animate-slideUp" style={{ animationDelay: "0.5s", opacity: 0 }}>
          <Stat
            icon={statusLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Users className="w-6 h-6" />}
            value={playersText}
            label={isOnline ? `Graczy · ${status?.playersMax ?? 0} max` : "Graczy"}
            highlight={isOnline}
          />
          <Stat icon={<Signal className="w-6 h-6" />} value={isOnline ? "Online" : "Start"} label="Serwera" />
          <Stat icon={<Swords className="w-6 h-6" />} value="Survival" label="Tryb gry" />
        </div>
      </div>
    </section>
  );
}

function Stat({
  icon,
  value,
  label,
  highlight,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-mc-panel/40 border border-mc-border rounded-sm p-4 backdrop-blur-sm">
      <div className={`flex justify-center mb-2 ${highlight ? "text-mc-green" : "text-mc-green"}`}>
        {icon}
      </div>
      <div className="font-minecraft text-lg md:text-2xl text-mc-gold">{value}</div>
      <div className="text-xs text-mc-dim mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
}
