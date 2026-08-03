import { useState, useEffect, useCallback } from "react";
import { Gift, Check, Loader2, Sparkles, Coins, Gem, Key, Crown, Diamond, Lock } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import SectionHeader from "./SectionHeader";
import { useReveal } from "../hooks/useReveal";

interface RewardTier {
  day: number;
  label: string;
  sublabel?: string;
  amount: number;
  icon: string;
}

interface DailyRewardState {
  streak: number;
  last_claimed_date: string | null;
  total_claimed: number;
  can_claim: boolean;
  next_day: number;
  current_streak_day: number;
  rewards: RewardTier[];
}

const ICON_MAP: Record<string, React.ReactNode> = {
  coins: <Coins className="w-5 h-5" />,
  gem: <Gem className="w-5 h-5" />,
  key: <Key className="w-5 h-5" />,
  "key-gold": <Key className="w-5 h-5" />,
  diamond: <Diamond className="w-5 h-5" />,
  crown: <Crown className="w-5 h-5" />,
};

const STATIC_REWARDS: RewardTier[] = [
  { day: 1, label: "500 monet", amount: 500, icon: "coins" },
  { day: 2, label: "10 szmaragdów", amount: 10, icon: "gem" },
  { day: 3, label: "1 klucz zwykły", amount: 1, icon: "key" },
  { day: 4, label: "1000 monet", amount: 1000, icon: "coins" },
  { day: 5, label: "16 diamentów", amount: 16, icon: "diamond" },
  { day: 6, label: "1 klucz złoty", amount: 1, icon: "key-gold" },
  { day: 7, label: "Zestaw Legendy", sublabel: "2000 monet + 20 szmaragdów + 1 klucz złoty", amount: 1, icon: "crown" },
];

export default function DailyRewardsSection({
  onAuthClick,
}: {
  onAuthClick: (mode: "signin" | "signup") => void;
}) {
  const { user } = useAuth();
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [state, setState] = useState<DailyRewardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimedReward, setClaimedReward] = useState<RewardTier | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke("claim-daily-reward", {
      method: "GET",
    });
    if (!error && data) {
      setState(data as DailyRewardState);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      load();
    } else {
      setLoading(false);
    }
  }, [load, user]);

  const claim = async () => {
    if (!state?.can_claim) return;
    setClaiming(true);

    const { data, error } = await supabase.functions.invoke("claim-daily-reward", {
      method: "POST",
    });

    setClaiming(false);

    if (error || (data && data.error)) {
      const msg = data?.error ?? error?.message ?? "Nie udało się odebrać nagrody.";
      alert(msg);
      return;
    }

    if (data?.reward) {
      setClaimedReward(data.reward);
      setTimeout(() => setClaimedReward(null), 3000);
    }

    load();
  };

  const rewards = state?.rewards ?? STATIC_REWARDS;
  const currentDay = user ? (state?.current_streak_day ?? 1) : 0;
  const canClaim = user ? (state?.can_claim ?? false) : false;
  const streak = state?.streak ?? 0;

  return (
    <section id="rewards" className="relative py-24 md:py-32 px-5 md:px-8">
      <div
        ref={ref}
        className={`max-w-5xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <SectionHeader
          tag="Nagrody"
          title="Nagrody za codzienne logowanie"
          subtitle="Wracaj codziennie, aby utrzymać serię i odbierać coraz lepsze nagrody. Siódmego dnia czeka duży zestaw!"
        />

        <div className="mt-12 bg-mc-panel border-2 border-mc-border rounded-sm p-6 md:p-8 relative overflow-hidden">
          {/* Streak indicator for logged-in users */}
          {user && !loading && (
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-mc-gold" />
                <span className="text-sm text-mc-text">
                  Twoja seria: <span className="font-minecraft text-mc-gold">{streak}</span> dni
                </span>
              </div>
              {state && state.total_claimed > 0 && (
                <span className="text-xs text-mc-dim">
                  Łącznie odebranych nagród: {state.total_claimed}
                </span>
              )}
            </div>
          )}

          {/* 7-day calendar */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 md:gap-3">
            {rewards.map((reward, i) => {
              const isClaimed = user && !loading && (reward.day < currentDay || (!canClaim && reward.day === currentDay));
              const isToday = user && !loading && reward.day === currentDay && canClaim;
              const isLocked = !user || loading;

              return (
                <div
                  key={reward.day}
                  className={`relative rounded-sm p-3 md:p-4 text-center border-2 transition-all ${
                    isToday
                      ? "border-mc-green bg-mc-green2/10 animate-glow"
                      : isClaimed
                        ? "border-mc-border bg-mc-bg/50 opacity-60"
                        : isLocked
                          ? "border-mc-border bg-mc-bg/30"
                          : "border-mc-border bg-mc-bg/30 hover:border-mc-green/50"
                  }`}
                  style={{ animation: visible ? `slideUp 0.5s ease-out ${i * 0.08}s both` : undefined }}
                >
                  <div className="text-[10px] md:text-xs font-bold text-mc-dim uppercase mb-1.5">
                    Dzień {reward.day}
                  </div>
                  <div className={`flex justify-center mb-1.5 ${
                    isToday ? "text-mc-green" : isClaimed ? "text-mc-dim" : reward.day === 7 ? "text-mc-gold" : "text-mc-text/70"
                  }`}>
                    {ICON_MAP[reward.icon] ?? <Sparkles className="w-5 h-5 md:w-6 md:h-6" />}
                  </div>
                  <div className="text-[9px] md:text-[10px] text-mc-text/60 leading-tight">{reward.label}</div>
                  {reward.sublabel && (
                    <div className="text-[7px] md:text-[8px] text-mc-gold/70 leading-tight mt-0.5">{reward.sublabel}</div>
                  )}

                  {isClaimed && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-mc-green rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-mc-bg" />
                    </div>
                  )}
                  {isLocked && reward.day === 7 && (
                    <div className="absolute top-1.5 right-1.5 text-mc-gold">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action area */}
          <div className="mt-6">
            {!user ? (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-mc-text/60 mb-4">
                  <Lock className="w-4 h-4" />
                  Zaloguj się, aby odbierać nagrody każdego dnia
                </div>
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
              <div className="flex justify-center py-2">
                <Loader2 className="w-6 h-6 animate-spin text-mc-green" />
              </div>
            ) : (
              <button
                onClick={claim}
                disabled={!canClaim || claiming}
                className={`w-full py-3 font-bold rounded-sm text-sm flex items-center justify-center gap-2 transition-all ${
                  canClaim
                    ? "bg-mc-green2 text-mc-bg block-shadow hover:bg-mc-green"
                    : "bg-mc-bg border border-mc-border text-mc-dim cursor-not-allowed"
                }`}
              >
                {claiming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : canClaim ? (
                  <>
                    <Gift className="w-4 h-4" />
                    Odbierz nagrodę na dzień {currentDay}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Nagrodę na dziś odebrano — wróć jutro!
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Claim animation overlay */}
      {claimedReward && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none animate-slideUp">
          <div className="bg-mc-panel border-2 border-mc-green rounded-sm p-8 text-center block-shadow max-w-xs">
            <div className="w-16 h-16 mx-auto mb-4 bg-mc-green2/15 flex items-center justify-center rounded-sm text-mc-green animate-glow">
              {ICON_MAP[claimedReward.icon] ?? <Sparkles className="w-8 h-8" />}
            </div>
            <p className="text-xs uppercase tracking-widest text-mc-dim mb-2">Odebrano!</p>
            <p className="font-minecraft text-base text-mc-green mb-1">{claimedReward.label}</p>
            <p className="text-xs text-mc-text/60">Dzień {currentDay} · Seria: {streak}</p>
          </div>
        </div>
      )}
    </section>
  );
}
