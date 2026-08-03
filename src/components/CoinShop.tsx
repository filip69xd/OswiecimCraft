import { useState, useEffect, useCallback } from "react";
import { Coins, Gem, Diamond, Loader2, Check, Sparkles, Palette, Feather, Utensils, Map, Shuffle, Dog, ShoppingBag, Package, MessageCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { SERVER } from "../data";
import SectionHeader from "./SectionHeader";
import { useReveal } from "../hooks/useReveal";

interface CoinShopItem {
  item_key: string;
  name: string;
  description: string;
  icon: string;
  price_currency: string;
  price_amount: number;
  category: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  palette: <Palette className="w-6 h-6" />,
  sparkles: <Sparkles className="w-6 h-6" />,
  hat: <ShoppingBag className="w-6 h-6" />,
  feather: <Feather className="w-6 h-6" />,
  utensils: <Utensils className="w-6 h-6" />,
  map: <Map className="w-6 h-6" />,
  shuffle: <Shuffle className="w-6 h-6" />,
  dog: <Dog className="w-6 h-6" />,
  package: <Package className="w-6 h-6" />,
  crown: <Sparkles className="w-6 h-6" />,
};

const CATEGORY_LABEL: Record<string, string> = {
  cosmetic: "Kosmetyki",
  boost: "Ulepszenia",
  utility: "Użytkowe",
};

const CURRENCY_META: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  coins: { icon: <Coins className="w-4 h-4" />, color: "#fbbf24", label: "monet" },
  gems: { icon: <Gem className="w-4 h-4" />, color: "#22c55e", label: "szmaragdów" },
  diamonds: { icon: <Diamond className="w-4 h-4" />, color: "#38bdf8", label: "diamentów" },
};

export default function CoinShop({
  onAuthClick,
}: {
  onAuthClick: (mode: "signin" | "signup") => void;
}) {
  const { user } = useAuth();
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [items, setItems] = useState<CoinShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<{ coins: number; gems: number; diamonds: number }>({ coins: 0, gems: 0, diamonds: 0 });
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [purchasedItem, setPurchasedItem] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke("spend-coins", {
      method: "GET",
    });
    if (!error && data?.items) {
      setItems(data.items);
    }
    setLoading(false);
  }, []);

  const loadWallet = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("player_wallets")
      .select("coins, gems, diamonds")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!error && data) {
      setWallet({
        coins: Number(data.coins ?? 0),
        gems: Number(data.gems ?? 0),
        diamonds: Number(data.diamonds ?? 0),
      });
    }
  }, [user]);

  useEffect(() => {
    loadItems();
    loadWallet();
  }, [loadItems, loadWallet]);

  const buy = async (item: CoinShopItem) => {
    if (!user) {
      onAuthClick("signin");
      return;
    }
    setPurchasing(item.item_key);
    setError(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      onAuthClick("signin");
      setPurchasing(null);
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spend-coins`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ itemKey: item.item_key }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Nie udało się kupić");
      }
      const currency = data.currency ?? item.price_currency;
      const balanceKey = `${currency}_remaining`;
      setWallet((prev) => ({ ...prev, [currency]: data[balanceKey] ?? 0 }));
      setPurchasedItem(item.item_key);
      setTimeout(() => setPurchasedItem(null), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się kupić przedmiotu.");
    }
    setPurchasing(null);
  };

  const grouped = items.reduce<Record<string, CoinShopItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const categoryOrder = ["cosmetic", "boost", "utility"];

  return (
    <section id="coin-shop" className="relative py-24 md:py-32 px-5 md:px-8">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <SectionHeader
          tag="Sklep za waluty"
          title="Wydaj swoje waluty"
          subtitle="Odbieraj nagrody codzienne, zbieraj monety, szmaragdy i diamenty, a potem wymieniaj je na kosmetyki, ulepszenia i bonusy w grze."
        />

        {/* Balance display */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {(["coins", "gems", "diamonds"] as const).map((cur) => {
            const meta = CURRENCY_META[cur];
            return (
              <div
                key={cur}
                className="flex items-center gap-2.5 px-5 py-3 bg-mc-panel border-2 rounded-sm"
                style={{ borderColor: `${meta.color}40` }}
              >
                <span style={{ color: meta.color }}>{meta.icon}</span>
                <span className="font-minecraft text-lg text-mc-text">
                  {user ? wallet[cur].toLocaleString("pl-PL") : "—"}
                </span>
                <span className="text-sm text-mc-dim">{meta.label}</span>
              </div>
            );
          })}
        </div>

        {!user ? (
          <div className="mt-10 text-center">
            <p className="text-sm text-mc-text/60 mb-4">
              Zaloguj się, aby przeglądać sklep i wydawać waluty.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => onAuthClick("signin")}
                className="px-6 py-3 bg-mc-green2 text-mc-bg font-bold rounded-sm block-shadow hover:bg-mc-green text-sm"
              >
                Zaloguj się
              </button>
              <button
                onClick={() => onAuthClick("signup")}
                className="px-6 py-3 bg-mc-panel border-2 border-mc-border text-mc-text font-bold rounded-sm hover:border-mc-green text-sm transition-colors"
              >
                Załóż konto
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="mt-10 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-mc-green" />
          </div>
        ) : (
          <>
            {error && (
              <p className="mt-6 text-center text-sm text-red-400">{error}</p>
            )}
            {categoryOrder.map((cat) => {
              const catItems = grouped[cat];
              if (!catItems || catItems.length === 0) return null;
              return (
                <div key={cat} className="mt-10">
                  <h3 className="font-minecraft text-sm text-mc-gold mb-4">
                    {CATEGORY_LABEL[cat] ?? cat}
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catItems.map((item, i) => {
                      const currency = item.price_currency ?? "coins";
                      const meta = CURRENCY_META[currency] ?? CURRENCY_META.coins;
                      const balance = wallet[currency as keyof typeof wallet] ?? 0;
                      const canAfford = balance >= item.price_amount;
                      const isPurchasing = purchasing === item.item_key;
                      const justBought = purchasedItem === item.item_key;
                      return (
                        <div
                          key={item.item_key}
                          className="bg-mc-panel border-2 border-mc-border rounded-sm p-5 flex flex-col card-hover"
                          style={{ animation: visible ? `slideUp 0.5s ease-out ${i * 0.06}s both` : undefined }}
                        >
                          <div
                            className="w-11 h-11 flex items-center justify-center rounded-sm mb-4"
                            style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                          >
                            {ICON_MAP[item.icon] ?? <Sparkles className="w-6 h-6" />}
                          </div>
                          <h4 className="font-bold text-mc-text text-sm mb-1.5">{item.name}</h4>
                          <p className="text-xs text-mc-text/60 leading-relaxed mb-5 flex-1">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span style={{ color: meta.color }}>{meta.icon}</span>
                              <span className="font-minecraft text-sm" style={{ color: meta.color }}>
                                {item.price_amount}
                              </span>
                            </div>
                            <button
                              onClick={() => buy(item)}
                              disabled={!canAfford || isPurchasing}
                              className={`px-4 py-2 font-bold text-xs rounded-sm flex items-center gap-1.5 transition-all ${
                                justBought
                                  ? "bg-mc-green2 text-mc-bg"
                                  : canAfford
                                    ? "bg-mc-gold2 text-mc-bg block-shadow hover:bg-mc-gold"
                                    : "bg-mc-bg border border-mc-border text-mc-dim cursor-not-allowed"
                              }`}
                            >
                              {isPurchasing ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : justBought ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  Kupiono!
                                </>
                              ) : canAfford ? (
                                "Kup"
                              ) : (
                                "Za mało"
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {user && !loading && items.length > 0 && (
          <div className="mt-10 max-w-xl mx-auto bg-mc-panel border-2 border-mc-border rounded-sm p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-mc-green" />
              <h4 className="font-minecraft text-sm text-mc-text">Odbiór zakupów</h4>
            </div>
            <p className="text-xs text-mc-text/70 leading-relaxed">
              Po zakupie zgłoś się na naszym Discordzie na kanale{" "}
              <span className="text-mc-green font-bold">#odbior-zakupow</span>, aby administracja
              mogła nadać Ci przedmiot lub bonus w grze. Dołącz:{" "}
              <a href={SERVER.discord} target="_blank" rel="noopener noreferrer" className="text-mc-green underline hover:text-mc-green2">
                {SERVER.discord}
              </a>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
