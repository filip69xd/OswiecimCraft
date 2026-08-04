import { useState, useEffect, useCallback } from "react";
import { Trophy, Coins, ShoppingBag, Crown, Loader2, Medal } from "lucide-react";
import { supabase } from "../lib/supabase";
import SectionHeader from "./SectionHeader";
import { useReveal } from "../hooks/useReveal";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  coins_spent: number;
  coin_purchases_count: number;
  money_spent: number;
  shop_purchases_count: number;
  last_active: string;
}

type SortBy = "coins" | "money" | "activity";

const SORT_OPTIONS: { key: SortBy; label: string }[] = [
  { key: "coins", label: "Najwięcej monet wydanych" },
  { key: "money", label: "Najwięcej złotych wydanych" },
  { key: "activity", label: "Najnowsza aktywność" },
];

const RANK_COLORS = ["#fbbf24", "#cbd5e1", "#d97706"];
const RANK_ICONS = [
  <Crown key="1" className="w-4 h-4" />,
  <Medal key="2" className="w-4 h-4" />,
  <Medal key="3" className="w-4 h-4" />,
];

export default function Leaderboard() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>("coins");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_player_leaderboard", { limit_count: 20 });
    if (!error && data) {
      setEntries(data as LeaderboardEntry[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = [...entries].sort((a, b) => {
    if (sortBy === "coins") return b.coins_spent - a.coins_spent;
    if (sortBy === "money") return Number(b.money_spent) - Number(a.money_spent);
    return new Date(b.last_active).getTime() - new Date(a.last_active).getTime();
  });

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <section id="leaderboard" className="relative py-24 md:py-32 px-5 md:px-8">
      <div
        ref={ref}
        className={`max-w-4xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <SectionHeader
          tag="Ranking graczy"
          title="Tablica wyników"
          subtitle="Najbardziej aktywni gracze naszego serwera. Kto wydał najwięcej monet i wesprzał serwer? Sprawdź, czy jesteś na liście!"
        />

        {/* Sort toggle */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`px-4 py-2 text-xs font-bold rounded-sm border-2 transition-colors ${
                sortBy === opt.key
                  ? "bg-mc-green2 text-mc-bg border-mc-green2"
                  : "bg-mc-panel text-mc-dim border-mc-border hover:text-mc-text hover:border-mc-green"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-mc-green" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="mt-12 text-center">
            <Trophy className="w-12 h-12 text-mc-dim mx-auto mb-4" />
            <p className="text-sm text-mc-text/60">
              Ranking jest jeszcze pusty. Bądź pierwszym graczem na liście!
            </p>
          </div>
        ) : (
          <>
            {/* Podium - top 3 */}
            {top3.length > 0 && (
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {top3.map((entry, i) => (
                  <div
                    key={entry.user_id}
                    className="bg-mc-panel border-2 rounded-sm p-5 text-center card-hover"
                    style={{
                      borderColor: i === 0 ? "#fbbf24" : i === 1 ? "#cbd5e1" : "#d97706",
                      animation: visible ? `slideUp 0.5s ease-out ${i * 0.1}s both` : undefined,
                    }}
                  >
                    <div
                      className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-sm"
                      style={{ backgroundColor: `${RANK_COLORS[i]}20`, color: RANK_COLORS[i] }}
                    >
                      {RANK_ICONS[i]}
                    </div>
                    <p className="font-minecraft text-lg" style={{ color: RANK_COLORS[i] }}>
                      #{i + 1}
                    </p>
                    <p className="text-sm text-mc-text font-bold mt-1 mb-3 break-all">
                      {entry.display_name}
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-center gap-1.5 text-xs">
                        <Coins className="w-3.5 h-3.5 text-mc-gold" />
                        <span className="text-mc-text/80">
                          {entry.coins_spent.toLocaleString("pl-PL")} monet
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-xs">
                        <ShoppingBag className="w-3.5 h-3.5 text-mc-green" />
                        <span className="text-mc-text/80">
                          {Number(entry.money_spent).toFixed(2)} zł
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rest of the list */}
            {rest.length > 0 && (
              <div className="mt-6 bg-mc-panel border-2 border-mc-border rounded-sm overflow-hidden">
                {rest.map((entry, i) => {
                  const rank = i + 4;
                  return (
                    <div
                      key={entry.user_id}
                      className={`flex items-center justify-between p-4 ${
                        i % 2 === 0 ? "bg-mc-bg/30" : ""
                      } ${i < rest.length - 1 ? "border-b border-mc-border" : ""}`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="font-minecraft text-sm text-mc-dim w-8 text-center flex-shrink-0">
                          #{rank}
                        </span>
                        <span className="text-sm text-mc-text font-bold truncate">
                          {entry.display_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Coins className="w-3.5 h-3.5 text-mc-gold" />
                          <span className="text-mc-text/80">
                            {entry.coins_spent.toLocaleString("pl-PL")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <ShoppingBag className="w-3.5 h-3.5 text-mc-green" />
                          <span className="text-mc-text/80">
                            {Number(entry.money_spent).toFixed(2)} zł
                          </span>
                        </div>
                        <span className="text-[10px] text-mc-dim hidden sm:inline">
                          {new Date(entry.last_active).toLocaleDateString("pl-PL")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
