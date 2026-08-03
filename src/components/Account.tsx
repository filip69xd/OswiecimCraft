import { useEffect, useState } from "react";
import { User, Package, Crown, Key, Loader2, LogOut, CheckCircle2, Clock, Coins, Gem, Diamond, Pencil, Check } from "lucide-react";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import SectionHeader from "./SectionHeader";

interface Purchase {
  id: string;
  item_id: string;
  item_name: string;
  item_type: string;
  price: number;
  status: string;
  created_at: string;
}

export default function Account({
  onAuthClick,
}: {
  onAuthClick: (mode: "signin" | "signup") => void;
}) {
  const { user, signOut, loading } = useAuth();

  if (loading) return null;
  if (!user) {
    return (
      <section id="account" className="py-24 px-5 md:px-8 bg-mc-panel/30 border-y border-mc-border">
        <div className="max-w-2xl mx-auto text-center">
          <SectionHeader tag="Konto" title="Twój panel gracza" />
          <p className="text-sm text-mc-text/70 mt-6 mb-8">
            Zaloguj się, aby przeglądać historię zakupów, zarządzać rangami i ponawiać wsparcie.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onAuthClick("signin")}
              className="px-8 py-3 bg-mc-green2 text-mc-bg font-bold rounded-sm block-shadow hover:bg-mc-green text-sm"
            >
              Zaloguj się
            </button>
            <button
              onClick={() => onAuthClick("signup")}
              className="px-8 py-3 bg-mc-panel border-2 border-mc-border text-mc-text font-bold rounded-sm hover:border-mc-green text-sm"
            >
              Załóż konto
            </button>
          </div>
        </div>
      </section>
    );
  }

  return <PlayerPanel onSignOut={signOut} />;
}

function PlayerPanel({ onSignOut }: { onSignOut: () => void }) {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [wallet, setWallet] = useState<{ coins: number; gems: number; diamonds: number; keys_basic: number; keys_gold: number; nickname?: string | null } | null>(null);
  const [nickInput, setNickInput] = useState("");
  const [editingNick, setEditingNick] = useState(false);
  const [savingNick, setSavingNick] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select("id, item_id, item_name, item_type, price, status, created_at")
        .eq("user_id", user?.id ?? "")
        .order("created_at", { ascending: false });
      if (error) {
        console.error(error);
      } else {
        setPurchases(data ?? []);
      }
      setLoadingPurchases(false);
    };
    load();
  }, [user?.id]);

  useEffect(() => {
    const loadWallet = async () => {
      const { data, error } = await supabase
        .from("player_wallets")
        .select("coins, gems, diamonds, keys_basic, keys_gold")
        .eq("user_id", user?.id ?? "")
        .maybeSingle();
      if (!error && data) {
        setWallet(data);
      }
    };
    loadWallet();
    const interval = setInterval(loadWallet, 10000);
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    if (wallet?.nickname !== undefined && !editingNick) {
      setNickInput(wallet.nickname ?? "");
    }
  }, [wallet?.nickname, editingNick]);

  const saveNickname = async () => {
    const trimmed = nickInput.trim();
    if (trimmed.length < 3 || trimmed.length > 16) {
      alert("Nick musi mieć od 3 do 16 znaków.");
      return;
    }
    setSavingNick(true);
    const { data: existing } = await supabase
      .from("player_wallets")
      .select("id")
      .eq("user_id", user?.id ?? "")
      .maybeSingle();
    if (existing) {
      await supabase.from("player_wallets").update({ nickname: trimmed }).eq("id", existing.id);
    } else {
      await supabase.from("player_wallets").insert({ user_id: user?.id, nickname: trimmed });
    }
    setSavingNick(false);
    setEditingNick(false);
    const { data: fresh } = await supabase
      .from("player_wallets")
      .select("coins, gems, diamonds, keys_basic, keys_gold, nickname")
      .eq("user_id", user?.id ?? "")
      .maybeSingle();
    if (fresh) setWallet(fresh);
  };

  const paidPurchases = purchases.filter((p) => p.status === "paid");
  const totalSpent = paidPurchases.reduce((sum, p) => sum + Number(p.price), 0);
  const ownedRanks = paidPurchases.filter((p) => p.item_type === "rank");
  const ownedKeys = paidPurchases.filter((p) => p.item_type === "key");

  return (
    <section id="account" className="py-24 px-5 md:px-8 bg-mc-panel/30 border-y border-mc-border">
      <div className="max-w-5xl mx-auto">
        <SectionHeader tag="Konto" title="Panel gracza" />

        {/* Player card */}
        <div className="mt-10 bg-mc-panel border-2 border-mc-border rounded-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-mc-green2/15 flex items-center justify-center rounded-sm">
                <User className="w-7 h-7 text-mc-green" />
              </div>
              <div>
                <p className="text-xs text-mc-dim uppercase tracking-widest mb-1">Nick w grze</p>
                {editingNick ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nickInput}
                      onChange={(e) => setNickInput(e.target.value)}
                      maxLength={16}
                      placeholder="Wpisz nick..."
                      className="bg-mc-bg border border-mc-border focus:border-mc-green rounded-sm px-3 py-1.5 text-sm text-mc-text placeholder:text-mc-dim outline-none w-44"
                      onKeyDown={(e) => e.key === "Enter" && saveNickname()}
                      autoFocus
                    />
                    <button
                      onClick={saveNickname}
                      disabled={savingNick}
                      className="p-1.5 bg-mc-green2 text-mc-bg rounded-sm hover:bg-mc-green disabled:opacity-50"
                    >
                      {savingNick ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-minecraft text-sm text-mc-text break-all">
                      {wallet?.nickname || "— ustaw nick —"}
                    </p>
                    <button
                      onClick={() => setEditingNick(true)}
                      className="p-1 text-mc-dim hover:text-mc-green transition-colors"
                      title="Zmień nick"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-mc-dim mt-1">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-mc-text/70 hover:text-red-400 bg-mc-bg border border-mc-border hover:border-red-400 rounded-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Wyloguj
            </button>
          </div>
        </div>

        {/* Wallet */}
        {wallet && (
          <div className="bg-mc-panel border-2 border-mc-gold2 rounded-sm p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Coins className="w-5 h-5 text-mc-gold" />
              <h3 className="font-minecraft text-sm text-mc-gold">Twój portfel</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <WalletItem icon={<Coins className="w-5 h-5" />} label="Monety" value={Number(wallet.coins ?? 0).toLocaleString("pl-PL")} color="#fbbf24" />
              <WalletItem icon={<Gem className="w-5 h-5" />} label="Szmaragdy" value={String(wallet.gems ?? 0)} color="#22c55e" />
              <WalletItem icon={<Diamond className="w-5 h-5" />} label="Diamenty" value={String(wallet.diamonds ?? 0)} color="#38bdf8" />
              <WalletItem icon={<Key className="w-5 h-5" />} label="Klucze zwykłe" value={String(wallet.keys_basic ?? 0)} color="#f97316" />
              <WalletItem icon={<Key className="w-5 h-5" />} label="Klucze złote" value={String(wallet.keys_gold ?? 0)} color="#eab308" />
            </div>
            <div className="mt-4">
              <a href="#coin-shop" className="text-xs text-mc-green hover:underline">Wydaj monety w sklepie →</a>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Crown className="w-5 h-5" />} label="Rangi" value={String(ownedRanks.length)} color="#fbbf24" />
          <StatCard icon={<Key className="w-5 h-5" />} label="Klucze" value={String(ownedKeys.length)} color="#38bdf8" />
          <StatCard icon={<Package className="w-5 h-5" />} label="Zakupy" value={String(paidPurchases.length)} color="#22c55e" />
          <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Wydano" value={`${totalSpent.toFixed(2)} zł`} color="#f97316" />
        </div>

        {/* Purchase history */}
        <div className="bg-mc-panel border-2 border-mc-border rounded-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-mc-border">
            <h3 className="font-minecraft text-sm text-mc-text">Historia zakupów</h3>
          </div>

          {loadingPurchases ? (
            <div className="p-10 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-mc-green" />
            </div>
          ) : purchases.length === 0 ? (
            <div className="p-10 text-center">
              <Package className="w-10 h-10 text-mc-dim mx-auto mb-3" />
              <p className="text-sm text-mc-text/60 mb-4">Nie masz jeszcze żadnych zakupów.</p>
              <a
                href="#shop"
                className="inline-block px-6 py-2.5 bg-mc-green2 text-mc-bg font-bold text-sm rounded-sm block-shadow hover:bg-mc-green"
              >
                Przejdź do sklepu
              </a>
            </div>
          ) : (
            <div className="divide-y divide-mc-border">
              {purchases.map((p) => (
                <div key={p.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-sm"
                      style={{
                        backgroundColor: p.item_type === "rank" ? "#fbbf2420" : "#38bdf820",
                        color: p.item_type === "rank" ? "#fbbf24" : "#38bdf8",
                      }}
                    >
                      {p.item_type === "rank" ? <Crown className="w-5 h-5" /> : <Key className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-mc-text">{p.item_name}</p>
                      <p className="text-xs text-mc-dim">
                        {new Date(p.created_at).toLocaleDateString("pl-PL", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-minecraft text-sm text-mc-gold">{Number(p.price).toFixed(2)} zł</span>
                    {p.status === "paid" ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-mc-green bg-mc-green2/10 px-3 py-1.5 rounded-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Opłacone
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-mc-gold bg-mc-gold2/10 px-3 py-1.5 rounded-sm">
                        <Clock className="w-3.5 h-3.5" />
                        Oczekuje
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function WalletItem({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 flex items-center justify-center rounded-sm" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-mc-dim font-bold">{label}</p>
        <p className="font-minecraft text-sm text-mc-text">{value}</p>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-mc-panel border-2 border-mc-border rounded-sm p-5">
      <div className="flex items-center gap-2 mb-3" style={{ color }}>
        {icon}
        <span className="text-xs uppercase tracking-widest text-mc-dim font-bold">{label}</span>
      </div>
      <p className="font-minecraft text-lg text-mc-text">{value}</p>
    </div>
  );
}
