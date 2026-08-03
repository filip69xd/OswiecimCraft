import { useState } from "react";
import { Check, Crown, Key, KeyRound, Gem, Zap, ArrowRight, Loader2 } from "lucide-react";
import { SHOP_RANKS, SHOP_KEYS, type ShopRank, type ShopKey } from "../data";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import SectionHeader from "./SectionHeader";
import { useReveal } from "../hooks/useReveal";

const KEY_ICONS: Record<string, React.ReactNode> = {
  key: <Key className="w-6 h-6" />,
  "key-round": <KeyRound className="w-6 h-6" />,
  gem: <Gem className="w-6 h-6" />,
};

type Tab = "ranks" | "keys";

export default function Shop({
  onAuthClick,
}: {
  onAuthClick: (mode: "signin" | "signup") => void;
}) {
  const [tab, setTab] = useState<Tab>("ranks");
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="shop" className="relative py-24 md:py-32 px-5 md:px-8">
      <div className="absolute inset-0 pixel-grid opacity-40" />
      <div
        ref={ref}
        className={`relative max-w-7xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <SectionHeader
          tag="Sklep"
          title="Wesprzyj serwer"
          subtitle="Kup rangę lub klucz i odbierz wyjątkowe korzyści w grze. Płatności obsługiwane bezpiecznie przez Stripe."
        />

        {/* Tabs */}
        <div className="flex justify-center gap-2 mt-10 mb-12">
          <TabButton active={tab === "ranks"} onClick={() => setTab("ranks")} icon={<Crown className="w-4 h-4" />}>
            Rangi
          </TabButton>
          <TabButton active={tab === "keys"} onClick={() => setTab("keys")} icon={<Key className="w-4 h-4" />}>
            Klucze do skrzyń
          </TabButton>
        </div>

        {tab === "ranks" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SHOP_RANKS.map((rank, i) => (
              <div key={rank.id} style={{ animation: visible ? `slideUp 0.6s ease-out ${i * 0.1}s both` : undefined }}>
                <RankCard rank={rank} onAuthClick={onAuthClick} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SHOP_KEYS.map((key, i) => (
              <div key={key.id} style={{ animation: visible ? `slideUp 0.6s ease-out ${i * 0.1}s both` : undefined }}>
                <KeyCard item={key} onAuthClick={onAuthClick} />
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-mc-dim mt-10 max-w-xl mx-auto">
          Wszystkie zakupy są dobrowolne i służą utrzymaniu oraz rozwojowi serwera.
          Dziękujemy za wsparcie!{" "}
          <a href="#terms" className="underline hover:text-mc-green">Regulamin sklepu</a>
        </p>
      </div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-sm border-2 transition-all ${
        active
          ? "bg-mc-green2 text-mc-bg border-mc-green2"
          : "bg-mc-panel text-mc-text/70 border-mc-border hover:border-mc-green"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function RankCard({
  rank,
  onAuthClick,
}: {
  rank: ShopRank;
  onAuthClick: (mode: "signin" | "signup") => void;
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buy = async () => {
    if (!user) {
      onAuthClick("signin");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        onAuthClick("signin");
        return;
      }
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            itemId: rank.id,
            itemName: rank.name,
            itemType: "rank",
            price: rank.price,
          }),
        },
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Błąd połączenia");
      }
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
        setLoading(false);
      } else {
        throw new Error(data.error || "Nieznany błąd");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się uruchomić płatności. Spróbuj ponownie.");
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative bg-mc-panel border-2 rounded-sm p-7 flex flex-col card-hover ${
        rank.popular ? "border-mc-gold2" : "border-mc-border"
      }`}
    >
      {rank.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-mc-gold text-mc-bg text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1">
          <Zap className="w-3 h-3" />
          {rank.badge}
        </div>
      )}
      {!rank.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-mc-panel2 text-mc-dim text-xs font-bold uppercase tracking-wider rounded-sm border border-mc-border">
          {rank.badge}
        </div>
      )}

      <div
        className="w-14 h-14 flex items-center justify-center rounded-sm mb-5 mt-2"
        style={{ backgroundColor: `${rank.color}20`, color: rank.color }}
      >
        <Crown className="w-7 h-7" />
      </div>

      <h3 className="font-minecraft text-lg mb-2" style={{ color: rank.color }}>
        {rank.name}
      </h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="font-minecraft text-2xl text-mc-text">{rank.price}</span>
        <span className="text-mc-dim text-sm">zł</span>
      </div>

      <ul className="space-y-3 mb-7 flex-1">
        {rank.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2 text-sm text-mc-text/85">
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: rank.color }} />
            {perk}
          </li>
        ))}
      </ul>

      {error && (
        <p className="text-xs text-red-400 mb-3 text-center">{error}</p>
      )}
      <button
        onClick={buy}
        disabled={loading}
        className="w-full py-3 font-bold rounded-sm block-shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        style={{
          backgroundColor: rank.color,
          color: "#0a0e0a",
        }}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            Kup teraz
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}

function KeyCard({
  item,
  onAuthClick,
}: {
  item: ShopKey;
  onAuthClick: (mode: "signin" | "signup") => void;
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buy = async () => {
    if (!user) {
      onAuthClick("signin");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        onAuthClick("signin");
        return;
      }
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            itemId: item.id,
            itemName: item.name,
            itemType: "key",
            price: item.price,
          }),
        },
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Błąd połączenia");
      }
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
        setLoading(false);
      } else {
        throw new Error(data.error || "Nieznany błąd");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się uruchomić płatności.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-mc-panel border-2 border-mc-border rounded-sm p-6 card-hover flex flex-col">
      <div className="w-12 h-12 flex items-center justify-center bg-mc-gold2/15 text-mc-gold rounded-sm mb-4">
        {KEY_ICONS[item.icon]}
      </div>
      <h3 className="font-bold text-mc-text mb-2">{item.name}</h3>
      <p className="text-sm text-mc-text/70 leading-relaxed mb-5 flex-1">{item.description}</p>
      {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="font-minecraft text-lg text-mc-gold">{item.price}</span>
          <span className="text-mc-dim text-sm">zł</span>
        </div>
        <button
          onClick={buy}
          disabled={loading}
          className="px-5 py-2 bg-mc-gold2 text-mc-bg font-bold text-sm rounded-sm block-shadow hover:bg-mc-gold disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kup"}
        </button>
      </div>
    </div>
  );
}
